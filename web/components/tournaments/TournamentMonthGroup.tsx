"use client";

import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import type { TournamentDetail } from "@/lib/data/types";
import { formatDate, formatNullable } from "@/lib/formatters";
import { getTournamentDetailPath } from "@/lib/routes";
import type { TournamentMonthGroup as TournamentMonthGroupData } from "@/lib/tournaments/tournament-presentation";

export function TournamentMonthGroup({ group }: { group: TournamentMonthGroupData }) {
  const [expanded, setExpanded] = useState(true);
  const contentId = `tournament-month-${group.key}`;

  return (
    <section className="border-t border-slate-950/[0.07] first:border-t-0">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((value) => !value)}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500/35"
      >
        <span>
          <span className="text-xl font-semibold tracking-tight text-slate-950">{group.label}</span>
          <span className="ml-3 text-sm font-medium text-slate-500">
            {group.tournaments.length} {group.tournaments.length === 1 ? "tournament" : "tournaments"}
          </span>
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          {expanded ? "Collapse" : "Expand"}
          <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </span>
      </button>
      {expanded ? (
        <div id={contentId} className="pb-8">
          <div className="overflow-hidden rounded-xl border border-slate-950/[0.07] bg-white/45">
            {group.tournaments.map((tournament) => (
              <CompactTournamentRow key={tournament.tournament_slug || tournament.tournament_id} tournament={tournament} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CompactTournamentRow({ tournament }: { tournament: TournamentDetail }) {
  const location = [tournament.location, tournament.country].filter(hasValue).join(", ");
  const href = getTournamentDetailPath(tournament.tournament_slug || tournament.tournament_id);
  const metadata = [
    tournament.prize_money ? `Prize ${tournament.prize_money}` : "",
    tournament.draw_size ? `Draw ${tournament.draw_size}` : "",
    tournament.last_winner ? `Champion ${tournament.last_winner}` : "",
    tournament.completed_matches_count ? `${tournament.completed_matches_count} completed` : ""
  ].filter(hasValue);

  return (
    <Link
      href={href}
      aria-label={`Open ${formatNullable(tournament.tournament_name)}`}
      className={`group relative grid gap-4 border-b border-slate-950/[0.06] px-5 py-4 transition last:border-b-0 hover:bg-lime-50/35 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500/40 lg:grid-cols-[minmax(16rem,1.2fr)_minmax(15rem,0.9fr)_minmax(18rem,1.2fr)] lg:items-center ${surfaceAccent(tournament.surface)}`}
    >
      <div className="min-w-0 border-l-2 border-current pl-4">
        <p className="truncate text-base font-semibold text-slate-950 transition group-hover:text-lime-700">
          {formatNullable(tournament.tournament_name)}
        </p>
        {location ? (
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {location}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SurfaceBadge surface={tournament.surface} />
        <span className="text-sm font-medium tabular-nums text-slate-600">
          {formatDate(tournament.start_date || tournament.tournament_date)} - {formatDate(tournament.end_date)}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500 lg:justify-end">
        {metadata.map((item) => <span key={item}>{item}</span>)}
      </div>
    </Link>
  );
}

function surfaceAccent(surface: string): string {
  const normalized = surface.toLowerCase();
  if (normalized.includes("clay")) return "text-orange-500";
  if (normalized.includes("grass")) return "text-emerald-600";
  if (normalized.includes("carpet")) return "text-violet-500";
  return "text-blue-500";
}

function hasValue(value: string | undefined): value is string {
  return Boolean(value && value.trim() && value.toLowerCase() !== "n/a" && value.toLowerCase() !== "nan");
}
