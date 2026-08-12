"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { Badge } from "@/components/ui/badge";
import { DataValue, NumericValue } from "@/components/ui/data-value";
import type { PlayerRanking } from "@/lib/data/types";
import { formatNumber, formatRanking, toNumber } from "@/lib/formatters";
import { getPlayerProfilePath, normalizePlayerId } from "@/lib/routes";
import { RankingTypeTabs, SearchInput, TopNSelect, type TopNValue } from "@/components/rankings/RankingControls";
import { RankingMovement, SignedDelta } from "@/components/rankings/RankingMovement";
import { FilterChip, FilterSummary } from "@/components/filters";

type RankingMode = "overall" | "hard" | "clay" | "grass" | "carpet";
type SortKey = "rank" | "rank_change" | "player" | "rating" | "rating_change" | "atp" | "points" | "matches";
type PopulationMode = "active" | "all";

type EloModeConfig = {
  label: string;
  ratingKey: keyof PlayerRanking;
  rankKey: keyof PlayerRanking;
  ratingChangeKey: keyof PlayerRanking;
  rankChangeKey: keyof PlayerRanking;
};

const modeConfig: Record<RankingMode, EloModeConfig> = {
  overall: { label: "Overall", ratingKey: "elo", rankKey: "elo_rank", ratingChangeKey: "elo_change_10", rankChangeKey: "elo_rank_change_10" },
  hard: { label: "Hard", ratingKey: "hard_elo", rankKey: "hard_elo_rank", ratingChangeKey: "hard_elo_change_10", rankChangeKey: "hard_elo_rank_change_10" },
  clay: { label: "Clay", ratingKey: "clay_elo", rankKey: "clay_elo_rank", ratingChangeKey: "clay_elo_change_10", rankChangeKey: "clay_elo_rank_change_10" },
  grass: { label: "Grass", ratingKey: "grass_elo", rankKey: "grass_elo_rank", ratingChangeKey: "grass_elo_change_10", rankChangeKey: "grass_elo_rank_change_10" },
  carpet: { label: "Carpet", ratingKey: "carpet_elo", rankKey: "carpet_elo_rank", ratingChangeKey: "carpet_elo_change_10", rankChangeKey: "carpet_elo_rank_change_10" }
};

export function EloRankingsBoard({ rankings }: { rankings: PlayerRanking[] }) {
  const [mode, setMode] = useState<RankingMode>("overall");
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState<TopNValue>("25");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [populationMode, setPopulationMode] = useState<PopulationMode>("active");

  const config = modeConfig[mode];
  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = deduplicateByPlayer(
      rankings
      .filter((player) => hasValue(player[config.rankKey]) || hasValue(player[config.ratingKey]))
      .filter((player) => populationMode === "all" || isActiveRankingPlayer(player))
      .filter((player) => !normalizedQuery || player.player_name.toLowerCase().includes(normalizedQuery))
    ).sort((a, b) => comparePlayers(a, b, sortKey, sortDirection, config));
    const limit = topN === "all" ? filtered.length : Number(topN);
    return filtered.slice(0, limit);
  }, [config, populationMode, query, rankings, sortDirection, sortKey, topN]);

  return (
    <div className="space-y-6">
      <section className="atp-filter-panel space-y-4">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Ranking view</p>
              <p className="mt-1 text-sm text-slate-500">Switch between the overall table and surface-specific Elo views.</p>
            </div>
            <RankingTypeTabs
              value={mode}
              options={[
                { value: "overall", label: "Overall" },
                { value: "hard", label: "Hard" },
                { value: "clay", label: "Clay" },
                { value: "grass", label: "Grass" },
                { value: "carpet", label: "Carpet" }
              ]}
              onChange={setMode}
            />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Player universe</p>
              <RankingTypeTabs
                value={populationMode}
                options={[
                  { value: "active", label: "Active players" },
                  { value: "all", label: "All historical players" }
                ]}
                onChange={setPopulationMode}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_160px] xl:min-w-[520px]">
            <SearchInput value={query} onChange={setQuery} />
            <TopNSelect value={topN} onChange={setTopN} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <FilterSummary>
            Showing <strong className="text-slate-950">{rows.length}</strong> players
          </FilterSummary>
          <FilterChip>{config.label}</FilterChip>
          <FilterChip>{populationMode === "active" ? "Active players" : "All historical players"}</FilterChip>
          <span className="text-sm text-slate-500">Elo rankings can include historical players with enough match history.</span>
        </div>
      </section>

      {rows.length > 0 ? (
        <div className="atp-table-shell">
          <div className="overflow-x-auto">
            <table className="atp-table">
              <thead className="text-left">
                <tr>
                  <SortableHeader label="Rank" sortKey="rank" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="Rank change" sortKey="rank_change" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="Player" sortKey="player" active={sortKey} direction={sortDirection} onSort={handleSort} />
                  <th className="px-4 py-3">Type</th>
                  <SortableHeader label="Rating" sortKey="rating" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="Elo change (10)" sortKey="rating_change" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="ATP Rank" sortKey="atp" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="ATP Points" sortKey="points" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="Matches" sortKey="matches" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((player) => {
                  const rank = player[config.rankKey];
                  const rating = player[config.ratingKey];
                  const rankChange = player[config.rankChangeKey];
                  const ratingChange = player[config.ratingChangeKey];
                  const topTen = (toNumber(rank) ?? 99999) <= 10;
                  return (
                    <tr
                      key={`${mode}-${player.player_id}`}
                      className={`transition hover:bg-lime-50/35 ${topTen ? "bg-amber-50/45" : ""}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-950">
                        <div className="mx-auto grid w-[7.75rem] grid-cols-[3.25rem_4rem] items-center justify-center gap-2">
                          <span className="inline-flex w-[3.25rem] justify-center rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold tabular-nums text-white">
                            {formatRanking(rank)}
                          </span>
                          {topTen ? (
                            <Badge className="justify-self-start" tone="success">Top 10</Badge>
                          ) : (
                            <span className="h-5" aria-hidden="true" />
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <RankingMovement value={rankChange} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div>
                          {hasValue(player.player_id) ? (
                            <Link
                              href={getPlayerProfilePath(player.player_id)}
                              className="inline-flex min-h-11 items-center font-semibold text-slate-950 underline decoration-lime-300/0 xl:min-h-0 underline-offset-4 transition hover:text-court-grass hover:decoration-lime-400"
                            >
                              <DataValue value={player.player_name} />
                            </Link>
                          ) : (
                            <p className="font-semibold text-slate-950"><DataValue value={player.player_name} /></p>
                          )}
                          <p className="text-xs text-slate-400">ID <DataValue value={player.player_id} /></p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {mode === "overall" ? <Badge>Overall</Badge> : <SurfaceBadge surface={config.label} />}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center font-semibold tabular-nums text-slate-900">
                        <NumericValue value={formatNumber(rating, 1)} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <SignedDelta value={ratingChange} digits={1} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center tabular-nums text-slate-600">
                        <DataValue value={formatRanking(player.atp_rank)} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center tabular-nums text-slate-600">
                        <NumericValue value={formatNumber(player.atp_points)} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center tabular-nums text-slate-600">
                        <NumericValue value={formatNumber(player.matches_played)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No ranking rows found" description="Try another surface tab or search term." />
      )}
    </div>
  );

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "player" ? "asc" : "asc");
  }
}

function SortableHeader({
  label,
  sortKey,
  active,
  direction,
  onSort,
  align = "left"
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  direction: "asc" | "desc";
  onSort: (sortKey: SortKey) => void;
  align?: "left" | "center";
}) {
  return (
    <th className={`px-4 py-3 ${align === "center" ? "text-center" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex min-h-11 min-w-11 items-center gap-1 rounded-sm text-sm xl:min-h-0 xl:min-w-0 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {label}
        {active === sortKey ? <span className="text-[10px] text-slate-400">{direction === "asc" ? "asc" : "desc"}</span> : null}
      </button>
    </th>
  );
}

function comparePlayers(
  a: PlayerRanking,
  b: PlayerRanking,
  sortKey: SortKey,
  direction: "asc" | "desc",
  config: EloModeConfig
): number {
  const multiplier = direction === "asc" ? 1 : -1;
  if (sortKey === "player") {
    return a.player_name.localeCompare(b.player_name) * multiplier;
  }
  const values: Record<Exclude<SortKey, "player">, [string, string]> = {
    rank: [a[config.rankKey], b[config.rankKey]],
    rank_change: [a[config.rankChangeKey], b[config.rankChangeKey]],
    rating: [a[config.ratingKey], b[config.ratingKey]],
    rating_change: [a[config.ratingChangeKey], b[config.ratingChangeKey]],
    atp: [a.atp_rank, b.atp_rank],
    points: [a.atp_points, b.atp_points],
    matches: [a.matches_played, b.matches_played]
  };
  const [left, right] = values[sortKey];
  return compareNumeric(left, right) * multiplier;
}

function compareNumeric(left: string, right: string): number {
  const a = toNumber(left);
  const b = toNumber(right);
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function hasValue(value: string | undefined): boolean {
  return value !== undefined && value !== "" && value.toLowerCase() !== "nan";
}

function isActiveRankingPlayer(player: PlayerRanking): boolean {
  if ("is_active" in player && hasValue(player.is_active)) {
    return player.is_active.toLowerCase() === "true" || player.is_active === "1";
  }
  return hasValue(player.atp_rank);
}

function deduplicateByPlayer(players: PlayerRanking[]): PlayerRanking[] {
  const seen = new Set<string>();
  return players.filter((player) => {
    if (!hasValue(player.player_id)) {
      return true;
    }
    const key = normalizePlayerId(player.player_id);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
