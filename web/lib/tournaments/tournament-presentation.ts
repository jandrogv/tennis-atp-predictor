import type { TournamentDetail, TournamentMatch } from "../data/types.ts";

export type TournamentFilters = {
  query: string;
  surface: string;
  year: string;
};

export type TournamentMonthGroup = {
  key: string;
  label: string;
  tournaments: TournamentDetail[];
};

export type TournamentImageEntry = {
  image: string;
  isFallback: boolean;
  sourceReference: string;
  pendingReason?: string;
  alt?: string;
  credit?: { author: string; license: string; sourceUrl: string };
};

export type TournamentImageManifest = {
  schemaVersion: 1;
  fallbacks: Record<"Hard" | "Clay" | "Grass" | "Carpet", string>;
  tournaments: Record<string, TournamentImageEntry>;
};

export type FeaturedTournaments = {
  kind: "active" | "next" | "empty";
  tournaments: TournamentDetail[];
};

export type TournamentStatus = "Upcoming" | "In progress" | "Completed";

export function resolveTournamentYear(requestedYear: string | null, currentDate: string): string {
  return requestedYear === "all" || (requestedYear !== null && /^[1-9]\d{3}$/.test(requestedYear))
    ? requestedYear
    : currentDate.slice(0, 4);
}

export function getTournamentDrawMatches(matches: TournamentMatch[]): TournamentMatch[] {
  return matches.filter((match) => ![match.round, match.round_display, match.round_raw]
    .some((round) => /qualif/i.test(round ?? "")));
}

export function getDrawStageWindow(stages: number[], selectedIndex: number, limit: 3 | 4): number[] {
  const size = Math.min(limit, stages.length);
  const start = Math.max(0, Math.min(selectedIndex - 1, stages.length - size));
  return stages.slice(start, start + size);
}

export function filterTournaments(tournaments: TournamentDetail[], filters: TournamentFilters): TournamentDetail[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return tournaments
    .filter((tournament) => filters.surface === "all" || tournament.surface === filters.surface)
    .filter((tournament) => filters.year === "all" || tournament.year === filters.year)
    .filter((tournament) => !normalizedQuery || tournament.tournament_name.toLowerCase().includes(normalizedQuery))
    .sort(compareTournaments);
}

export function getFeaturedTournaments(tournaments: TournamentDetail[], currentDate: string): FeaturedTournaments {
  const today = dateOnlyValue(currentDate);
  if (today === null) {
    return { kind: "empty", tournaments: [] };
  }

  const active = tournaments
    .filter((tournament) => getTournamentStatus(tournament, currentDate) === "In progress")
    .sort(compareTournaments);
  if (active.length > 0) {
    return { kind: "active", tournaments: active };
  }

  const next = tournaments
    .filter((tournament) => {
      const start = tournamentDateValue(tournament, "start");
      return start !== null && start > today;
    })
    .sort(compareTournaments)[0];

  return next ? { kind: "next", tournaments: [next] } : { kind: "empty", tournaments: [] };
}

export function getTournamentStatus(tournament: TournamentDetail, currentDate: string): TournamentStatus | null {
  const today = dateOnlyValue(currentDate);
  const start = tournamentDateValue(tournament, "start");
  const end = tournamentDateValue(tournament, "end");
  if (today === null || start === null || end === null) return null;
  if (today < start) return "Upcoming";
  if (today > end) return "Completed";
  return "In progress";
}

export function groupTournamentsByStartMonth(tournaments: TournamentDetail[]): TournamentMonthGroup[] {
  const groups = new Map<string, TournamentDetail[]>();
  for (const tournament of [...tournaments].sort(compareTournaments)) {
    const date = tournamentStartDate(tournament);
    const timestamp = dateOnlyValue(date);
    if (timestamp === null) continue;
    const key = new Date(timestamp).toISOString().slice(0, 7);
    const current = groups.get(key) ?? [];
    current.push(tournament);
    groups.set(key, current);
  }

  return Array.from(groups.entries()).map(([key, group]) => ({
    key,
    label: new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(`${key}-01T00:00:00Z`)),
    tournaments: group
  }));
}

export function getTournamentImage(
  tournament: TournamentDetail,
  manifest: TournamentImageManifest
): TournamentImageEntry & { fallbackImage: string } {
  const eventId = tournament.tournament_id.match(/^\d{4}-(\d+)$/)?.[1] ?? tournament.tournament_id;
  const exact = manifest.tournaments[eventId];
  const surface = normalizeSurface(tournament.surface);
  const fallbackImage = manifest.fallbacks[surface];
  if (exact) return { ...exact, fallbackImage };
  return {
    image: fallbackImage,
    fallbackImage,
    isFallback: true,
    sourceReference: `surface-fallback:${surface.toLowerCase()}`
  };
}

export function compareTournaments(a: TournamentDetail, b: TournamentDetail): number {
  const dateA = tournamentDateValue(a, "start") ?? Number.MAX_SAFE_INTEGER;
  const dateB = tournamentDateValue(b, "start") ?? Number.MAX_SAFE_INTEGER;
  if (dateA !== dateB) return dateA - dateB;
  return a.tournament_name.localeCompare(b.tournament_name);
}

function tournamentDateValue(tournament: TournamentDetail, boundary: "start" | "end"): number | null {
  if (boundary === "start") return dateOnlyValue(tournamentStartDate(tournament));
  return dateOnlyValue(tournament.end_date || tournamentStartDate(tournament));
}

function tournamentStartDate(tournament: TournamentDetail): string {
  return tournament.start_date || tournament.tournament_date;
}

function dateOnlyValue(value: string): number | null {
  const normalized = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  const timestamp = Date.parse(`${normalized}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalizeSurface(surface: string): "Hard" | "Clay" | "Grass" | "Carpet" {
  const normalized = surface.trim().toLowerCase();
  if (normalized === "clay") return "Clay";
  if (normalized === "grass") return "Grass";
  if (normalized === "carpet") return "Carpet";
  return "Hard";
}
