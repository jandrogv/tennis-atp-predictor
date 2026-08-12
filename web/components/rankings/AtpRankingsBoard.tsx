"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { DataValue, NumericValue } from "@/components/ui/data-value";
import { CountryFlag } from "@/components/ui/country-flag";
import type { AtpRankingTableRow } from "@/lib/data/types";
import { formatDate, formatNumber, formatRanking, toNumber } from "@/lib/formatters";
import { getPlayerProfilePath, normalizePlayerId } from "@/lib/routes";
import { SearchInput, TopNSelect, type TopNValue } from "@/components/rankings/RankingControls";
import { RankingMovement, SignedDelta } from "@/components/rankings/RankingMovement";
import { FilterChip, FilterMenu, FilterSummary } from "@/components/filters";
import { parseCsv } from "@/lib/data/csv-parser";

type SortKey = "atp_rank" | "rank_change" | "player" | "country" | "age" | "points" | "points_change";

export function AtpRankingsBoard({
  initialRankings,
  rankingDates,
  initialDate
}: {
  initialRankings: AtpRankingTableRow[];
  rankingDates: string[];
  initialDate: string;
}) {
  const [query, setQuery] = useState("");
  const [topN, setTopN] = useState<TopNValue>("25");
  const [sortKey, setSortKey] = useState<SortKey>("atp_rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [rankings, setRankings] = useState(initialRankings);
  const [loadingDate, setLoadingDate] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, AtpRankingTableRow[]>([[initialDate, initialRankings]]));
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = deduplicateByPlayerAndDate(rankings)
      .filter((player) => !normalizedQuery || player.player_name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => compareRankings(a, b, sortKey, sortDirection));
    const limit = topN === "all" ? filtered.length : Number(topN);
    return filtered.slice(0, limit);
  }, [query, rankings, selectedDate, sortDirection, sortKey, topN]);

  return (
    <div className="space-y-6">
      <section className="atp-filter-panel space-y-4">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Ranking snapshot</p>
            <p className="mt-1 text-sm text-slate-500">Select a date and scan the official ATP ranking table.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_160px] xl:min-w-[650px]">
            <SearchInput value={query} onChange={setQuery} />
            <DateSelect value={selectedDate} dates={rankingDates} onChange={handleDateChange} />
            <TopNSelect value={topN} onChange={setTopN} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <FilterSummary>
            Showing <strong className="text-slate-950">{rows.length}</strong> players
          </FilterSummary>
          <FilterChip>{formatDate(selectedDate)}</FilterChip>
        </div>
      </section>

      {loadingDate ? (
        <div className="atp-table-shell px-6 py-12 text-center" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-slate-900">Loading ranking snapshot</p>
          <p className="mt-2 text-sm text-slate-500">Fetching {formatDate(loadingDate)} only when requested.</p>
        </div>
      ) : rows.length > 0 ? (
        <div className="atp-table-shell">
          <div className="overflow-x-auto">
            <table className="atp-table">
              <thead className="text-left">
                <tr>
                  <SortableHeader label="Rank" sortKey="atp_rank" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="Rank change" sortKey="rank_change" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="Player" sortKey="player" active={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortableHeader label="Country" sortKey="country" active={sortKey} direction={sortDirection} onSort={handleSort} />
                  <SortableHeader label="Age" sortKey="age" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="ATP Points" sortKey="points" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                  <SortableHeader label="Points change" sortKey="points_change" active={sortKey} direction={sortDirection} onSort={handleSort} align="center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((player) => {
                  const topTen = (toNumber(player.atp_rank) ?? 99999) <= 10;
                  return (
                    <tr
                      key={`${player.ranking_date}-${player.player_id}`}
                      className={`transition hover:bg-lime-50/35 ${topTen ? "bg-amber-50/45" : ""}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-950">
                        <div className="mx-auto grid w-[7.75rem] grid-cols-[3.25rem_4rem] items-center justify-center gap-2">
                          <span className="inline-flex w-[3.25rem] justify-center rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold tabular-nums text-white">
                            {formatRanking(player.atp_rank)}
                          </span>
                          {topTen ? (
                            <Badge className="justify-self-start" tone="success">Top 10</Badge>
                          ) : (
                            <span className="h-5" aria-hidden="true" />
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <RankingMovement value={player.atp_rank_change} />
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
                        <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                          <DataValue value={player.country} />
                          <CountryFlag country={player.country} />
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center tabular-nums"><DataValue value={player.age} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-center font-semibold tabular-nums text-slate-900">
                        <NumericValue value={formatNumber(player.atp_points)} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <SignedDelta value={player.atp_points_change} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title={loadError ? "Could not load this ranking snapshot" : "No ATP ranking rows found"}
          description={loadError ?? "Try another ranking date, player search or Top N value."}
        />
      )}
    </div>
  );

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(nextSortKey);
    setSortDirection("asc");
  }

  function handleDateChange(nextDate: string) {
    setSelectedDate(nextDate);
    setLoadError(null);
    const cached = cacheRef.current.get(nextDate);
    if (cached) {
      requestRef.current?.abort();
      setLoadingDate(null);
      setRankings(cached);
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoadingDate(nextDate);
    setRankings([]);

    fetch(`/data/atp-rankings/${encodeURIComponent(nextDate)}.csv`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Ranking snapshot returned ${response.status}`);
        return response.text();
      })
      .then((text) => {
        const loaded = parseCsv(text) as AtpRankingTableRow[];
        cacheRef.current.set(nextDate, loaded);
        setRankings(loaded);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError("The selected date could not be loaded. Choose another ranking snapshot and try again.");
      })
      .finally(() => {
        if (requestRef.current === controller) {
          setLoadingDate(null);
        }
      });
  }
}

function DateSelect({
  value,
  dates,
  onChange
}: {
  value: string;
  dates: string[];
  onChange: (value: string) => void;
}) {
  return (
    <FilterMenu
      label="Ranking date"
      value={value}
      options={dates.map((date) => ({ value: date, label: formatDate(date) }))}
      onChange={onChange}
    />
  );
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

function compareRankings(a: AtpRankingTableRow, b: AtpRankingTableRow, sortKey: SortKey, direction: "asc" | "desc") {
  const multiplier = direction === "asc" ? 1 : -1;
  if (sortKey === "player") {
    return a.player_name.localeCompare(b.player_name) * multiplier;
  }
  if (sortKey === "country") {
    return a.country.localeCompare(b.country) * multiplier;
  }
  const values: Record<Exclude<SortKey, "player" | "country">, [string, string]> = {
    atp_rank: [a.atp_rank, b.atp_rank],
    rank_change: [a.atp_rank_change, b.atp_rank_change],
    age: [a.age, b.age],
    points: [a.atp_points, b.atp_points],
    points_change: [a.atp_points_change, b.atp_points_change]
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

function hasValue(value: string): boolean {
  return value !== "" && value.toLowerCase() !== "nan";
}

function deduplicateByPlayerAndDate(rankings: AtpRankingTableRow[]): AtpRankingTableRow[] {
  const seen = new Set<string>();
  return rankings.filter((player) => {
    if (!hasValue(player.player_id)) {
      return true;
    }
    const key = `${normalizePlayerId(player.player_id)}-${player.ranking_date}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
