"use client";

import Link from "next/link";
import { ArrowLeft, Check, Info, RefreshCw, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { getMatchStatisticsById } from "@/lib/data/match-statistics-loader";
import type { MatchStatisticsRecord, PreMatchPlayerContext } from "@/lib/data/match-statistics-types";
import {
  buildModelSignalRows,
  buildOfficialStatisticRows,
  type OfficialStatisticRow
} from "@/lib/matches/statistics-presentation";
import { formatDate, formatNumber, formatRanking } from "@/lib/formatters";
import { getPlayerProfilePath, getTournamentDetailPath } from "@/lib/routes";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; record: MatchStatisticsRecord }
  | { status: "empty" }
  | { status: "error" };

export function TournamentMatchStatisticsDetail({
  tournamentId,
  tournamentName,
  matchId
}: {
  tournamentId: string;
  tournamentName: string;
  matchId: string;
}) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadState({ status: "loading" });
    getMatchStatisticsById(matchId)
      .then((record) => {
        if (!active) return;
        if (!record || (record.tournament.slug && record.tournament.slug !== tournamentId)) {
          setLoadState({ status: "empty" });
          return;
        }
        setLoadState({ status: "ready", record });
      })
      .catch(() => {
        if (active) setLoadState({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [attempt, matchId, tournamentId]);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-950/[0.07] pb-6">
        <Link
          href={getTournamentDetailPath(tournamentId)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to {tournamentName}
        </Link>
        <p className="atp-section-label mt-7">Completed match</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Match statistics</h1>
      </div>

      {loadState.status === "loading" ? <LoadingState /> : null}
      {loadState.status === "empty" ? <UnavailableState /> : null}
      {loadState.status === "error" ? <ErrorState onRetry={() => setAttempt((value) => value + 1)} /> : null}
      {loadState.status === "ready" ? <StatisticsContent record={loadState.record} /> : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="atp-panel px-6 py-12 text-center" role="status" aria-live="polite">
      <p className="text-sm font-semibold text-slate-950">Loading match statistics</p>
      <p className="mt-2 text-sm text-slate-500">The current-season statistics file is loaded only for this detail page.</p>
    </div>
  );
}

function UnavailableState() {
  return (
    <div className="atp-panel px-6 py-12 text-center" role="status">
      <p className="text-sm font-semibold text-slate-950">Detailed match statistics are not available for this match.</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Only completed current-season matches with a deterministic source match are published here.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="atp-panel px-6 py-12 text-center" role="alert">
      <p className="text-sm font-semibold text-slate-950">Match statistics could not be loaded.</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">The tournament remains available. Retry this detail when the data connection is ready.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-950/[0.09] bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-lime-300 hover:bg-lime-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}

function StatisticsContent({ record }: { record: MatchStatisticsRecord }) {
  return (
    <div className="space-y-12">
      <MatchScoreboard record={record} />
      <OfficialStatisticsSection record={record} />
      <PreMatchTaleOfTheTape record={record} />
      <HeadToHeadSummary record={record} />
      <ModelSignalsSection record={record} />
      <InterpretationNote />
    </div>
  );
}

function MatchScoreboard({ record }: { record: MatchStatisticsRecord }) {
  const winnerOne = record.players.winnerId === record.players.player1.id;
  const context = [
    record.tournament.name,
    record.tournament.round,
    record.tournament.surface,
    formatDate(record.tournament.date),
    record.tournament.durationMinutes !== undefined ? formatDuration(record.tournament.durationMinutes) : ""
  ].filter((value) => value && value !== "n/a");

  return (
    <section aria-labelledby="match-overview-title" className="overflow-hidden rounded-2xl border border-slate-950/[0.08] bg-white/58 shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-950/[0.07] px-5 py-5 text-center sm:px-8">
        <p className="atp-section-label">Match overview</p>
        <h2 id="match-overview-title" className="sr-only">Completed match result</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">{context.join(" · ")}</p>
      </div>
      <div className="grid bg-slate-950/[0.06] lg:grid-cols-[1fr_minmax(15rem,0.72fr)_1fr] lg:gap-px">
        <div className="order-1 bg-white/80"><ScoreboardPlayer player={record.players.player1} winner={winnerOne} align="left" /></div>
        <div className="order-3 border-t border-slate-950/[0.06] bg-slate-950 px-6 py-7 text-center text-white lg:order-2 lg:border-t-0">
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-lime-300">Final score</p>
          <p className="mt-3 font-mono text-2xl font-semibold tabular-nums sm:text-3xl">{record.tournament.score ?? "Result available"}</p>
        </div>
        <div className="order-2 border-t border-slate-950/[0.06] bg-white/80 lg:order-3 lg:border-t-0">
          <ScoreboardPlayer player={record.players.player2} winner={!winnerOne} align="right" />
        </div>
      </div>
    </section>
  );
}

function ScoreboardPlayer({
  player,
  winner,
  align
}: {
  player: { id?: string; name?: string };
  winner: boolean;
  align: "left" | "right";
}) {
  const content = (
    <div className={`flex min-h-36 flex-col justify-center px-6 py-7 sm:px-8 ${align === "right" ? "lg:items-end lg:text-right" : ""}`}>
      <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${winner ? "text-lime-700" : "text-slate-400"}`}>
        {winner ? <Trophy className="h-4 w-4" aria-hidden="true" /> : null}
        {winner ? "Winner" : "Runner-up"}
      </span>
      <p className={`mt-3 text-2xl tracking-tight text-slate-950 ${winner ? "font-bold" : "font-semibold"}`}>
        {player.name ?? "Unknown player"}
      </p>
    </div>
  );
  return player.id ? (
    <Link href={getPlayerProfilePath(player.id)} className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lime-500/35">
      {content}
    </Link>
  ) : content;
}

function OfficialStatisticsSection({ record }: { record: MatchStatisticsRecord }) {
  const rows = record.officialStatistics ? buildOfficialStatisticRows(record.officialStatistics) : [];
  const player1 = record.players.player1.name ?? "Player 1";
  const player2 = record.players.player2.name ?? "Player 2";
  return (
    <Section
      title="Official match statistics"
      description="Observed service statistics from the completed match. Exact values remain the source of truth; bars support comparison."
    >
      {rows.length === 0 ? (
        <CompactEmpty text="Detailed match statistics are not available for this match." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-950/[0.07] bg-white/48">
          <div className="grid grid-cols-2 border-b border-slate-950/[0.07] px-5 py-4 text-xs font-bold uppercase tracking-[0.12em]">
            <span className="text-sky-700">{player1}</span>
            <span className="text-right text-orange-700">{player2}</span>
          </div>
          <div className="divide-y divide-slate-950/[0.06]">
            {rows.map((row) => <BilateralStatisticRow key={row.key} row={row} player1={player1} player2={player2} />)}
          </div>
        </div>
      )}
    </Section>
  );
}

function BilateralStatisticRow({
  row,
  player1,
  player2
}: {
  row: OfficialStatisticRow;
  player1: string;
  player2: string;
}) {
  const leftWidth = `${((row.player1.raw ?? 0) / row.scaleMax) * 50}%`;
  const rightWidth = `${((row.player2.raw ?? 0) / row.scaleMax) * 50}%`;
  const player1Better = row.advantage === "player1";
  const player2Better = row.advantage === "player2";

  return (
    <div className="px-5 py-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <p className={`font-mono text-base tabular-nums text-slate-950 ${player1Better ? "font-bold" : "font-semibold"}`}>
          {row.player1.label}
          {player1Better ? <span className="ml-2 text-[10px] font-bold uppercase text-emerald-700">Better</span> : null}
        </p>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-600">{row.label}</p>
          {row.helper ? <p className="mt-0.5 text-[10px] text-slate-400">{row.helper}</p> : null}
        </div>
        <p className={`text-right font-mono text-base tabular-nums text-slate-950 ${player2Better ? "font-bold" : "font-semibold"}`}>
          {player2Better ? <span className="mr-2 text-[10px] font-bold uppercase text-emerald-700">Better</span> : null}
          {row.player2.label}
        </p>
      </div>
      <div
        className="relative mt-3 h-2 overflow-hidden rounded-full bg-slate-950/[0.05]"
        aria-label={`${row.label}: ${player1} ${row.player1.label}; ${player2} ${row.player2.label}`}
      >
        <span className="absolute inset-y-0 right-1/2 rounded-l-full bg-sky-500/75" style={{ width: leftWidth }} />
        <span className="absolute inset-y-0 left-1/2 rounded-r-full bg-orange-500/75" style={{ width: rightWidth }} />
        <span className="absolute inset-y-[-2px] left-1/2 w-px bg-slate-500/40" />
      </div>
    </div>
  );
}

function PreMatchTaleOfTheTape({ record }: { record: MatchStatisticsRecord }) {
  const first = record.preMatchContext.player1;
  const second = record.preMatchContext.player2;
  const rows = [
    comparison("ATP rank", formatOptional(first.atpRank, formatRanking), formatOptional(second.atpRank, formatRanking)),
    comparison("ATP points", formatOptional(first.atpPoints), formatOptional(second.atpPoints)),
    comparison("Overall Elo", formatOptional(first.overallElo, oneDecimal), formatOptional(second.overallElo, oneDecimal)),
    comparison("Surface Elo", formatOptional(first.surfaceElo, oneDecimal), formatOptional(second.surfaceElo, oneDecimal)),
    comparison("Overall record", recordLabel(first), recordLabel(second)),
    comparison("Surface record", surfaceRecordLabel(first), surfaceRecordLabel(second)),
    comparison("Recent form", recentLabel(first), recentLabel(second))
  ].filter(hasComparisonValues);

  return (
    <section aria-labelledby="pre-match-title" className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-lime-300">Before the first point</p>
        <h2 id="pre-match-title" className="mt-2 text-2xl font-semibold tracking-tight">Pre-match tale of the tape</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Only information available before the match is shown here.</p>
      </div>
      {rows.length > 0 ? (
        <div className="divide-y divide-white/8 px-6 sm:px-8">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_minmax(8rem,0.75fr)_1fr] items-center gap-3 py-4">
              <span className="font-mono text-sm font-semibold tabular-nums">{row.player1}</span>
              <span className="text-center text-xs font-medium text-slate-400">{row.label}</span>
              <span className="text-right font-mono text-sm font-semibold tabular-nums">{row.player2}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-sm text-slate-400 sm:px-8">Pre-match context is not available for this match.</div>
      )}
    </section>
  );
}

function HeadToHeadSummary({ record }: { record: MatchStatisticsRecord }) {
  const h2h = record.headToHead;
  const player1 = record.players.player1.name ?? "Player 1";
  const player2 = record.players.player2.name ?? "Player 2";
  const hasWins = h2h.player1Wins !== undefined || h2h.player2Wins !== undefined;
  return (
    <Section title="Head-to-head before this match" description="Only meetings strictly before the current match are included.">
      {hasWins ? (
        <div className="grid overflow-hidden rounded-2xl border border-slate-950/[0.07] bg-white/48 md:grid-cols-[1fr_auto_1fr]">
          <H2HPlayer name={player1} wins={h2h.player1Wins} surfaceWins={h2h.player1SurfaceWins} align="left" />
          <div className="flex items-center justify-center border-y border-slate-950/[0.07] px-7 py-6 text-center md:border-x md:border-y-0">
            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-slate-400">Prior meetings</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{formatOptional(h2h.matches)}</p>
              {h2h.previousMatchDate ? <p className="mt-2 text-xs text-slate-500">Previous: {formatDate(h2h.previousMatchDate)}</p> : null}
            </div>
          </div>
          <H2HPlayer name={player2} wins={h2h.player2Wins} surfaceWins={h2h.player2SurfaceWins} align="right" />
        </div>
      ) : <CompactEmpty text="Head-to-head context is not available for this match." />}
    </Section>
  );
}

function H2HPlayer({
  name,
  wins,
  surfaceWins,
  align
}: {
  name: string;
  wins?: number;
  surfaceWins?: number;
  align: "left" | "right";
}) {
  return (
    <div className={`px-6 py-7 ${align === "right" ? "md:text-right" : ""}`}>
      <p className="text-sm font-semibold text-slate-700">{name}</p>
      <p className="mt-3 text-4xl font-semibold tabular-nums text-slate-950">{formatOptional(wins)}</p>
      {surfaceWins !== undefined ? <p className="mt-2 text-xs font-medium text-slate-500">{formatNumber(surfaceWins)} wins on this surface</p> : null}
    </div>
  );
}

function ModelSignalsSection({ record }: { record: MatchStatisticsRecord }) {
  const player1 = record.players.player1.name ?? "Player 1";
  const player2 = record.players.player2.name ?? "Player 2";
  const signals = buildModelSignalRows(record.modelSignals, player1, player2);
  const maxMagnitude = Math.max(...signals.map((signal) => Math.abs(signal.value)), 1);

  return (
    <Section
      title="Model signals"
      description="Calculated pre-match feature differences. Positive values favor Player 1; negative values favor Player 2. They are not causal explanations."
    >
      {signals.length === 0 ? <CompactEmpty text="Model signal context is not available for this match." /> : (
        <div className="space-y-5 rounded-2xl border border-slate-950/[0.07] bg-white/48 px-5 py-6 sm:px-7">
          <div className="flex justify-between gap-4 text-xs font-semibold text-slate-500">
            <span>{player1}</span>
            <span>{player2}</span>
          </div>
          {signals.map((signal) => {
            const width = `${(Math.abs(signal.value) / maxMagnitude) * 50}%`;
            const positive = signal.value > 0;
            return (
              <div key={signal.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700">{signal.label}</p>
                  <p className="font-mono text-sm font-semibold tabular-nums text-slate-950">
                    {signed(signal.value)}
                    <span className="ml-2 font-sans text-[11px] font-medium text-slate-500">{signal.favoredPlayer}</span>
                  </p>
                </div>
                <div
                  className="relative mt-2 h-2 overflow-hidden rounded-full bg-slate-950/[0.05]"
                  aria-label={`${signal.label}: ${signed(signal.value)}, ${signal.favoredPlayer} favored`}
                >
                  <span className="absolute inset-y-0 left-1/2 w-px bg-slate-500/40" />
                  {signal.value !== 0 ? (
                    <span
                      className={`absolute inset-y-0 ${positive ? "right-1/2 rounded-l-full bg-sky-500/75" : "left-1/2 rounded-r-full bg-orange-500/75"}`}
                      style={{ width }}
                    />
                  ) : null}
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Player 1 minus Player 2</p>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function InterpretationNote() {
  return (
    <aside className="flex gap-3 rounded-xl border border-slate-950/[0.07] bg-lime-50/45 px-5 py-4 text-sm leading-6 text-slate-600">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime-700" aria-hidden="true" />
      <p>
        <strong className="text-slate-950">How to read this page:</strong> official match statistics were observed during the completed match;
        pre-match context was known before play; model signals are calculated feature differences and not official statistics.
      </p>
    </aside>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <section aria-labelledby={id}>
      <div className="mb-5 border-b border-slate-950/[0.07] pb-4">
        <h2 id={id} className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

type ComparisonRow = { label: string; player1: string; player2: string };

function comparison(label: string, player1: string, player2: string): ComparisonRow {
  return { label, player1, player2 };
}

function hasComparisonValues(row: ComparisonRow): boolean {
  return row.player1 !== "n/a" || row.player2 !== "n/a";
}

function CompactEmpty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-slate-950/[0.10] bg-white/35 px-5 py-8 text-center text-sm text-slate-500">{text}</p>;
}

function recordLabel(value: PreMatchPlayerContext): string {
  return winRecord(value.priorWins, value.priorMatches, value.priorWinPercentage);
}

function surfaceRecordLabel(value: PreMatchPlayerContext): string {
  return winRecord(value.surfacePriorWins, value.surfacePriorMatches, value.surfacePriorWinPercentage);
}

function recentLabel(value: PreMatchPlayerContext): string {
  return winRecord(value.recent10Wins, value.recent10Matches, value.recent10WinPercentage);
}

function winRecord(wins?: number, matches?: number, percentage?: number): string {
  if (wins === undefined && matches === undefined && percentage === undefined) return "n/a";
  const record = wins !== undefined && matches !== undefined ? `${formatNumber(wins)}-${formatNumber(Math.max(0, matches - wins))}` : null;
  const rate = percentage !== undefined ? `${oneDecimal(percentage)}%` : null;
  return [record, rate].filter(Boolean).join(" · ") || "n/a";
}

function formatOptional(value: number | undefined, formatter: (value: number) => string = (numberValue) => formatNumber(numberValue)): string {
  return value === undefined ? "n/a" : formatter(value);
}

function oneDecimal(value: number): string {
  return formatNumber(value, 1);
}

function signed(value: number): string {
  return `${value > 0 ? "+" : ""}${formatNumber(value, 1)}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}
