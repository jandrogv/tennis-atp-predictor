"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FilterMenu, FilterReset, FilterSearch, FilterSummary } from "@/components/filters";
import { ActiveTournamentCarousel } from "@/components/tournaments/ActiveTournamentCarousel";
import { TournamentMonthGroup } from "@/components/tournaments/TournamentMonthGroup";
import type { TournamentDetail } from "@/lib/data/types";
import {
  filterTournaments,
  getFeaturedTournaments,
  groupTournamentsByStartMonth,
  type TournamentImageManifest
} from "@/lib/tournaments/tournament-presentation";
import imageManifest from "@/public/images/tournaments/courts/manifest.json";

export function TournamentsBoard({ tournaments }: { tournaments: TournamentDetail[] }) {
  const [query, setQuery] = useState("");
  const [surface, setSurface] = useState("all");
  const [year, setYear] = useState("all");
  const [currentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const deferredQuery = useDeferredValue(query);

  const surfaces = useMemo(() => buildOptions(tournaments.map((tournament) => tournament.surface)), [tournaments]);
  const years = useMemo(() => buildOptions(tournaments.map((tournament) => tournament.year)), [tournaments]);
  const rows = useMemo(
    () => filterTournaments(tournaments, { query: deferredQuery, surface, year }),
    [deferredQuery, surface, tournaments, year]
  );
  const featured = useMemo(() => getFeaturedTournaments(rows, currentDate), [currentDate, rows]);
  const monthGroups = useMemo(() => groupTournamentsByStartMonth(rows), [rows]);

  return (
    <div className="space-y-12">
      <section className="rounded-xl border border-slate-950/[0.06] bg-white/42 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.035)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(19rem,1fr)_10rem_10rem_auto_auto] xl:items-end">
          <FilterSearch value={query} onChange={setQuery} placeholder="Search tournament" label="Tournament search" />
          <FilterSelect label="Year" value={year} options={years} onChange={setYear} />
          <FilterSelect label="Surface" value={surface} options={surfaces} onChange={setSurface} />
          <FilterSummary>
            <strong className="text-slate-950">{rows.length}</strong> of <strong className="text-slate-950">{tournaments.length}</strong>
          </FilterSummary>
          <FilterReset
            onClick={() => {
              setQuery("");
              setSurface("all");
              setYear("all");
            }}
          />
        </div>
      </section>

      {rows.length > 0 ? (
        <>
          {featured.kind !== "empty" ? (
            <ActiveTournamentCarousel
              tournaments={featured.tournaments}
              manifest={imageManifest as TournamentImageManifest}
              label={featured.kind === "active" ? "Tournaments in progress" : "Next tournament"}
            />
          ) : (
            <section className="border-y border-slate-950/[0.07] py-8">
              <h2 className="text-xl font-semibold text-slate-950">Tournaments in progress</h2>
              <p className="mt-2 text-sm text-slate-500">No tournament in this filtered calendar is active today.</p>
            </section>
          )}

          <section aria-labelledby="season-calendar-title">
            <div className="mb-5">
              <p className="atp-section-label">Season calendar</p>
              <h2 id="season-calendar-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Tournaments by month
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Events appear in the month they begin. Open any month to scan the full filtered calendar.
              </p>
            </div>
            <div className="border-b border-slate-950/[0.07]">
              {monthGroups.map((group) => <TournamentMonthGroup key={group.key} group={group} />)}
            </div>
          </section>
        </>
      ) : (
        <EmptyState title="No tournaments match these filters" description="Try another surface, year or search term." />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <FilterMenu
      label={label}
      value={value}
      options={[{ value: "all", label: "All" }, ...options.map((option) => ({ value: option, label: option }))]}
      onChange={onChange}
    />
  );
}

function buildOptions(values: string[]): string[] {
  return Array.from(new Set(values.filter(hasValue))).sort();
}

function hasValue(value: string | undefined): boolean {
  return value !== undefined && value.trim() !== "" && value.toLowerCase() !== "nan" && value.toLowerCase() !== "n/a";
}
