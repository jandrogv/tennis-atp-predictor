import type {
  MatchModelSignals,
  MatchStatisticsRatio,
  OfficialMatchStatistics,
  OfficialPlayerStatistics
} from "../data/match-statistics-types.ts";

export type StatisticDirection = "higher-is-better" | "lower-is-better" | "neutral";
export type StatisticKey = keyof OfficialPlayerStatistics;

export type OfficialStatisticConfig = {
  key: StatisticKey;
  label: string;
  format: "number" | "ratio";
  direction: StatisticDirection;
  helper?: string;
};

export type StatisticValue = {
  raw?: number;
  label: string;
};

export type OfficialStatisticRow = OfficialStatisticConfig & {
  player1: StatisticValue;
  player2: StatisticValue;
  advantage: "player1" | "player2" | "even" | "none";
  scaleMax: number;
};

export const OFFICIAL_STATISTIC_CONFIG: readonly OfficialStatisticConfig[] = [
  { key: "aces", label: "Aces", format: "number", direction: "higher-is-better" },
  { key: "doubleFaults", label: "Double faults", format: "number", direction: "lower-is-better", helper: "Lower is better" },
  { key: "serviceGames", label: "Service games", format: "number", direction: "neutral" },
  { key: "firstServeIn", label: "First serve in", format: "ratio", direction: "neutral" },
  { key: "firstServePointsWon", label: "First serve points won", format: "ratio", direction: "higher-is-better" },
  { key: "secondServePointsWon", label: "Second serve points won", format: "ratio", direction: "higher-is-better" },
  { key: "breakPointsSaved", label: "Break points saved", format: "ratio", direction: "higher-is-better" },
  { key: "servicePointsWon", label: "Service points won", format: "ratio", direction: "higher-is-better" }
] as const;

export function buildOfficialStatisticRows(statistics: OfficialMatchStatistics): OfficialStatisticRow[] {
  return OFFICIAL_STATISTIC_CONFIG.flatMap((config) => {
    const player1 = statisticValue(statistics.player1[config.key], config.format);
    const player2 = statisticValue(statistics.player2[config.key], config.format);
    if (player1.raw === undefined && player2.raw === undefined) return [];
    const scaleMax = Math.max(player1.raw ?? 0, player2.raw ?? 0, 1);
    return [{
      ...config,
      player1,
      player2,
      advantage: statisticAdvantage(player1.raw, player2.raw, config.direction),
      scaleMax
    }];
  });
}

export type ModelSignalRow = {
  key: keyof MatchModelSignals;
  label: string;
  value: number;
  favoredPlayer: string;
};

const MODEL_SIGNAL_CONFIG: ReadonlyArray<{ key: keyof MatchModelSignals; label: string }> = [
  { key: "atpRankDifference", label: "ATP ranking advantage" },
  { key: "atpPointsDifference", label: "ATP points advantage" },
  { key: "eloPreDifference", label: "Pre-match Elo advantage" },
  { key: "surfaceEloPreDifference", label: "Surface Elo advantage" },
  { key: "h2hDifference", label: "Previous H2H advantage" },
  { key: "surfaceH2hDifference", label: "Surface H2H advantage" },
  { key: "recent10WinDifference", label: "Recent-form advantage (last 10)" },
  { key: "recent50WinDifference", label: "Recent-form advantage (last 50)" },
  { key: "matchesPlayedDifference", label: "Experience volume difference" },
  { key: "eloGradient10Difference", label: "Elo trend difference" }
];

export function buildModelSignalRows(
  signals: MatchModelSignals,
  player1Name: string,
  player2Name: string
): ModelSignalRow[] {
  return MODEL_SIGNAL_CONFIG.flatMap(({ key, label }) => {
    const value = signals[key];
    if (value === undefined) return [];
    return [{
      key,
      label,
      value,
      favoredPlayer: value > 0 ? player1Name : value < 0 ? player2Name : "Even"
    }];
  });
}

function statisticValue(value: number | MatchStatisticsRatio | undefined, format: "number" | "ratio"): StatisticValue {
  if (value === undefined) return { label: "n/a" };
  if (format === "number" && typeof value === "number") {
    return { raw: value, label: formatNumeric(value) };
  }
  if (typeof value === "number") return { raw: value, label: formatNumeric(value) };
  const raw = value.percentage;
  const percentage = value.percentage === undefined ? null : `${formatNumeric(value.percentage)}%`;
  const counts = value.value !== undefined && value.total !== undefined
    ? `(${formatNumeric(value.value)}/${formatNumeric(value.total)})`
    : null;
  return { raw, label: [percentage, counts].filter(Boolean).join(" ") || "n/a" };
}

function statisticAdvantage(
  player1: number | undefined,
  player2: number | undefined,
  direction: StatisticDirection
): OfficialStatisticRow["advantage"] {
  if (player1 === undefined || player2 === undefined || direction === "neutral") return "none";
  if (player1 === player2) return "even";
  const player1IsBetter = direction === "higher-is-better" ? player1 > player2 : player1 < player2;
  return player1IsBetter ? "player1" : "player2";
}

function formatNumeric(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
