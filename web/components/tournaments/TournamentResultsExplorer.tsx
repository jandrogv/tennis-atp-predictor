"use client";

import Link from "next/link";
import { type KeyboardEvent, type MouseEvent, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Table2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { TournamentBracket } from "@/components/tournaments/TournamentBracket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import type { TournamentMatch } from "@/lib/data/types";
import { formatDate, formatNullable, formatNumber, toNumber } from "@/lib/formatters";
import { getPlayerProfilePath, getTournamentMatchDetailPath } from "@/lib/routes";

type ResultsView = "draw" | "table";

export function TournamentResultsExplorer({ matches }: { matches: TournamentMatch[] }) {
  const hasDraw = matches.some((match) => toNumber(match.draw_match_number) !== null && /^MS\d+$/i.test(match.id_num ?? ""));
  const [view, setView] = useState<ResultsView>(hasDraw ? "draw" : "table");

  if (matches.length === 0) {
    return <EmptyState title="No completed matches available yet." />;
  }

  return (
    <section className="space-y-5" aria-labelledby="tournament-results-title">
      <div className="flex flex-col gap-4 border-b border-slate-950/[0.07] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="atp-section-label">Results</p>
          <h2 id="tournament-results-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Tournament progression
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Switch between the complete results table and the knockout draw.
          </p>
        </div>
        <div className="inline-flex w-fit rounded-xl border border-slate-950/[0.08] bg-white/65 p-1 shadow-sm" role="tablist" aria-label="Tournament results view">
          <ViewButton selected={view === "draw"} disabled={!hasDraw} onClick={() => setView("draw")} icon={<GitBranch className="h-4 w-4" aria-hidden="true" />}>
            Draw
          </ViewButton>
          <ViewButton selected={view === "table"} onClick={() => setView("table")} icon={<Table2 className="h-4 w-4" aria-hidden="true" />}>
            Table
          </ViewButton>
        </div>
      </div>

      <div role="tabpanel">
        {view === "draw" ? <TournamentBracket matches={matches} /> : <TournamentResultsTable matches={matches} />}
      </div>
    </section>
  );
}

function ViewButton({
  selected,
  disabled = false,
  onClick,
  icon,
  children
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-2 xl:h-9 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35 disabled:cursor-not-allowed disabled:opacity-35",
        selected ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-lime-50/70 hover:text-slate-950"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function TournamentResultsTable({ matches }: { matches: TournamentMatch[] }) {
  const router = useRouter();
  const rounds = groupMatchesByRound(matches);

  return (
    <div className="space-y-5">
      {rounds.map((round) => (
        <Card key={`${round.round}-${round.roundOrder}`} className="overflow-hidden">
          <CardHeader className="bg-white/35">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{round.round}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Completed matches in this round</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {formatNumber(round.matches.length)} matches
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="atp-table">
                <thead className="text-left">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Player 1</th>
                    <th className="px-4 py-3">Player 2</th>
                    <th className="px-4 py-3">Winner</th>
                    <th className="px-4 py-3">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {round.matches.map((match, index) => {
                    const detailPath = matchDetailPath(match);
                    const navigate = () => detailPath && router.push(detailPath);
                    const onRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
                      if (!detailPath || isNestedInteractiveTarget(event.target)) return;
                      navigate();
                    };
                    const onRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
                      if (!detailPath || event.target !== event.currentTarget || event.key !== "Enter") return;
                      event.preventDefault();
                      navigate();
                    };
                    return (
                      <tr
                        key={match.match_id || `${match.tournament_slug}-${match.id_num || match.round}-${match.player_1_id}-${match.player_2_id}-${index}`}
                        className={cn(
                          "transition hover:bg-lime-50/35",
                          detailPath && "cursor-pointer focus-visible:bg-lime-50/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500/35"
                        )}
                        onClick={onRowClick}
                        onKeyDown={onRowKeyDown}
                        tabIndex={detailPath ? 0 : undefined}
                        role={detailPath ? "link" : undefined}
                        aria-label={detailPath ? `View match statistics for ${match.player_1_name} vs ${match.player_2_name}` : undefined}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(match.match_date)}</td>
                        <td className="whitespace-nowrap px-4 py-3"><PlayerLink playerId={match.player_1_id} name={match.player_1_name} /></td>
                        <td className="whitespace-nowrap px-4 py-3"><PlayerLink playerId={match.player_2_id} name={match.player_2_name} /></td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950"><PlayerLink playerId={match.winner_id} name={match.winner_name} /></td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-700">{formatNullable(match.score)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function matchDetailPath(match: TournamentMatch): string | null {
  if (!isTruthy(match.has_match_statistics) || !hasValue(match.match_id)) return null;
  return getTournamentMatchDetailPath(match.tournament_slug, match.match_id);
}

function isNestedInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("a, button, input, select, textarea"));
}

function isTruthy(value: string | undefined): boolean {
  return ["true", "1", "yes"].includes(String(value ?? "").trim().toLowerCase());
}
function PlayerLink({ playerId, name }: { playerId: string; name: string }) {
  const label = formatNullable(name);
  if (!hasValue(playerId)) return <span>{label}</span>;
  return <Link href={getPlayerProfilePath(playerId)} className="atp-table-link">{label}</Link>;
}

function groupMatchesByRound(matches: TournamentMatch[]): Array<{ round: string; roundOrder: number; matches: TournamentMatch[] }> {
  const groups = new Map<string, { round: string; roundOrder: number; matches: TournamentMatch[] }>();
  matches.forEach((match) => {
    const round = formatRound(match.round_display || match.round);
    const roundOrder = visualRoundOrder(round, match.round_order);
    const key = `${roundOrder}-${round}`;
    if (!groups.has(key)) groups.set(key, { round, roundOrder, matches: [] });
    groups.get(key)?.matches.push(match);
  });
  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      matches: group.matches.slice().sort((a, b) => {
        const drawOrder = (toNumber(a.draw_match_number) ?? 9999) - (toNumber(b.draw_match_number) ?? 9999);
        return drawOrder || dateSortValue(a.match_date) - dateSortValue(b.match_date);
      })
    }))
    .sort((a, b) => a.roundOrder - b.roundOrder || a.round.localeCompare(b.round));
}

function formatRound(value: string | undefined): string {
  const round = formatNullable(value);
  if (round === "n/a") return "Unknown";
  return canonicalRoundLabel(round);
}

function canonicalRoundLabel(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
  if (["f", "final", "finals"].includes(normalized)) return "Finals";
  if (["sf", "semi final", "semi finals", "semifinal", "semifinals"].includes(normalized)) return "Semi-Finals";
  if (["qf", "quarter final", "quarter finals", "quarterfinal", "quarterfinals"].includes(normalized)) return "Quarter-Finals";
  if (normalized === "r16" || normalized === "round of 16") return "Round of 16";
  if (normalized === "r32" || normalized === "round of 32") return "Round of 32";
  if (normalized === "r64" || normalized === "round of 64") return "Round of 64";
  if (normalized === "r128" || normalized === "round of 128") return "Round of 128";
  if (normalized === "rr" || normalized === "round robin") return "Round Robin";
  return value;
}

function visualRoundOrder(round: string, sourceRoundOrder: string): number {
  const order: Record<string, number> = { Finals: 1, "Semi-Finals": 2, "Quarter-Finals": 3, "Round of 16": 4, "Round of 32": 5, "Round of 64": 6, "Round of 128": 7, "Round Robin": 8 };
  return round in order ? order[round] : 1000 + (toNumber(sourceRoundOrder) ?? 999);
}

function dateSortValue(value: string): number {
  const formatted = formatDate(value);
  return formatted === "n/a" ? 0 : Date.parse(formatted);
}

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== "" && value.toLowerCase() !== "nan";
}
