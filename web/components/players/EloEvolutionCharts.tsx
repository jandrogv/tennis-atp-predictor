import { EmptyState } from "@/components/EmptyState";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { ZoomableChartFrame } from "@/components/charts/ChartZoom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerEloHistory, PlayerSurfaceEloHistory } from "@/lib/data/types";
import { formatNumber, toNumber } from "@/lib/formatters";

type ChartPoint = {
  x: number;
  y: number;
};

const MAX_POINTS_PER_SERIES = 180;
const chartColors: Record<string, string> = {
  Hard: "#2563eb",
  Clay: "#c2410c",
  Grass: "#16a34a",
  Carpet: "#7c3aed"
};

export function EloEvolutionCharts({
  eloHistory,
  surfaceEloHistory
}: {
  eloHistory: PlayerEloHistory[];
  surfaceEloHistory: PlayerSurfaceEloHistory[];
}) {
  const overallPoints = downsamplePoints(
    eloHistory
      .map((row) => toChartPoint(row.match_index, row.elo))
      .filter((point): point is ChartPoint => point !== null)
  );
  const surfaceSeries = groupSurfaceHistory(surfaceEloHistory);

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">Elo evolution</h3>
        <p className="mt-1 text-sm text-slate-600">
          Elo evolution is shown across the player&apos;s processed match history.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Overall Elo evolution</CardTitle>
              <p className="mt-1 text-sm text-slate-500">General rating after each processed match.</p>
            </div>
          </CardHeader>
          <CardContent>
            {overallPoints.length > 0 ? (
              <ZoomableChartFrame
                title="Overall Elo evolution"
                description="General rating after each processed match."
                expandedContent={
                  <LineChart
                    series={[{ label: "Overall", color: "#0f172a", points: overallPoints }]}
                    xLabel="processed matches"
                    yLabel="Elo"
                    variant="expanded"
                  />
                }
              >
                <LineChart
                  series={[{ label: "Overall", color: "#0f172a", points: overallPoints }]}
                  xLabel="processed matches"
                  yLabel="Elo"
                />
              </ZoomableChartFrame>
            ) : (
              <EmptyState title="No Elo history available for this player." />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <CardTitle>Surface Elo evolution</CardTitle>
              <p className="mt-1 text-sm text-slate-500">General rating after each processed match by surface.</p>
            </div>
          </CardHeader>
          <CardContent>
            {surfaceSeries.length > 0 ? (
              <div>
                <ZoomableChartFrame
                  title="Surface Elo evolution"
                  description="General rating after each processed match by surface."
                  controls={surfaceSeries.map((series) => (
                    <SurfaceBadge key={series.label} surface={series.label} />
                  ))}
                  expandedContent={
                    <LineChart series={surfaceSeries} xLabel="processed matches" yLabel="surface Elo" variant="expanded" />
                  }
                >
                  <LineChart series={surfaceSeries} xLabel="processed matches" yLabel="surface Elo" />
                </ZoomableChartFrame>
              </div>
            ) : (
              <EmptyState
                title="Surface Elo history is not available for this player yet."
                description="Current Surface Elo can still appear in the profile when ranking data is available."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function LineChart({
  series,
  xLabel,
  yLabel,
  variant = "compact"
}: {
  series: Array<{ label: string; color: string; points: ChartPoint[] }>;
  xLabel: string;
  yLabel: string;
  variant?: "compact" | "expanded";
}) {
  const points = series.flatMap((item) => item.points);
  const xMin = Math.min(...points.map((point) => point.x));
  const xMax = Math.max(...points.map((point) => point.x));
  const yMinRaw = Math.min(...points.map((point) => point.y));
  const yMaxRaw = Math.max(...points.map((point) => point.y));
  const yPadding = Math.max(20, (yMaxRaw - yMinRaw) * 0.08);
  const yMin = yMinRaw - yPadding;
  const yMax = yMaxRaw + yPadding;
  const expanded = variant === "expanded";
  const width = expanded ? 1040 : 640;
  const height = expanded ? 440 : 260;
  const padding = expanded
    ? { top: 28, right: 28, bottom: 52, left: 66 }
    : { top: 18, right: 18, bottom: 36, left: 48 };

  return (
    <div>
      <div className="atp-chart-shell">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${yLabel} by ${xLabel}`}
          className={`${expanded ? "h-[min(58vh,520px)] min-h-[360px]" : "h-72"} w-full`}
        >
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#cbd5e1"
          />
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

function groupSurfaceHistory(rows: PlayerSurfaceEloHistory[]): Array<{ label: string; color: string; points: ChartPoint[] }> {
  const grouped = new Map<string, ChartPoint[]>();
  rows.forEach((row) => {
    const point = toChartPoint(row.surface_match_index, row.surface_elo);
    if (!point) {
      return;
    }
    const surface = row.surface || "Unknown";
    grouped.set(surface, [...(grouped.get(surface) ?? []), point]);
  });
  return Array.from(grouped.entries())
    .map(([surface, points]) => {
      const sortedPoints = points.sort((a, b) => a.x - b.x);
      const firstSurfaceMatchIndex = sortedPoints[0]?.x ?? 0;
      const normalizedPoints = sortedPoints.map((point) => ({
        x: point.x - firstSurfaceMatchIndex,
        y: point.y
      }));
      return {
        label: surface,
        color: chartColors[surface] ?? "#64748b",
        points: downsamplePoints(normalizedPoints)
      };
    })
    .filter((item) => item.points.length > 0)
    .sort((a, b) => surfaceOrder(a.label) - surfaceOrder(b.label));
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

function surfaceOrder(surface: string): number {
  const normalized = surface.toLowerCase();
  if (normalized.includes("hard")) return 1;
  if (normalized.includes("clay")) return 2;
  if (normalized.includes("grass")) return 3;
  if (normalized.includes("carpet")) return 4;
  return 9;
}
