import Link from "next/link";
import { MetricCard } from "@/components/cards/MetricCard";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataValue, NumericValue } from "@/components/ui/data-value";
import { EloEvolutionCharts } from "@/components/players/EloEvolutionCharts";
import { RecentFormStrip } from "@/components/players/RecentFormStrip";
import type {
  MatchCard,
  PlayerEloHistory,
  PlayerProfile,
  PlayerRanking,
  PlayerRecentMatch,
  PlayerSurfaceEloHistory,
  PlayerSurfaceSummary
} from "@/lib/data/types";
import { formatDate, formatNumber, formatNullable, formatPercent, formatRanking } from "@/lib/formatters";
import { getPlayerProfilePath, getPredictionDetailPath, normalizePlayerId } from "@/lib/routes";

export function PlayerProfileView({
  profile,
  ranking,
  relatedMatches,
  eloHistory,
  surfaceEloHistory,
  recentMatches,
  surfaceSummary,
  playerNameById
}: {
  profile: PlayerProfile;
  ranking?: PlayerRanking;
  relatedMatches: MatchCard[];
  eloHistory: PlayerEloHistory[];
  surfaceEloHistory: PlayerSurfaceEloHistory[];
  recentMatches: PlayerRecentMatch[];
  surfaceSummary: PlayerSurfaceSummary[];
  playerNameById: Record<string, string>;
}) {
  const active = profile.is_active.toLowerCase() === "true";
  const winLossRecord = formatWinLoss(profile);
  const currentSurfaceEloAvailable = hasAnyCurrentSurfaceElo(ranking);
  const surfacePerformanceRows = buildSurfacePerformanceRows(surfaceSummary, ranking);
  const historicalMatches = ranking?.matches_played ?? profile.historical_matches;
  const surfacePerformanceYear = inferSurfacePerformanceYear(recentMatches, relatedMatches);
  const bestSurfacePerformance = getBestSurfacePerformance(surfacePerformanceRows);

  return (
    <div className="space-y-6">
      <section className="atp-panel relative overflow-hidden p-6">
        <div className="absolute right-[-8rem] top-[-10rem] h-72 w-72 rounded-full bg-lime-200/40 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={active ? "success" : "neutral"}>{active ? "Active" : "Inactive"}</Badge>
              {profile.best_surface ? <SurfaceBadge surface={profile.best_surface} /> : null}
            </div>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{formatNullable(profile.player_name)}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Player ID {profile.player_id} - {formatNullable(profile.ioc)} - {formatNullable(profile.hand)} hand
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>ATP {formatRanking(profile.atp_rank)}</Badge>
              <Badge>Elo {formatRanking(profile.elo_rank)}</Badge>
              <Badge>{winLossRecord}</Badge>
            </div>
            <div className="mt-6 border-t border-slate-950/[0.07] pt-5">
              <RecentFormStrip matches={recentMatches} />
            </div>
          </div>
          <Link
            href="/players"
            className="inline-flex min-h-11 items-center justify-center rounded-md border xl:min-h-0 border-slate-950/[0.08] bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-lime-300 hover:bg-lime-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30"
          >
            Back to players
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="ATP rank" value={formatRanking(profile.atp_rank)} detail={`${formatNumber(profile.atp_points)} points`} />
        <MetricCard label="Elo rank" value={formatRanking(profile.elo_rank)} detail={`Elo ${formatNumber(profile.elo, 1)}`} />
        <MetricCard
          label="Best surface"
          value={formatNullable(profile.best_surface)}
          detail={`Surface Elo ${formatNumber(profile.best_surface_elo, 1)}`}
        />
        <MetricCard
          label="Predictions"
          value={formatNumber(profile.prediction_appearances)}
          detail="Upcoming match appearances"
        />
        <MetricCard label="Wins / losses" value={winLossRecord} detail="Historical completed matches" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Basic information</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Profile fields available in the web-friendly player dataset.</p>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <InfoRow label="Country" value={profile.ioc} />
              <InfoRow label="Hand" value={profile.hand} />
              <InfoRow label="Height" value={profile.height} />
              <InfoRow label="Date of birth" value={formatDate(profile.dob)} />
              <InfoRow label="Wikidata ID" value={profile.wikidata_id} />
              <InfoRow label="Historical matches" value={formatNumber(historicalMatches)} />
              <InfoRow label="Last match date" value={formatDate(profile.last_match_date)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Surface Elo</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Current rating by surface when available.</p>
            </div>
          </CardHeader>
          <CardContent>
            {currentSurfaceEloAvailable ? (
              <div className="grid gap-3 md:grid-cols-2">
                <SurfaceMetric surface="Hard" elo={ranking?.hard_elo} rank={ranking?.hard_elo_rank} />
                <SurfaceMetric surface="Clay" elo={ranking?.clay_elo} rank={ranking?.clay_elo_rank} />
                <SurfaceMetric surface="Grass" elo={ranking?.grass_elo} rank={ranking?.grass_elo_rank} />
                <SurfaceMetric surface="Carpet" elo={ranking?.carpet_elo} rank={ranking?.carpet_elo_rank} />
              </div>
            ) : (
              <EmptyState
                title="Current Surface Elo is not available for this player yet."
                description="The profile keeps showing match performance by surface below when completed-match data is available."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <EloEvolutionCharts eloHistory={eloHistory} surfaceEloHistory={surfaceEloHistory} />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent matches</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Latest completed matches from the web-friendly recent matches file.</p>
            </div>
          </CardHeader>
          <CardContent>
            {recentMatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="atp-table">
                  <thead className="text-left">
                    <tr>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Opponent</th>
                      <th className="px-3 py-3">Tournament</th>
                      <th className="px-3 py-3">Surface</th>
                      <th className="px-3 py-3">Result</th>
                      <th className="px-3 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentMatches.slice(0, 10).map((match, index) => {
                      const opponent = getOpponentDisplay(match, playerNameById);
                      return (
                        <tr key={`${match.player_id}-${match.opponent_id}-${match.match_date}-${index}`} className="transition hover:bg-lime-50/35">
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-600">{formatDate(match.match_date)}</td>
                          <td className="whitespace-nowrap px-3 py-3">
                            {opponent.href ? (
                              <Link href={opponent.href} className="inline-flex min-h-11 items-center font-semibold text-slate-950 transition hover:text-court-grass xl:min-h-0">
                                {opponent.label}
                              </Link>
                            ) : (
                              <span className="font-semibold text-slate-700">{opponent.label}</span>
                            )}
                            {opponent.isFallback ? <p className="mt-0.5 text-xs text-slate-400">Name unavailable in web data</p> : null}
                          </td>
                          <td className="px-3 py-3 text-slate-600"><DataValue value={match.tournament_name} /></td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <SurfaceBadge surface={match.surface} />
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <Badge tone={match.result === "W" ? "success" : "danger"}>
                              {match.result === "W" ? "Win" : match.result === "L" ? "Loss" : formatNullable(match.result)}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-slate-600"><DataValue value={match.score} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No recent matches available." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{surfacePerformanceYear ? `Surface performance ${surfacePerformanceYear}` : "Surface performance"}</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Match record comes from completed matches for the current web season. Surface Elo and ranks use current ranking data when available.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {surfacePerformanceRows.length > 0 ? (
              <div className="space-y-3">
                {surfacePerformanceRows.map((surface) => (
                  <div
                    key={`${surface.player_id}-${surface.surface}`}
                    className={`rounded-lg border p-4 transition ${
                      surface.surface === bestSurfacePerformance
                        ? "border-lime-300/80 bg-lime-50/45 ring-1 ring-lime-200/60"
                        : "border-slate-950/[0.06] bg-white/55"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <SurfaceBadge surface={surface.surface} />
                      <div className="text-right">
                        <span className="text-sm font-semibold tabular-nums text-slate-950">{formatPercent(surface.win_rate)}</span>
                        {surface.surface === bestSurfacePerformance ? <p className="text-[11px] font-semibold text-court-grass">Best record</p> : null}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                      <SurfaceStat label="Matches" value={formatNumber(surface.matches)} />
                      <SurfaceStat label="Wins" value={formatNumber(surface.wins)} />
                      <SurfaceStat label="Losses" value={formatNumber(surface.losses)} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Surface Elo <NumericValue value={formatNumber(surface.surface_elo, 1)} /></span>
                      <span>Rank <DataValue value={formatRanking(surface.surface_elo_rank)} /></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No surface performance data available." />
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-slate-950">Upcoming predicted matches</h3>
          <p className="mt-1 text-sm text-slate-600">Current prediction cards where this player appears.</p>
        </div>
        {relatedMatches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {relatedMatches.map((match) => (
              <UpcomingPredictionCard key={match.match_id} match={match} playerId={profile.player_id} />
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming predicted matches available." />
        )}
      </section>
    </div>
  );
}

function SurfaceStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-slate-950"><DataValue value={value} /></p>
    </div>
  );
}

type SurfacePerformanceRow = PlayerSurfaceSummary & {
  surface_elo: string;
  surface_elo_rank: string;
};

const surfaceKeys = [
  { surface: "Hard", eloKey: "hard_elo", rankKey: "hard_elo_rank" },
  { surface: "Clay", eloKey: "clay_elo", rankKey: "clay_elo_rank" },
  { surface: "Grass", eloKey: "grass_elo", rankKey: "grass_elo_rank" },
  { surface: "Carpet", eloKey: "carpet_elo", rankKey: "carpet_elo_rank" }
] as const;

function buildSurfacePerformanceRows(surfaceSummary: PlayerSurfaceSummary[], ranking?: PlayerRanking): SurfacePerformanceRow[] {
  const summaryBySurface = new Map(surfaceSummary.map((surface) => [surface.surface.toLowerCase(), surface]));

  // Current surface Elo and completed-match summaries come from separate publication contracts.
  return surfaceKeys
    .map(({ surface, eloKey, rankKey }) => {
      const summary = summaryBySurface.get(surface.toLowerCase());
      const rankingElo = ranking?.[eloKey];
      const rankingRank = ranking?.[rankKey];

      if (!summary || !hasValidMatchCount(summary.matches)) {
        return null;
      }

      return {
        player_id: summary?.player_id ?? ranking?.player_id ?? "",
        surface: summary?.surface ?? surface,
        matches: summary?.matches ?? "",
        wins: summary?.wins ?? "",
        losses: summary?.losses ?? "",
        win_rate: summary?.win_rate ?? "",
        surface_elo: formatNullable(rankingElo) !== "n/a" ? rankingElo ?? "" : summary?.surface_elo ?? "",
        surface_elo_rank: formatNullable(rankingRank) !== "n/a" ? rankingRank ?? "" : summary?.surface_elo_rank ?? ""
      };
    })
    .filter((surface): surface is SurfacePerformanceRow => surface !== null);
}

function hasValidMatchCount(value: string | undefined): boolean {
  if (!value || formatNullable(value) === "n/a") {
    return false;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function inferSurfacePerformanceYear(recentMatches: PlayerRecentMatch[], relatedMatches: MatchCard[]): string {
  const years = [...recentMatches.map((match) => match.match_date), ...relatedMatches.map((match) => match.match_date)]
    .map((value) => {
      const date = formatDate(value);
      return date === "n/a" ? null : date.slice(0, 4);
    })
    .filter((year): year is string => typeof year === "string" && /^\d{4}$/.test(year));
  return years.sort((a, b) => b.localeCompare(a))[0] ?? "";
}

function getBestSurfacePerformance(rows: SurfacePerformanceRow[]): string {
  return rows.reduce<{ surface: string; winRate: number } | null>((best, row) => {
    const winRate = Number(row.win_rate);
    if (!Number.isFinite(winRate)) {
      return best;
    }
    if (!best || winRate > best.winRate) {
      return { surface: row.surface, winRate };
    }
    return best;
  }, null)?.surface ?? "";
}

function getOpponentDisplay(match: PlayerRecentMatch, playerNameById: Record<string, string>) {
  const opponentId = normalizePlayerId(match.opponent_id);
  const rawName = formatNullable(match.opponent_name);
  const resolvedName = playerNameById[opponentId];
  const label = isNumericLabel(rawName) ? resolvedName ?? `Player ID ${opponentId || rawName}` : rawName;
  const hasOpponentId = formatNullable(match.opponent_id) !== "n/a";

  return {
    label,
    href: hasOpponentId && resolvedName ? getPlayerProfilePath(match.opponent_id) : "",
    isFallback: isNumericLabel(rawName) && !resolvedName
  };
}

function isNumericLabel(value: string): boolean {
  return /^\d+(\.0)?$/.test(value);
}

function hasAnyCurrentSurfaceElo(ranking?: PlayerRanking): boolean {
  return surfaceKeys.some(({ eloKey, rankKey }) => formatNullable(ranking?.[eloKey]) !== "n/a" || formatNullable(ranking?.[rankKey]) !== "n/a");
}

function UpcomingPredictionCard({ match, playerId }: { match: MatchCard; playerId: string }) {
  const normalizedPlayerId = normalizePlayerId(playerId);
  const isPlayerOne = normalizePlayerId(match.player_1_id) === normalizedPlayerId;
  const opponentId = isPlayerOne ? match.player_2_id : match.player_1_id;
  const opponentName = isPlayerOne ? match.player_2_name : match.player_1_name;
  const probability = isPlayerOne ? match.player_1_win_probability : match.player_2_win_probability;
  const predictedWinner = normalizePlayerId(match.predicted_winner_id) === normalizedPlayerId ? "This player" : match.predicted_winner_name;

  return (
    <Card className="atp-card-interactive">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{formatNullable(match.tournament_name)}</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              vs{" "}
              {formatNullable(opponentId) !== "n/a" ? (
                <Link href={getPlayerProfilePath(opponentId)} className="inline-flex min-h-11 items-center transition hover:text-court-grass xl:min-h-0">
                  {formatNullable(opponentName)}
                </Link>
              ) : (
                formatNullable(opponentName)
              )}
            </p>
          </div>
          <SurfaceBadge surface={match.surface} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <SurfaceStat label="Date" value={formatDate(match.match_date)} />
          <SurfaceStat label="Round" value={formatNullable(match.round)} />
          <SurfaceStat label="Win probability" value={formatPercent(probability)} />
          <SurfaceStat label="Predicted winner" value={formatNullable(predictedWinner)} />
        </div>
        {formatNullable(match.match_id) !== "n/a" ? (
          <Link
            href={getPredictionDetailPath(match.match_id)}
            className="inline-flex min-h-11 items-center rounded-md bg-slate-950 px-3 py-2 xl:min-h-0 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View prediction detail
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-950"><DataValue value={value} /></dd>
    </div>
  );
}

function formatWinLoss(profile: PlayerProfile): string {
  const record = formatNullable(profile.win_loss_record);
  if (record !== "n/a") {
    return record;
  }
  const wins = formatNumber(profile.wins);
  const losses = formatNumber(profile.losses);
  if (wins === "n/a" || losses === "n/a") {
    return "n/a";
  }
  return `${wins}-${losses}`;
}

function SurfaceMetric({ surface, elo, rank }: { surface: string; elo?: string; rank?: string }) {
  return (
    <div className="rounded-md border border-slate-950/[0.06] bg-white/55 p-4">
      <div className="flex items-center justify-between">
        <SurfaceBadge surface={surface} />
        <span className="text-xs font-semibold text-slate-500"><DataValue value={formatRanking(rank)} /></span>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-950"><NumericValue value={formatNumber(elo, 1)} /></p>
      <p className="mt-1 text-xs text-slate-500">Surface Elo</p>
    </div>
  );
}
