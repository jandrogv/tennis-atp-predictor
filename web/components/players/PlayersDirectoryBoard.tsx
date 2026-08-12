"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { Badge } from "@/components/ui/badge";
import { DataValue, NumericValue } from "@/components/ui/data-value";
import { CountryFlag } from "@/components/ui/country-flag";
import { FilterChip, FilterMenu, FilterReset, FilterSearch, FilterSummary, MobileFiltersPanel } from "@/components/filters";
import type { PlayerDirectoryEntry } from "@/lib/data/types";
import { formatNumber, formatNullable, formatRanking, toNumber } from "@/lib/formatters";

type ActiveFilter = "active" | "all";
type PageSizeValue = "25" | "50" | "100";

type PreparedPlayer = PlayerDirectoryEntry & {
  searchText: string;
};

export function PlayersDirectoryBoard({
  players,
  totalPlayerCount
}: {
  players: PlayerDirectoryEntry[];
  totalPlayerCount: number;
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");
  const [country, setCountry] = useState("all");
  const [surface, setSurface] = useState("all");
  const [pageSize, setPageSize] = useState<PageSizeValue>("100");
  const [page, setPage] = useState(1);
  const [allPlayers, setAllPlayers] = useState<PlayerDirectoryEntry[] | null>(null);
  const [isLoadingAllPlayers, setIsLoadingAllPlayers] = useState(false);
  const [allPlayersError, setAllPlayersError] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (activeFilter !== "all" || allPlayers || isLoadingAllPlayers) {
      return;
    }

    let isCancelled = false;
    setIsLoadingAllPlayers(true);
    setAllPlayersError("");

    fetch("/data/web_players_directory.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load player directory (${response.status})`);
        }
        return response.text();
      })
      .then((csv) => {
        if (!isCancelled) {
          setAllPlayers(parsePlayerDirectoryCsv(csv));
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setAllPlayersError(error instanceof Error ? error.message : "Could not load all players.");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingAllPlayers(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeFilter, allPlayers, isLoadingAllPlayers]);

  const sourcePlayers = activeFilter === "all" && allPlayers ? allPlayers : players;

  const preparedPlayers = useMemo<PreparedPlayer[]>(
    () =>
      sourcePlayers
        .map((player) => ({
          ...player,
          searchText: player.player_name.toLowerCase()
        }))
        .sort(comparePlayers),
    [sourcePlayers]
  );

  const countries = useMemo(() => buildOptions(preparedPlayers.map((player) => player.country)), [preparedPlayers]);
  const surfaces = useMemo(() => buildOptions(preparedPlayers.map((player) => player.best_surface)), [preparedPlayers]);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return preparedPlayers
      .filter((player) => activeFilter === "all" || isActive(player))
      .filter((player) => country === "all" || player.country === country)
      .filter((player) => surface === "all" || player.best_surface === surface)
      .filter((player) => !normalizedQuery || player.searchText.includes(normalizedQuery));
  }, [activeFilter, country, deferredQuery, preparedPlayers, surface]);

  const activeCount = useMemo(() => preparedPlayers.filter(isActive).length, [preparedPlayers]);
  const pageSizeNumber = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSizeNumber));
  const visiblePlayers = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSizeNumber;
    return filteredPlayers.slice(start, start + pageSizeNumber);
  }, [filteredPlayers, page, pageSizeNumber, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, country, pageSize, query, surface]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const activeFilterCount = [
    activeFilter !== "active",
    country !== "all",
    surface !== "all",
    pageSize !== "100",
    query.trim() !== ""
  ].filter(Boolean).length;
  const secondaryFilters = (
    <>
      <SelectFilter label="Country" value={country} options={countries} onChange={setCountry} />
      <SelectFilter label="Best surface" value={surface} options={surfaces} onChange={setSurface} />
      <SelectFilter
        label="Page size"
        value={pageSize}
        options={[
          ["25", "25 rows"],
          ["50", "50 rows"],
          ["100", "100 rows"]
        ]}
        onChange={(value) => setPageSize(value as PageSizeValue)}
        includeAllOption={false}
      />
    </>
  );
  return (
    <div className="space-y-5">
      <section className="atp-filter-panel">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Directory filters</h2>
            <p className="text-sm text-slate-500">Search active players first, or load the compact full directory on demand.</p>
          </div>
          <FilterSummary>
            <strong className="text-slate-950">{formatNumber(filteredPlayers.length)}</strong> matching players
          </FilterSummary>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px] lg:items-end">
          <FilterSearch value={query} onChange={setQuery} placeholder="Search player" label="Player search" />
          <SelectFilter
            label="Status"
            value={activeFilter}
            options={[
              ["active", "Active"],
              ["all", "All"]
            ]}
            onChange={(value) => setActiveFilter(value as ActiveFilter)}
            includeAllOption={false}
          />
        </div>
        <div className="mt-3 hidden gap-3 md:grid md:grid-cols-3">{secondaryFilters}</div>
        <MobileFiltersPanel activeCount={activeFilterCount}>{secondaryFilters}</MobileFiltersPanel>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-950/[0.06] pt-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSummary>
              Showing <strong className="text-slate-950">{visiblePlayers.length}</strong> of <strong className="text-slate-950">{filteredPlayers.length}</strong>
            </FilterSummary>
            <FilterChip>{activeFilter === "active" ? "Active players" : "All players"}</FilterChip>
            <span className="text-sm text-slate-500">
              Initial active payload: <strong className="text-slate-950">{activeCount}</strong> / <strong className="text-slate-950">{formatNumber(totalPlayerCount)}</strong>
            </span>
          </div>
          <FilterReset
            onClick={() => {
              setQuery("");
              setActiveFilter("active");
              setCountry("all");
              setSurface("all");
              setPageSize("100");
              setPage(1);
            }}
          />
        </div>
      </section>

      {isLoadingAllPlayers ? (
        <div className="rounded-xl border border-slate-950/[0.06] bg-white/[0.56] p-4 text-sm text-slate-500 shadow-card">
          Loading the compact full player directory...
        </div>
      ) : null}

      {allPlayersError ? <EmptyState title="Could not load all players" description={allPlayersError} /> : null}

      {visiblePlayers.length > 0 ? (
        <>
          <div className="atp-table-shell">
            <div className="overflow-x-auto">
              <table className="atp-table">
                <thead className="text-left">
                  <tr>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3 text-center">ATP</th>
                    <th className="px-4 py-3 text-center">Elo</th>
                    <th className="px-4 py-3">Best Surface</th>
                    <th className="px-4 py-3 text-center">Matches</th>
                    <th className="px-4 py-3 text-center">Last 10</th>
                    <th className="px-4 py-3 text-center">Last 30</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visiblePlayers.map((player) => (
                    <tr key={player.player_id} className="align-top transition hover:bg-lime-50/35">
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link href={`/players/${player.player_id}`} className="inline-flex min-h-11 items-center font-semibold text-slate-950 underline decoration-lime-300/0 xl:min-h-0 underline-offset-4 transition hover:text-court-grass hover:decoration-lime-400">
                          <DataValue value={player.player_name} />
                        </Link>
                        <p className="text-xs text-slate-400">ID <DataValue value={player.player_id} /></p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                          <DataValue value={player.country} />
                          <CountryFlag country={player.country} />
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <p className="font-semibold tabular-nums text-slate-900"><DataValue value={formatRanking(player.atp_rank)} /></p>
                        <p className="text-xs tabular-nums text-slate-500"><NumericValue value={formatNumber(player.atp_points)} /> pts</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <p className="font-semibold tabular-nums text-slate-900"><DataValue value={formatRanking(player.elo_rank)} /></p>
                        <p className="text-xs tabular-nums text-slate-500"><NumericValue value={formatNumber(player.overall_elo, 1)} /></p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatNullable(player.best_surface) !== "n/a" ? <SurfaceBadge surface={player.best_surface} /> : <DataValue value={player.best_surface} />}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center tabular-nums">
                        <NumericValue value={formatNumber(player.matches)} />
                      </td>
                      <RecentRecordCell value={player.last_10_record} />
                      <RecentRecordCell value={player.last_30_record} />
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge tone={isActive(player) ? "success" : "neutral"}>{isActive(player) ? "Active" : "Inactive"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState title="No players match these filters" description="Try another search, country or surface filter." />
      )}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-950/[0.06] bg-white/[0.56] p-3 text-sm shadow-card">
      <span className="text-slate-500">
        Page <strong className="text-slate-950">{page}</strong> of <strong className="text-slate-950">{totalPages}</strong>
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="min-h-11 rounded-md border border-slate-950/[0.08] bg-white/80 px-3 py-1.5 xl:min-h-0 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-lime-300 hover:bg-lime-50/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="min-h-11 rounded-md border border-slate-950/[0.08] bg-white/80 px-3 py-1.5 xl:min-h-0 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-lime-300 hover:bg-lime-50/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
  includeAllOption = true
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
}) {
  return (
    <FilterMenu
      label={label}
      value={value}
      options={[
        ...(includeAllOption ? [{ value: "all", label: "All" }] : []),
        ...options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel }))
      ]}
      onChange={onChange}
    />
  );
}

function buildOptions(values: string[]): Array<[string, string]> {
  return Array.from(new Set(values.filter((value) => value && value.toLowerCase() !== "nan")))
    .sort()
    .map((value) => [value, value]);
}

function comparePlayers(a: PlayerDirectoryEntry, b: PlayerDirectoryEntry): number {
  const aAtp = toNumber(a.atp_rank);
  const bAtp = toNumber(b.atp_rank);
  if (aAtp !== null || bAtp !== null) {
    if (aAtp === null) return 1;
    if (bAtp === null) return -1;
    return aAtp - bAtp;
  }
  const aElo = toNumber(a.elo_rank);
  const bElo = toNumber(b.elo_rank);
  if (aElo !== null || bElo !== null) {
    if (aElo === null) return 1;
    if (bElo === null) return -1;
    return aElo - bElo;
  }
  return a.player_name.localeCompare(b.player_name);
}

function isActive(player: PlayerDirectoryEntry): boolean {
  return player.is_active.toLowerCase() === "true";
}

function RecentRecordCell({ value }: { value: string }) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-center">
      <span className="font-semibold tabular-nums text-slate-900"><DataValue value={value} /></span>
      <span className="ml-1 text-[10px] font-medium uppercase text-slate-400">W-L</span>
    </td>
  );
}

function parsePlayerDirectoryCsv(csv: string): PlayerDirectoryEntry[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {}) as PlayerDirectoryEntry;
  });
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}
