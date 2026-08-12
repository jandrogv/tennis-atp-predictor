import { readCsv, readJson } from "@/lib/data/csv";
import type {
  AtpRanking,
  ComparePlayer,
  ConfusionMatrixCell,
  FeatureImportance,
  MatchCard,
  MatchDetail,
  ModelBaseline,
  ModelDiagnostics,
  ModelMetric,
  ModelSummary,
  PlayerEloHistory,
  PlayerDirectoryEntry,
  PlayerProfile,
  PlayerRanking,
  PlayerRecentMatch,
  PlayerSurfaceSummary,
  PlayerSurfaceEloHistory,
  ProbabilityBin,
  SanityCheckerPrediction,
  Tournament,
  TournamentDetail,
  TournamentMatch
} from "@/lib/data/types";
import type { MatchStatisticsCurrentFile, MatchStatisticsRecord } from "@/lib/data/match-statistics-types";
import { normalizePlayerId } from "@/lib/routes";

export type DataPartitionEntry = {
  key: string;
  file: string;
  rows: number;
};

export type DataPartitionIndex = {
  version: number;
  source: string;
  label: string;
  latest: string | null;
  entries: DataPartitionEntry[];
};

export async function getMatchCards(): Promise<MatchCard[]> {
  return readCsv<MatchCard>("web_match_cards.csv");
}


export async function getCurrentMatchStatistics(): Promise<MatchStatisticsCurrentFile> {
  return readJson<MatchStatisticsCurrentFile>("match-statistics-current.json");
}

export async function getCurrentMatchStatisticsById(matchId: string): Promise<MatchStatisticsRecord | undefined> {
  const file = await getCurrentMatchStatistics();
  return file.matches[decodeURIComponent(matchId)];
}
export async function getMatchDetails(): Promise<MatchDetail[]> {
  return readCsv<MatchDetail>("web_match_details.csv");
}

export async function getSanityCheckerPredictions(): Promise<SanityCheckerPrediction[]> {
  try {
    return await readCsv<SanityCheckerPrediction>("sanity_checker_predictions.csv");
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }
    throw error;
  }
}

export async function getSanityCheckerPredictionByMatchId(
  matchId: string
): Promise<SanityCheckerPrediction | undefined> {
  const rows = await getSanityCheckerPredictions();
  const decodedMatchId = decodeURIComponent(matchId);
  return rows.find((row) => row.match_id === decodedMatchId);
}

export async function getPlayerRankings(): Promise<PlayerRanking[]> {
  return readCsv<PlayerRanking>("web_player_rankings.csv");
}

export async function getPlayersDirectory(): Promise<PlayerDirectoryEntry[]> {
  return readCsv<PlayerDirectoryEntry>("web_players_directory.csv");
}

export async function getAtpRankings(): Promise<AtpRanking[]> {
  try {
    return await readCsv<AtpRanking>("web_atp_rankings.csv");
  } catch {
    return readCsv<AtpRanking>("player_atp_rankings.csv");
  }
}

export async function getInitialAtpRankingSnapshot(): Promise<{
  rankings: AtpRanking[];
  dates: string[];
  selectedDate: string;
}> {
  try {
    const index = await readJson<DataPartitionIndex>("atp-rankings/index.json");
    const selectedDate = index.latest ?? index.entries[0]?.key ?? "";
    const selectedEntry = index.entries.find((entry) => entry.key === selectedDate);
    if (!selectedEntry) {
      return { rankings: [], dates: [], selectedDate: "" };
    }
    const rankings = await readCsv<AtpRanking>(`atp-rankings/${selectedEntry.file}`);
    return { rankings, dates: index.entries.map((entry) => entry.key), selectedDate };
  } catch (error) {
    if (!isMissingFileError(error)) throw error;
    const rankings = await getAtpRankings();
    const dates = Array.from(new Set(rankings.map((row) => row.ranking_date).filter(Boolean))).sort((a, b) => b.localeCompare(a));
    const selectedDate = dates[0] ?? "";
    return {
      rankings: rankings.filter((row) => !selectedDate || row.ranking_date === selectedDate),
      dates,
      selectedDate
    };
  }
}

export async function getPlayerProfiles(): Promise<PlayerProfile[]> {
  return readCsv<PlayerProfile>("web_player_profiles.csv");
}

export async function getPlayerRecentMatches(playerId: string): Promise<PlayerRecentMatch[]> {
  const normalizedPlayerId = normalizePlayerId(playerId);
  const rows = await readCsv<PlayerRecentMatch>("web_player_recent_matches.csv");
  return rows.filter((row) => normalizePlayerId(row.player_id) === normalizedPlayerId);
}

export async function getPlayerSurfaceSummary(playerId: string): Promise<PlayerSurfaceSummary[]> {
  const normalizedPlayerId = normalizePlayerId(playerId);
  const rows = await readCsv<PlayerSurfaceSummary>("web_player_surface_summary.csv");
  return rows.filter((row) => normalizePlayerId(row.player_id) === normalizedPlayerId);
}

export async function getActiveComparePlayers(): Promise<ComparePlayer[]> {
  const [profiles, rankings] = await Promise.all([getPlayerProfiles(), getPlayerRankings()]);
  const rankingById = new Map(rankings.map((ranking) => [normalizePlayerId(ranking.player_id), ranking]));
  const enriched = profiles.map((profile) => {
    const ranking = rankingById.get(normalizePlayerId(profile.player_id));
    return {
      ...profile,
      hard_elo: ranking?.hard_elo ?? "",
      clay_elo: ranking?.clay_elo ?? "",
      grass_elo: ranking?.grass_elo ?? "",
      carpet_elo: ranking?.carpet_elo ?? "",
      matches_played: ranking?.matches_played ?? profile.historical_matches
    };
  });
  const active = enriched.filter((player) => player.is_active.toLowerCase() === "true");
  const fallback = enriched.filter(
    (player) => hasCurrentSignal(player.atp_rank) || Number(player.prediction_appearances) > 0
  );
  return (active.length > 0 ? active : fallback).sort(compareComparePlayers);
}

export async function getPlayerEloHistory(playerId: string): Promise<PlayerEloHistory[]> {
  const normalizedPlayerId = normalizePlayerId(playerId);
  const rows = await readCsv<PlayerEloHistory>("web_player_elo_history.csv");
  return rows
    .filter((row) => normalizePlayerId(row.player_id) === normalizedPlayerId)
    .sort((a, b) => Number(a.match_index) - Number(b.match_index));
}

function compareComparePlayers(a: ComparePlayer, b: ComparePlayer): number {
  const rankA = hasCurrentSignal(a.atp_rank) ? Number(a.atp_rank) : Number.NaN;
  const rankB = hasCurrentSignal(b.atp_rank) ? Number(b.atp_rank) : Number.NaN;
  if (Number.isFinite(rankA) || Number.isFinite(rankB)) {
    if (!Number.isFinite(rankA)) return 1;
    if (!Number.isFinite(rankB)) return -1;
    return rankA - rankB;
  }
  return a.player_name.localeCompare(b.player_name);
}

function hasCurrentSignal(value: string): boolean {
  return value.trim() !== "" && value.toLowerCase() !== "nan";
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT";
}

export async function getPlayerSurfaceEloHistory(playerId: string): Promise<PlayerSurfaceEloHistory[]> {
  const normalizedPlayerId = normalizePlayerId(playerId);
  const rows = await readCsv<PlayerSurfaceEloHistory>("web_player_surface_elo_history.csv");
  return rows
    .filter((row) => normalizePlayerId(row.player_id) === normalizedPlayerId)
    .sort((a, b) => {
      const surfaceCompare = a.surface.localeCompare(b.surface);
      if (surfaceCompare !== 0) {
        return surfaceCompare;
      }
      return Number(a.surface_match_index) - Number(b.surface_match_index);
    });
}

export async function getModelSummary(): Promise<ModelSummary | null> {
  const rows = await readCsv<ModelSummary>("web_model_summary.csv");
  return rows[0] ?? null;
}

export async function getModelMetrics(): Promise<ModelMetric[]> {
  return readCsv<ModelMetric>("model_metrics.csv");
}

export async function getModelBaseline(): Promise<ModelBaseline[]> {
  return readCsv<ModelBaseline>("web_model_baseline.csv");
}

export async function getConfusionMatrix(): Promise<ConfusionMatrixCell[]> {
  return readCsv<ConfusionMatrixCell>("web_confusion_matrix.csv");
}

export async function getProbabilityBins(): Promise<ProbabilityBin[]> {
  return readCsv<ProbabilityBin>("web_probability_bins.csv");
}

export async function getModelDiagnostics(): Promise<ModelDiagnostics | null> {
  const rows = await readCsv<ModelDiagnostics>("web_model_diagnostics.csv");
  return rows[0] ?? null;
}

export async function getFeatureImportance(): Promise<FeatureImportance[]> {
  return readCsv<FeatureImportance>("feature_importance.csv");
}

export async function getTournaments(): Promise<Tournament[]> {
  return readCsv<Tournament>("tournaments.csv");
}

export async function getTournamentDetails(): Promise<TournamentDetail[]> {
  return readCsv<TournamentDetail>("web_tournament_details.csv");
}

export async function getTournamentMatches(): Promise<TournamentMatch[]> {
  return readCsv<TournamentMatch>("web_tournament_matches.csv");
}
