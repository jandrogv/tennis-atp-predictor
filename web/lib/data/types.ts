export type MatchCard = {
  match_id: string;
  tournament_name: string;
  match_date: string;
  year: string;
  round: string;
  surface: string;
  player_1_id: string;
  player_1_name: string;
  player_2_id: string;
  player_2_name: string;
  predicted_winner_id: string;
  predicted_winner_name: string;
  player_1_win_probability: string;
  player_2_win_probability: string;
  ELO_PRE_DIFF: string;
  ELO_SURFACE_PRE_DIFF: string;
  ATP_RANK_DIFF: string;
  ATP_POINT_DIFF: string;
  H2H_DIFF: string;
  H2H_SURFACE_DIFF: string;
  confidence: string;
  confidence_band: string;
  product_confidence_band: string;
  explanation_risk_level: string;
  model_agreement_score: string;
  visible_signal_agreement_score: string;
  visible_signal_conflict_reasons: string;
  recommended_explanation_copy: string;
  model_used: string;
  generated_at: string;
};

export type MatchDetail = {
  match_id: string;
  player_1_id: string;
  player_2_id: string;
  player_1_name: string;
  player_2_name: string;
  player_1_win_probability: string;
  player_2_win_probability: string;
  predicted_winner_id: string;
  predicted_winner_name: string;
  tournament_name: string;
  surface: string;
  round: string;
  match_date: string;
  ELO_PRE_DIFF: string;
  ELO_SURFACE_PRE_DIFF: string;
  ATP_RANK_DIFF: string;
  ATP_POINT_DIFF: string;
  H2H_DIFF: string;
  H2H_SURFACE_DIFF: string;
  confidence: string;
  confidence_band: string;
  product_confidence_band: string;
  explanation_risk_level: string;
  model_agreement_score: string;
  visible_signal_agreement_score: string;
  visible_signal_conflict_reasons: string;
  recommended_explanation_copy: string;
  favorite_player_id: string;
  favorite_player_name: string;
  underdog_player_id: string;
  underdog_player_name: string;
  favorite_reason_group: string;
};

export type SanityCheckerPrediction = {
  match_id: string;
  confidence_band?: string;
  product_confidence_band?: string;
  explanation_risk_level?: string;
  recommended_explanation_copy?: string;
  model_agreement_score?: string;
  visible_signal_agreement_score?: string;
  visible_signal_conflict_reasons?: string;
  baseline_visible_favorite?: string;
  baseline_visible_confidence_bucket?: string;
  safe_plus_agrees_with_official?: string;
  monotonic_agrees_with_official?: string;
  baseline_visible_agrees_with_official?: string;
};

export type PlayerRanking = {
  player_id: string;
  player_name: string;
  elo: string;
  elo_rank: string;
  elo_change_10: string;
  elo_rank_change_10: string;
  atp_rank: string;
  atp_points: string;
  hard_elo: string;
  hard_elo_rank: string;
  hard_elo_change_10: string;
  hard_elo_rank_change_10: string;
  clay_elo: string;
  clay_elo_rank: string;
  clay_elo_change_10: string;
  clay_elo_rank_change_10: string;
  grass_elo: string;
  grass_elo_rank: string;
  grass_elo_change_10: string;
  grass_elo_rank_change_10: string;
  carpet_elo: string;
  carpet_elo_rank: string;
  carpet_elo_change_10: string;
  carpet_elo_rank_change_10: string;
  matches_played: string;
  is_active: string;
};

export type PlayerDirectoryEntry = {
  player_id: string;
  player_name: string;
  country: string;
  is_active: string;
  atp_rank: string;
  atp_points: string;
  overall_elo: string;
  elo_rank: string;
  best_surface: string;
  matches: string;
  last_10_record: string;
  last_30_record: string;
};

export type AtpRanking = {
  ranking_date: string;
  player_id: string;
  player_name: string;
  atp_rank: string;
  atp_points: string;
  atp_points_change: string;
  atp_rank_change: string;
  country: string;
  age: string;
  source_file: string;
};

export type AtpRankingWithElo = AtpRanking & {
  elo: string;
  elo_rank: string;
};

export type PlayerProfile = {
  player_id: string;
  player_name: string;
  name_first: string;
  name_last: string;
  hand: string;
  dob: string;
  ioc: string;
  height: string;
  wikidata_id: string;
  atp_rank: string;
  atp_points: string;
  elo: string;
  elo_rank: string;
  best_surface: string;
  best_surface_elo: string;
  historical_matches: string;
  prediction_appearances: string;
  wins: string;
  losses: string;
  win_loss_record: string;
  last_match_date: string;
  is_active: string;
};

export type PlayerEloHistory = {
  player_id: string;
  player_name: string;
  match_index: string;
  elo: string;
};

export type PlayerRecentMatch = {
  player_id: string;
  match_date: string;
  tournament_name: string;
  surface: string;
  round: string;
  opponent_id: string;
  opponent_name: string;
  result: string;
  winner_id: string;
  winner_name: string;
  score: string;
  source: string;
};

export type PlayerSurfaceSummary = {
  player_id: string;
  surface: string;
  matches: string;
  wins: string;
  losses: string;
  win_rate: string;
  surface_elo: string;
  surface_elo_rank: string;
};

export type PlayerSurfaceEloHistory = {
  player_id: string;
  player_name: string;
  surface: string;
  surface_match_index: string;
  surface_elo: string;
};

export type ComparePlayer = PlayerProfile & {
  hard_elo: string;
  clay_elo: string;
  grass_elo: string;
  carpet_elo: string;
  matches_played: string;
};

export type AtpRankingTableRow = AtpRanking & {
  country: string;
  age: string;
};

export type ModelSummary = {
  selected_model: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1: string;
  roc_auc: string;
  n_features: string;
  n_train_rows: string;
  n_test_rows: string;
  top_1_feature: string;
  top_2_feature: string;
  top_3_feature: string;
};

export type ModelMetric = {
  accuracy: string;
  precision: string;
  recall: string;
  f1: string;
  roc_auc: string;
  model: string;
  n_train: string;
  n_test: string;
};

export type ModelBaseline = {
  baseline_name: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1: string;
  roc_auc: string;
  n_test_rows: string;
  notes: string;
  selected_model: string;
  model_accuracy: string;
  model_roc_auc: string;
  accuracy_lift: string;
  roc_auc_lift: string;
};

export type ConfusionMatrixCell = {
  actual_class: string;
  predicted_class: string;
  count: string;
};

export type ProbabilityBin = {
  probability_bin: string;
  rows: string;
  mean_probability: string;
  actual_positive_rate: string;
  accuracy: string;
};

export type ModelDiagnostics = {
  selected_model: string;
  n_test_rows: string;
  accuracy: string;
  roc_auc: string;
  baseline_accuracy: string;
  baseline_roc_auc: string;
  accuracy_lift: string;
  roc_auc_lift: string;
  notes: string;
};

export type FeatureImportance = {
  rank: string;
  feature: string;
  importance: string;
};

export type Tournament = {
  tournament_id: string;
  tournament_name: string;
  date: string;
  end_date: string;
  tournament_date: string;
  match_date: string;
  year: string;
  country: string;
  location: string;
  category: string;
  draw_size: string;
  surface: string;
  matches_count: string;
  predictions_count: string;
  overview_link: string;
  results_link: string;
  draws_link: string;
  terminado: string;
  Excel: string;
  source_file: string;
  phase: string;
  winner_name: string;
  loser_name: string;
};

export type TournamentDetail = {
  tournament_id: string;
  tournament_slug: string;
  tournament_name: string;
  year: string;
  surface: string;
  tournament_date: string;
  start_date: string;
  end_date: string;
  location: string;
  country: string;
  draw_size: string;
  prize_money: string;
  last_winner: string;
  has_completed_matches: string;
  has_predictions: string;
  completed_matches_count: string;
  predictions_count: string;
};

export type TournamentMatch = {
  tournament_id: string;
  tournament_slug: string;
  tournament_name: string;
  year: string;
  match_date: string;
  surface: string;
  round: string;
  round_raw: string;
  round_display: string;
  round_order: string;
  id_num: string;
  draw_match_number: string;
  draw_position_source: string;
  source_match_num: string;
  player_1_id: string;
  player_1_name: string;
  player_2_id: string;
  player_2_name: string;
  winner_id: string;
  winner_name: string;
  score: string;
  source_split: string;
  match_id: string;
  has_match_statistics: string;
};
