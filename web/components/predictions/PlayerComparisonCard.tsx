"use client";

import { useMemo, useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import type { MatchDetail, PlayerRanking } from "@/lib/data/types";
import { formatNumber, formatNullable, formatPercent, formatRanking, toNumber } from "@/lib/formatters";

type ViewMode = "table" | "visual";
type DifferenceKey = "ELO_PRE_DIFF" | "ELO_SURFACE_PRE_DIFF" | "ATP_RANK_DIFF" | "ATP_POINT_DIFF" | "H2H_DIFF" | "H2H_SURFACE_DIFF";

type ComparisonMetric = {
  label: string;
  playerOneValue: string;
  playerTwoValue: string;
  playerOneWidth: number;
  playerTwoWidth: number;
};

type PlayerComparisonCardProps = {
  match: MatchDetail;
  playerOneRanking?: PlayerRanking;
  playerTwoRanking?: PlayerRanking;
};

const differenceMetrics: Array<{ key: DifferenceKey; label: string; visualScale: number; lowerIsBetter?: boolean }> = [
  { key: "ELO_PRE_DIFF", label: "Overall Elo diff", visualScale: 300 },
  { key: "ELO_SURFACE_PRE_DIFF", label: "Surface Elo diff", visualScale: 300 },
  { key: "ATP_RANK_DIFF", label: "ATP rank diff", visualScale: 100, lowerIsBetter: true },
  { key: "ATP_POINT_DIFF", label: "ATP points diff", visualScale: 5000 },
  { key: "H2H_DIFF", label: "H2H diff", visualScale: 5 },
  { key: "H2H_SURFACE_DIFF", label: "Surface H2H diff", visualScale: 3 }
];

export function PlayerComparisonCard({ match, playerOneRanking, playerTwoRanking }: PlayerComparisonCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const differenceRows = useMemo(() => buildDifferenceRows(match), [match]);
  const visualMetrics = useMemo(
    () => buildVisualMetrics(match, playerOneRanking, playerTwoRanking),
    [match, playerOneRanking, playerTwoRanking]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Player comparison</CardTitle>
        <div className="inline-flex rounded-lg border border-slate-950/[0.08] bg-white/65 p-1 shadow-sm" role="group" aria-label="Player comparison view">
          <ViewButton active={viewMode === "table"} label="Table" onClick={() => setViewMode("table")}>
            <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
          </ViewButton>
          <ViewButton active={viewMode === "visual"} label="Visual" onClick={() => setViewMode("visual")}>
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
          </ViewButton>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "table" ? (
          <ComparisonTable match={match} metrics={differenceRows} />
        ) : (
          <ComparisonBars match={match} metrics={visualMetrics} />
        )}
      </CardContent>
    </Card>
  );
}

function ViewButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 xl:h-8 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/40",
        active ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-lime-50 hover:text-slate-950"
      )}
    >
      {children}
      {label}
    </button>
  );
}

function ComparisonTable({ match, metrics }: { match: MatchDetail; metrics: ComparisonMetric[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="atp-table">
        <thead className="text-left">
          <tr>
            <th className="px-4 py-3">Signal</th>
            <th className="px-4 py-3 text-right">{formatNullable(match.player_1_name)}</th>
            <th className="px-4 py-3 text-right">{formatNullable(match.player_2_name)}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {metrics.map((metric) => (
            <tr key={metric.label} className="hover:bg-lime-50/35">
              <td className="px-4 py-3 font-medium text-slate-700">{metric.label}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">{metric.playerOneValue}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-600">{metric.playerTwoValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonBars({ match, metrics }: { match: MatchDetail; metrics: ComparisonMetric[] }) {
  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] items-end gap-2 border-b border-slate-950/[0.06] pb-4 text-xs font-semibold sm:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)] sm:gap-3">
        <p className="truncate text-right text-slate-950">{formatNullable(match.player_1_name)}</p>
        <p className="text-center uppercase tracking-[0.12em] text-slate-400">Signal</p>
        <p className="truncate text-slate-950">{formatNullable(match.player_2_name)}</p>
      </div>

      <div className="divide-y divide-slate-950/[0.05]">
        {metrics.map((metric) => (
          <div key={metric.label} className="grid grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] items-center gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)] sm:gap-3">
            <MirroredBar side="left" width={metric.playerOneWidth} value={metric.playerOneValue} />
            <p className="text-center text-[11px] font-semibold leading-4 text-slate-600 sm:text-xs">{metric.label}</p>
            <MirroredBar side="right" width={metric.playerTwoWidth} value={metric.playerTwoValue} />
          </div>
        ))}
      </div>

      <p className="border-t border-slate-950/[0.06] pt-4 text-xs leading-5 text-slate-500">
        Values come from the current player ranking artifact. Each pair of bars shares the same scale for that metric; match-snapshot differences and H2H signals remain available in the table view.
      </p>
    </div>
  );
}

function MirroredBar({ side, width, value }: { side: "left" | "right"; width: number; value: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-1 sm:gap-2", side === "left" && "flex-row-reverse")}>
      <span className={cn("w-[3.25rem] shrink-0 text-[11px] font-semibold tabular-nums text-slate-700 sm:w-[4.25rem] sm:text-xs", side === "left" ? "text-left" : "text-right")}>{value}</span>
      <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-950/[0.05]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", side === "left" ? "ml-auto bg-lime-500" : "bg-slate-700")}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function buildDifferenceRows(match: MatchDetail): ComparisonMetric[] {
  const playerOneProbability = clampPercentage((toNumber(match.player_1_win_probability) ?? 0) * 100);
  const playerTwoProbability = clampPercentage((toNumber(match.player_2_win_probability) ?? 0) * 100);
  const metrics: ComparisonMetric[] = [{
    label: "Win probability",
    playerOneValue: formatPercent(match.player_1_win_probability),
    playerTwoValue: formatPercent(match.player_2_win_probability),
    playerOneWidth: playerOneProbability,
    playerTwoWidth: playerTwoProbability
  }];

  for (const definition of differenceMetrics) {
    const rawDifference = toNumber(match[definition.key]);
    if (rawDifference === null) {
      metrics.push({ label: definition.label, playerOneValue: "n/a", playerTwoValue: "n/a", playerOneWidth: 0, playerTwoWidth: 0 });
      continue;
    }
    const favorableDirection = definition.lowerIsBetter ? -rawDifference : rawDifference;
    const width = normalizeDifference(rawDifference, definition.visualScale);
    metrics.push({
      label: definition.label,
      playerOneValue: formatNumber(rawDifference, 1),
      playerTwoValue: formatNumber(-rawDifference, 1),
      playerOneWidth: favorableDirection > 0 ? width : 0,
      playerTwoWidth: favorableDirection < 0 ? width : 0
    });
  }
  return metrics;
}

function buildVisualMetrics(
  match: MatchDetail,
  playerOneRanking?: PlayerRanking,
  playerTwoRanking?: PlayerRanking
): ComparisonMetric[] {
  const playerOneProbability = clampPercentage((toNumber(match.player_1_win_probability) ?? 0) * 100);
  const playerTwoProbability = clampPercentage((toNumber(match.player_2_win_probability) ?? 0) * 100);
  const surfaceKey = getSurfaceEloKey(match.surface);
  const playerOneElo = toNumber(playerOneRanking?.elo);
  const playerTwoElo = toNumber(playerTwoRanking?.elo);
  const playerOneSurfaceElo = surfaceKey ? toNumber(playerOneRanking?.[surfaceKey]) : null;
  const playerTwoSurfaceElo = surfaceKey ? toNumber(playerTwoRanking?.[surfaceKey]) : null;
  const playerOneRank = toNumber(playerOneRanking?.atp_rank);
  const playerTwoRank = toNumber(playerTwoRanking?.atp_rank);
  const playerOnePoints = toNumber(playerOneRanking?.atp_points);
  const playerTwoPoints = toNumber(playerTwoRanking?.atp_points);

  return [
    {
      label: "Win probability",
      playerOneValue: formatPercent(match.player_1_win_probability),
      playerTwoValue: formatPercent(match.player_2_win_probability),
      playerOneWidth: playerOneProbability,
      playerTwoWidth: playerTwoProbability
    },
    buildAbsoluteMetric("Overall Elo", playerOneElo, playerTwoElo, (value) => formatNumber(value, 0), eloWidths),
    buildAbsoluteMetric(
      `${formatSurfaceLabel(match.surface)} Elo`,
      playerOneSurfaceElo,
      playerTwoSurfaceElo,
      (value) => formatNumber(value, 0),
      eloWidths
    ),
    buildAbsoluteMetric("ATP rank", playerOneRank, playerTwoRank, formatRanking, rankingWidths),
    buildAbsoluteMetric("ATP points", playerOnePoints, playerTwoPoints, (value) => formatNumber(value, 0), proportionalWidths)
  ];
}

function buildAbsoluteMetric(
  label: string,
  playerOneValue: number | null,
  playerTwoValue: number | null,
  formatter: (value: number | null) => string,
  widthCalculator: (playerOneValue: number | null, playerTwoValue: number | null) => [number, number]
): ComparisonMetric {
  const [playerOneWidth, playerTwoWidth] = widthCalculator(playerOneValue, playerTwoValue);
  return {
    label,
    playerOneValue: formatter(playerOneValue),
    playerTwoValue: formatter(playerTwoValue),
    playerOneWidth,
    playerTwoWidth
  };
}

function proportionalWidths(playerOneValue: number | null, playerTwoValue: number | null): [number, number] {
  const maximum = Math.max(playerOneValue ?? 0, playerTwoValue ?? 0);
  if (maximum <= 0) return [0, 0];
  return [barWidth(playerOneValue, maximum), barWidth(playerTwoValue, maximum)];
}

function eloWidths(playerOneValue: number | null, playerTwoValue: number | null): [number, number] {
  const values = [playerOneValue, playerTwoValue].filter((value): value is number => value !== null);
  if (values.length === 0) return [0, 0];
  const baseline = Math.min(1400, Math.floor(Math.min(...values) / 100) * 100);
  const ceiling = Math.max(2200, Math.ceil(Math.max(...values) / 100) * 100);
  const range = Math.max(1, ceiling - baseline);
  return [scaledWidth(playerOneValue, baseline, range), scaledWidth(playerTwoValue, baseline, range)];
}

function rankingWidths(playerOneValue: number | null, playerTwoValue: number | null): [number, number] {
  const validRanks = [playerOneValue, playerTwoValue].filter((value): value is number => value !== null && value > 0);
  if (validRanks.length === 0) return [0, 0];
  const bestRank = Math.min(...validRanks);
  return [rankingWidth(playerOneValue, bestRank), rankingWidth(playerTwoValue, bestRank)];
}

function rankingWidth(value: number | null, bestRank: number): number {
  if (value === null || value <= 0) return 0;
  return Math.max(12, Math.min(100, (bestRank / value) * 100));
}

function scaledWidth(value: number | null, baseline: number, range: number): number {
  if (value === null) return 0;
  return Math.max(6, Math.min(100, ((value - baseline) / range) * 100));
}

function barWidth(value: number | null, maximum: number): number {
  if (value === null || value <= 0) return 0;
  return Math.max(6, Math.min(100, (value / maximum) * 100));
}

function getSurfaceEloKey(surface: string): "hard_elo" | "clay_elo" | "grass_elo" | "carpet_elo" | null {
  const normalized = surface.trim().toLowerCase();
  if (normalized.includes("hard")) return "hard_elo";
  if (normalized.includes("clay")) return "clay_elo";
  if (normalized.includes("grass")) return "grass_elo";
  if (normalized.includes("carpet")) return "carpet_elo";
  return null;
}

function formatSurfaceLabel(surface: string): string {
  const normalized = surface.trim();
  return normalized && normalized.toLowerCase() !== "nan" ? normalized : "Surface";
}

function normalizeDifference(value: number, visualScale: number): number {
  if (value === 0) return 0;
  return Math.min(100, Math.max(10, Math.abs(value) / visualScale * 100));
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}
