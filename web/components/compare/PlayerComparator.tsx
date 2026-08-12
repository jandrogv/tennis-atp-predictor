"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { ZoomableChartFrame } from "@/components/charts/ChartZoom";
import { FilterMenu, type FilterOption } from "@/components/filters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComparePlayer, PlayerEloHistory, PlayerSurfaceEloHistory } from "@/lib/data/types";
import { formatNumber, formatNullable, formatPercent, formatRanking, toNumber } from "@/lib/formatters";
import { normalizePlayerId } from "@/lib/routes";

type Surface = "Hard" | "Clay" | "Grass" | "Carpet";
type ChartPoint = { x: number; y: number };
type ChartSeries = { label: string; color: string; points: ChartPoint[] };
type BestMetricKey =
  | "atp_rank"
  | "atp_points"
  | "elo"
  | "hard_elo"
  | "clay_elo"
  | "grass_elo"
  | "carpet_elo"
  | "wins"
  | "losses"
  | "win_rate";
type BestMetricMap = Partial<Record<BestMetricKey, Set<string>>>;

const MAX_SELECTED_PLAYERS = 3;
const MAX_POINTS_PER_SERIES = 180;
const surfaces: Surface[] = ["Hard", "Clay", "Grass", "Carpet"];
const playerColors = ["#0f172a", "#2563eb", "#16a34a"];
const metricDirections: Record<BestMetricKey, "higher" | "lower"> = {
  atp_rank: "lower",
  atp_points: "higher",
  elo: "higher",
  hard_elo: "higher",
  clay_elo: "higher",
  grass_elo: "higher",
  carpet_elo: "higher",
  wins: "higher",
  losses: "lower",
  win_rate: "higher"
};

export function PlayerComparator({ players }: { players: ComparePlayer[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["", "", ""]);
  const [surface, setSurface] = useState<Surface>("Hard");
  const [eloHistory, setEloHistory] = useState<PlayerEloHistory[]>([]);
  const [surfaceHistory, setSurfaceHistory] = useState<PlayerSurfaceEloHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const selectedPlayers = useMemo(
    () =>
      selectedIds
        .filter(Boolean)
        .map((id) => players.find((player) => normalizePlayerId(player.player_id) === id))
        .filter((player): player is ComparePlayer => Boolean(player)),
    [players, selectedIds]
  );
  const selectedIdSet = useMemo(() => new Set(selectedPlayers.map((player) => normalizePlayerId(player.player_id))), [selectedPlayers]);

  useEffect(() => {
    if (selectedIdSet.size === 0) {
      setEloHistory([]);
      setSurfaceHistory([]);
      setHistoryError("");
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError("");

    Promise.all([
      fetchFilteredCsv<PlayerEloHistory>("web_player_elo_history.csv", selectedIdSet),
      fetchFilteredCsv<PlayerSurfaceEloHistory>("web_player_surface_elo_history.csv", selectedIdSet)
    ])
      .then(([overallRows, surfaceRows]) => {
        if (cancelled) {
          return;
        }
        setEloHistory(overallRows);
        setSurfaceHistory(surfaceRows);
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setHistoryError(error.message);
          setEloHistory([]);
          setSurfaceHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedIdSet]);

  const overallSeries = useMemo(
    () => buildOverallSeries(selectedPlayers, eloHistory),
    [eloHistory, selectedPlayers]
  );
  const surfaceSeries = useMemo(
    () => buildSurfaceSeries(selectedPlayers, surfaceHistory, surface),
    [selectedPlayers, surface, surfaceHistory]
  );
  const bestMetrics = useMemo(() => buildBestMetricMap(selectedPlayers), [selectedPlayers]);

  return (
    <div className="space-y-6">
      <Card className="relative z-20 overflow-visible">
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Player selection</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Choose up to three active players. Duplicate selections are disabled.</p>
            </div>
            <Badge tone="info">Max 3 players</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            {Array.from({ length: MAX_SELECTED_PLAYERS }).map((_, index) => (
              <PlayerSelect
                key={index}
                label={`Player ${index + 1}`}
                value={selectedIds[index] ?? ""}
                players={players}
                selectedIds={selectedIds}
                onChange={(value) => {
                  setSelectedIds((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
                }}
              />
            ))}
          </div>
          <div className="atp-inset flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm text-slate-500">
            <span>
              Active players available: <strong className="text-slate-950">{formatNumber(players.length)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(["", "", ""])}
              className="min-h-11 rounded-md border border-slate-950/[0.08] bg-white/80 px-3 py-1.5 xl:min-h-0 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-lime-300 hover:bg-lime-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30"
            >
              Clear selection
            </button>
          </div>
        </CardContent>
      </Card>

      {selectedPlayers.length === 0 ? (
        <EmptyState
          title="Select active players to compare"
          description="Choose up to three active players to compare ATP rank, Elo ratings and Elo evolution."
        />
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-3">
            {selectedPlayers.map((player, index) => (
              <PlayerComparisonCard key={player.player_id} player={player} color={playerColors[index]} bestMetrics={bestMetrics} />
            ))}
          </section>

          {historyError ? (
            <EmptyState title="Could not load Elo history" description={historyError} />
          ) : null}

          <section className="grid gap-6 xl:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader>
                <div>
                  <CardTitle>Overall Elo evolution</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Aligned by normalized match index for visual comparison.</p>
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <LoadingState title="Loading Elo history" description="Preparing the selected players' overall Elo curves." rows={2} />
                ) : overallSeries.length > 0 ? (
                  <ZoomableChartFrame
                    title="Overall Elo evolution"
                    description="Aligned by normalized match index for visual comparison."
                    expandedContent={
                      <MultiLineChart series={overallSeries} xLabel="normalized_match_index" yLabel="elo" variant="expanded" />
                    }
                  >
                    <MultiLineChart series={overallSeries} xLabel="normalized_match_index" yLabel="elo" />
                  </ZoomableChartFrame>
                ) : (
                  <EmptyState title="No Elo history available for the selected players." />
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Surface Elo evolution</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Surface series use a common visual origin.</p>
                  </div>
                  <SurfaceTabs value={surface} onChange={setSurface} />
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <LoadingState title="Loading surface Elo history" description={`Preparing ${surface} Elo curves for the selected players.`} rows={2} />
                ) : surfaceSeries.length > 0 ? (
                  <div>
                    <ZoomableChartFrame
                      title={`${surface} surface Elo evolution`}
                      description="Surface series use a common visual origin."
                      controls={<SurfaceBadge surface={surface} />}
                      expandedContent={
                        <MultiLineChart
                          series={surfaceSeries}
                          xLabel="surface_match_index"
                          yLabel="surface_elo"
                          alignXOrigin
                          variant="expanded"
                        />
                      }
                    >
                      <MultiLineChart series={surfaceSeries} xLabel="surface_match_index" yLabel="surface_elo" alignXOrigin />
                    </ZoomableChartFrame>
                  </div>
                ) : (
                  <EmptyState title={`No ${surface} surface Elo history for the selected players.`} />
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function PlayerSelect({
  label,
  value,
  players,
  selectedIds,
  onChange
}: {
  label: string;
  value: string;
  players: ComparePlayer[];
  selectedIds: string[];
  onChange: (value: string) => void;
}) {
  const disabledIds = new Set(selectedIds.filter((id) => id && id !== value));
  const playerOptions: Array<FilterOption<string>> = [
    { value: "", label: "Select active player" },
    ...players.map((player) => {
      const playerId = normalizePlayerId(player.player_id);
      return {
        value: playerId,
        label: `${player.player_name} ${formatRanking(player.atp_rank)}`,
        disabled: disabledIds.has(playerId)
      };
    })
  ];

  return (
    <FilterMenu
      label={label}
      value={value}
      options={playerOptions}
      onChange={onChange}
      ariaLabel={`${label} selector`}
    />
  );
}
function PlayerComparisonCard({
  player,
  color,
  bestMetrics
}: {
  player: ComparePlayer;
  color: string;
  bestMetrics: BestMetricMap;
}) {
  return (
    <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-lift">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{formatNullable(player.player_name)}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">ID {normalizePlayerId(player.player_id)}</p>
          </div>
          <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm">
          <MetricRow label="ATP rank" value={formatRanking(player.atp_rank)} highlight={isBestMetric(bestMetrics, player, "atp_rank")} />
          <MetricRow label="ATP points" value={formatNumber(player.atp_points)} highlight={isBestMetric(bestMetrics, player, "atp_points")} />
          <MetricRow label="Overall Elo" value={formatNumber(player.elo, 1)} highlight={isBestMetric(bestMetrics, player, "elo")} />
          <MetricRow label="Hard Elo" value={formatNumber(player.hard_elo, 1)} highlight={isBestMetric(bestMetrics, player, "hard_elo")} />
          <MetricRow label="Clay Elo" value={formatNumber(player.clay_elo, 1)} highlight={isBestMetric(bestMetrics, player, "clay_elo")} />
          <MetricRow label="Grass Elo" value={formatNumber(player.grass_elo, 1)} highlight={isBestMetric(bestMetrics, player, "grass_elo")} />
          <MetricRow label="Carpet Elo" value={formatNumber(player.carpet_elo, 1)} highlight={isBestMetric(bestMetrics, player, "carpet_elo")} />
          <MetricRow label="Matches played" value={formatNumber(player.matches_played)} />
          <MetricRow label="Wins" value={formatNumber(player.wins)} highlight={isBestMetric(bestMetrics, player, "wins")} />
          <MetricRow label="Losses" value={formatNumber(player.losses)} highlight={isBestMetric(bestMetrics, player, "losses")} />
          <MetricRow label="Win rate" value={formatPercent(winRateForPlayer(player))} highlight={isBestMetric(bestMetrics, player, "win_rate")} />
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <dt className="text-slate-500">Best surface</dt>
            <dd>{player.best_surface ? <SurfaceBadge surface={player.best_surface} /> : <Badge>n/a</Badge>}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`inline-flex items-center justify-end gap-2 rounded-full px-2 py-1 text-right font-medium transition ${
          highlight
            ? "border border-lime-300/50 bg-lime-100/70 text-emerald-800 shadow-sm shadow-lime-200/40"
            : "text-slate-950"
        }`}
        title={highlight ? "Best among selected players for this metric" : undefined}
      >
        <span>{value}</span>
        {highlight ? <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Best</span> : null}
      </dd>
    </div>
  );
}

function buildBestMetricMap(players: ComparePlayer[]): BestMetricMap {
  if (players.length < 2) {
    return {};
  }

  return (Object.keys(metricDirections) as BestMetricKey[]).reduce<BestMetricMap>((bestMetrics, metric) => {
    const values = players
      .map((player) => ({
        playerId: normalizePlayerId(player.player_id),
        value: getMetricValue(player, metric)
      }))
      .filter((item): item is { playerId: string; value: number } => item.value !== null);

    if (values.length < 2) {
      return bestMetrics;
    }

    const direction = metricDirections[metric];
    const bestValue =
      direction === "lower"
        ? Math.min(...values.map((item) => item.value))
        : Math.max(...values.map((item) => item.value));
    const winners = values.filter((item) => Math.abs(item.value - bestValue) < 0.000001);

    if (winners.length === 0 || winners.length === values.length) {
      return bestMetrics;
    }

    bestMetrics[metric] = new Set(winners.map((item) => item.playerId));
    return bestMetrics;
  }, {});
}

function isBestMetric(bestMetrics: BestMetricMap, player: ComparePlayer, metric: BestMetricKey): boolean {
  return bestMetrics[metric]?.has(normalizePlayerId(player.player_id)) ?? false;
}

function getMetricValue(player: ComparePlayer, metric: BestMetricKey): number | null {
  if (metric === "win_rate") {
    return winRateForPlayer(player);
  }
  return toNumber(player[metric]);
}

function winRateForPlayer(player: ComparePlayer): number | null {
  const wins = toNumber(player.wins);
  const losses = toNumber(player.losses);
  if (wins === null || losses === null || wins + losses <= 0) {
    return null;
  }
  return wins / (wins + losses);
}

function SurfaceTabs({ value, onChange }: { value: Surface; onChange: (surface: Surface) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-slate-950/[0.06] bg-white/55 p-1 shadow-sm">
      {surfaces.map((surface) => (
        <button
          key={surface}
          type="button"
          onClick={() => onChange(surface)}
          className={`min-h-11 rounded-md border px-3 py-1.5 text-xs font-semibold xl:min-h-0 shadow-sm transition ${
            value === surface
              ? "border-slate-950 bg-slate-950 text-white"
              : "border-transparent bg-transparent text-slate-600 hover:bg-white hover:text-slate-950"
          }`}
        >
          {surface}
        </button>
      ))}
    </div>
  );
}

function MultiLineChart({
  series,
  xLabel,
  yLabel,
  alignXOrigin = false,
  variant = "compact"
}: {
  series: ChartSeries[];
  xLabel: string;
  yLabel: string;
  alignXOrigin?: boolean;
  variant?: "compact" | "expanded";
}) {
  const allPoints = series.flatMap((item) => item.points);
  const xMin = alignXOrigin ? 1 : Math.min(...allPoints.map((point) => point.x));
  const xMax = Math.max(...allPoints.map((point) => point.x), xMin + 1);
  const yMinRaw = Math.min(...allPoints.map((point) => point.y));
  const yMaxRaw = Math.max(...allPoints.map((point) => point.y));
  const yPadding = Math.max(20, (yMaxRaw - yMinRaw) * 0.08);
  const yMin = yMinRaw - yPadding;
  const yMax = yMaxRaw + yPadding;
  const expanded = variant === "expanded";
  const width = expanded ? 1040 : 700;
  const height = expanded ? 440 : 280;
  const padding = expanded
    ? { top: 28, right: 28, bottom: 52, left: 66 }
    : { top: 18, right: 18, bottom: 38, left: 50 };

  return (
    <div>
      <div className="atp-chart-shell">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`${expanded ? "h-[min(58vh,520px)] min-h-[360px]" : "h-80"} w-full`}
          role="img"
          aria-label={`${yLabel} by ${xLabel}`}
        >
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#cbd5e1" />
          {[0, 0.5, 1].map((tick) => {
            const y = padding.top + tick * (height - padding.top - padding.bottom);
            const value = yMax - tick * (yMax - yMin);
            return (
              <g key={tick}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px]">
                  {formatNumber(value, 0)}
                </text>
              </g>
            );
          })}
          {series.map((item) => (
            <path
              key={item.label}
              d={pathForPoints(item.points, xMin, xMax, yMin, yMax, width, height, padding)}
              fill="none"
              stroke={item.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.4}
            />
          ))}
          <text x={padding.left} y={height - 10} className="fill-slate-500 text-[11px]">
            {xLabel}
          </text>
          <text x={padding.left} y={14} className="fill-slate-500 text-[11px]">
            {yLabel}
          </text>
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        {series.map((item) => {
          const lastPoint = item.points[item.points.length - 1];
          return (
            <span key={item.label} className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}: {formatNumber(lastPoint?.y, 1)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function buildOverallSeries(players: ComparePlayer[], history: PlayerEloHistory[]): ChartSeries[] {
  return players
    .map((player, index) => {
      const playerId = normalizePlayerId(player.player_id);
      const points = history
        .filter((row) => normalizePlayerId(row.player_id) === playerId)
        .map((row) => toChartPoint(row.match_index, row.elo))
        .filter((point): point is ChartPoint => point !== null)
        .sort((a, b) => a.x - b.x);
      const firstMatchIndex = points[0]?.x ?? 0;
      const normalizedPoints = points.map((point) => ({
        x: point.x - firstMatchIndex,
        y: point.y
      }));
      return {
        label: player.player_name,
        color: playerColors[index] ?? "#64748b",
        points: downsamplePoints(normalizedPoints)
      };
    })
    .filter((item) => item.points.length > 0);
}

function buildSurfaceSeries(players: ComparePlayer[], history: PlayerSurfaceEloHistory[], surface: Surface): ChartSeries[] {
  return players
    .map((player, index) => {
      const playerId = normalizePlayerId(player.player_id);
      const rawPoints = history
        .filter((row) => normalizePlayerId(row.player_id) === playerId && row.surface === surface)
        .map((row) => toChartPoint(row.surface_match_index, row.surface_elo))
        .filter((point): point is ChartPoint => point !== null)
        .sort((a, b) => a.x - b.x);
      const alignedPoints = rawPoints.map((point, pointIndex) => ({
        x: pointIndex + 1,
        y: point.y
      }));
      return {
        label: player.player_name,
        color: playerColors[index] ?? "#64748b",
        points: downsamplePoints(alignedPoints)
      };
    })
    .filter((item) => item.points.length > 0);
}

function pathForPoints(
  points: ChartPoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
): string {
  return points
    .map((point, index) => {
      const xRange = xMax - xMin || 1;
      const yRange = yMax - yMin || 1;
      const x = padding.left + ((point.x - xMin) / xRange) * (width - padding.left - padding.right);
      const y = height - padding.bottom - ((point.y - yMin) / yRange) * (height - padding.top - padding.bottom);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

async function fetchFilteredCsv<T extends { player_id: string }>(fileName: string, selectedIds: Set<string>): Promise<T[]> {
  const response = await fetch(`/data/${fileName}`);
  if (!response.ok) {
    throw new Error(`Could not load ${fileName}`);
  }
  const text = await response.text();
  return parseFilteredCsv<T>(text, selectedIds);
}

function parseFilteredCsv<T extends { player_id: string }>(text: string, selectedIds: Set<string>): T[] {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  const playerIdIndex = headers.indexOf("player_id");
  if (playerIdIndex === -1) {
    return [];
  }
  return lines.flatMap((line) => {
    const values = line.split(",");
    const playerId = normalizePlayerId(values[playerIdIndex] ?? "");
    if (!selectedIds.has(playerId)) {
      return [];
    }
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as T;
    return [row];
  });
}

function toChartPoint(xValue: string, yValue: string): ChartPoint | null {
  const x = toNumber(xValue);
  const y = toNumber(yValue);
  if (x === null || y === null) {
    return null;
  }
  return { x, y };
}

function downsamplePoints(points: ChartPoint[]): ChartPoint[] {
  if (points.length <= MAX_POINTS_PER_SERIES) {
    return points;
  }
  const sampled: ChartPoint[] = [];
  const step = (points.length - 1) / (MAX_POINTS_PER_SERIES - 1);
  for (let index = 0; index < MAX_POINTS_PER_SERIES; index += 1) {
    sampled.push(points[Math.round(index * step)]);
  }
  return sampled;
}
