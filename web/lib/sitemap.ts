import type { MetadataRoute } from "next";

export const STATIC_SITEMAP_ROUTES = [
  "/",
  "/predictions",
  "/players",
  "/compare",
  "/rankings/atp",
  "/rankings/elo",
  "/tournaments",
  "/model",
  "/feature-importance",
  "/about-project"
] as const;

const MAX_PLAYER_URLS = 100;
const FALLBACK_SITE_URL = "https://atpinsight-two.vercel.app";

type PlayerRow = {
  player_id?: unknown;
  player_name?: unknown;
  atp_rank?: unknown;
  is_active?: unknown;
};

type TournamentRow = {
  tournament_id?: unknown;
  tournament_slug?: unknown;
  tournament_name?: unknown;
  year?: unknown;
  start_date?: unknown;
  tournament_date?: unknown;
  end_date?: unknown;
};

export type BuildSitemapInput = {
  siteUrl?: string;
  players: PlayerRow[];
  tournaments: TournamentRow[];
  tournamentPartitionKeys: string[];

  // Kept optional for backwards compatibility with the previous builder call.
  // Match-level inputs are deliberately ignored because detail pages are no
  // longer promoted through the sitemap.
  matches?: unknown[];
  statistics?: unknown;
  currentYear?: number;
  latestRankingDate?: string | null;
};

type RankedPlayer = {
  playerId: string;
  rank: number;
};

type PublishedTournament = {
  slug: string;
  dateKey: string;
};

export function buildSitemapEntries(input: BuildSitemapInput): MetadataRoute.Sitemap {
  const siteUrl = normalizeSiteUrl(input.siteUrl ?? FALLBACK_SITE_URL);
  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) => ({
    url: new URL(route, siteUrl).toString()
  }));

  const playerEntries: MetadataRoute.Sitemap = selectTopPlayers(input.players).map(({ playerId }) => ({
    url: new URL(`/players/${encodeURIComponent(playerId)}`, siteUrl).toString()
  }));

  const currentYear = resolveCurrentTournamentYear(input.tournaments, input.currentYear);
  const tournamentEntries: MetadataRoute.Sitemap = selectPublishedTournaments(
    input.tournaments,
    input.tournamentPartitionKeys,
    currentYear
  ).map(({ slug }) => ({
    url: new URL(`/tournaments/${encodeURIComponent(slug)}`, siteUrl).toString()
  }));

  return deduplicateEntries([...staticEntries, ...playerEntries, ...tournamentEntries]);
}

function normalizeSiteUrl(value: string): string {
  const url = new URL(value);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function selectTopPlayers(players: PlayerRow[]): RankedPlayer[] {
  const eligiblePlayers = players
    .map((row) => ({
      playerId: normalize(row.player_id),
      playerName: normalize(row.player_name),
      rank: parsePositiveInteger(row.atp_rank),
      active: truthy(row.is_active)
    }))
    .filter(
      (player): player is RankedPlayer & { playerName: string; active: true } =>
        player.active &&
        player.rank !== null &&
        validSegment(player.playerId) &&
        hasText(player.playerName)
    )
    .sort((left, right) => left.rank - right.rank || left.playerId.localeCompare(right.playerId));

  const uniquePlayers = new Map<string, RankedPlayer>();

  for (const player of eligiblePlayers) {
    if (!uniquePlayers.has(player.playerId)) {
      uniquePlayers.set(player.playerId, {
        playerId: player.playerId,
        rank: player.rank
      });
    }

    if (uniquePlayers.size === MAX_PLAYER_URLS) {
      break;
    }
  }

  return Array.from(uniquePlayers.values());
}

function selectPublishedTournaments(
  tournaments: TournamentRow[],
  tournamentPartitionKeys: string[],
  currentYear: number | null
): PublishedTournament[] {
  if (currentYear === null) {
    return [];
  }

  const partitionKeys = new Set(
    tournamentPartitionKeys.map(normalize).filter((key) => validSegment(key))
  );

  const uniqueTournaments = new Map<string, PublishedTournament>();

  for (const row of tournaments) {
    const year = parsePositiveInteger(row.year);
    const tournamentId = normalize(row.tournament_id);
    const slug = normalize(row.tournament_slug);
    const name = normalize(row.tournament_name);

    if (
      year !== currentYear ||
      !validSegment(tournamentId) ||
      !validSegment(slug) ||
      !hasText(name) ||
      !partitionKeys.has(slug)
    ) {
      continue;
    }

    const tournament: PublishedTournament = {
      slug,
      dateKey: firstValidDateKey(row.start_date, row.tournament_date, row.end_date)
    };

    const previous = uniqueTournaments.get(slug);
    if (!previous || tournament.dateKey < previous.dateKey) {
      uniqueTournaments.set(slug, tournament);
    }
  }

  return Array.from(uniqueTournaments.values()).sort(
    (left, right) => left.dateKey.localeCompare(right.dateKey) || left.slug.localeCompare(right.slug)
  );
}

function resolveCurrentTournamentYear(tournaments: TournamentRow[], configuredYear?: number): number | null {
  if (Number.isInteger(configuredYear) && Number(configuredYear) > 0) {
    return Number(configuredYear);
  }

  const years = tournaments
    .map((row) => parsePositiveInteger(row.year))
    .filter((year): year is number => year !== null);

  return years.length > 0 ? Math.max(...years) : null;
}

function deduplicateEntries(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const uniqueEntries = new Map(entries.map((entry) => [entry.url, entry]));
  return Array.from(uniqueEntries.values());
}

function firstValidDateKey(...values: unknown[]): string {
  for (const value of values) {
    const normalized = normalize(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return normalized;
    }
  }

  return "9999-12-31";
}

function parsePositiveInteger(value: unknown): number | null {
  const parsed = Number(normalize(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().replace(/\.0$/, "");
}

function hasText(value: unknown): boolean {
  const normalized = normalize(value).toLowerCase();
  return normalized !== "" && normalized !== "nan" && normalized !== "n/a";
}

function validSegment(value: unknown): boolean {
  const normalized = normalize(value);
  return hasText(normalized) && !/[/?#]/.test(normalized);
}

function truthy(value: unknown): boolean {
  return ["true", "1", "yes"].includes(normalize(value).toLowerCase());
}
