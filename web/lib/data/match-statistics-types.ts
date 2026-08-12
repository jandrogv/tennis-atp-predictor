export type MatchStatisticsRatio = {
  value?: number;
  total?: number;
  percentage?: number;
};

export type OfficialPlayerStatistics = {
  aces?: number;
  doubleFaults?: number;
  serviceGames?: number;
  firstServeIn?: MatchStatisticsRatio;
  firstServePointsWon?: MatchStatisticsRatio;
  secondServePointsWon?: MatchStatisticsRatio;
  breakPointsSaved?: MatchStatisticsRatio;
  servicePointsWon?: MatchStatisticsRatio;
};

export type OfficialMatchStatistics = {
  player1: OfficialPlayerStatistics;
  player2: OfficialPlayerStatistics;
};

export type PreMatchPlayerContext = {
  atpRank?: number;
  atpPoints?: number;
  overallElo?: number;
  surfaceElo?: number;
  priorMatches?: number;
  priorWins?: number;
  priorWinPercentage?: number;
  surfacePriorMatches?: number;
  surfacePriorWins?: number;
  surfacePriorWinPercentage?: number;
  recent10Matches?: number;
  recent10Wins?: number;
  recent10WinPercentage?: number;
};

export type HeadToHeadSummary = {
  player1Wins?: number;
  player2Wins?: number;
  matches?: number;
  player1SurfaceWins?: number;
  player2SurfaceWins?: number;
  surfaceMatches?: number;
  previousMatchId?: string;
  previousMatchDate?: string;
};

export type MatchModelSignals = {
  atpPointsDifference?: number;
  atpRankDifference?: number;
  h2hDifference?: number;
  surfaceH2hDifference?: number;
  matchesPlayedDifference?: number;
  recent10WinDifference?: number;
  recent50WinDifference?: number;
  eloPreDifference?: number;
  surfaceEloPreDifference?: number;
  eloGradient10Difference?: number;
};

export type MatchStatisticsRecord = {
  matchId: string;
  year: number;
  status: "completed";
  tournament: {
    id?: string;
    slug?: string;
    name?: string;
    date?: string;
    surface?: string;
    round?: string;
    score?: string;
    durationMinutes?: number;
  };
  players: {
    player1: { id?: string; name?: string };
    player2: { id?: string; name?: string };
    winnerId: string;
  };
  officialStatistics: OfficialMatchStatistics | null;
  preMatchContext: {
    player1: PreMatchPlayerContext;
    player2: PreMatchPlayerContext;
  };
  headToHead: HeadToHeadSummary;
  modelSignals: MatchModelSignals;
};

export type MatchStatisticsCurrentFile = {
  schemaVersion: 1;
  year: number;
  matchCount: number;
  matches: Record<string, MatchStatisticsRecord>;
};
