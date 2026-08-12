# Limitations

## Data coverage

Historical coverage is uneven. Recent ATP seasons generally contain richer identities and match statistics than older records. Qualifying, lower-level or interrupted events may have incomplete tournament context. Missing data is not distributed randomly, so models can perform differently across eras and player groups.

## Player cold starts

New, returning or rarely observed players have limited Elo history, recent-form windows and head-to-head evidence. Default ratings provide continuity but not individualized certainty. Predictions involving sparse-history players should be treated more cautiously.

## Match statistics

Serve-performance features depend on valid denominators and source availability. Older matches often lack detailed statistics, and incomplete fields reduce the effective evidence behind rolling windows. A missing value is not evidence of average performance.

## Surface imbalance

Hard-court data dominates the modern calendar. Grass has a short annual season, while carpet is mainly historical. Surface-specific ratings and evaluation slices therefore have different sample sizes and stability.

## Unobserved context

The model does not reliably observe:

- injuries and physical condition;
- fatigue, travel and recovery time;
- withdrawals or late substitutions;
- weather, indoor conditions and ball changes;
- tactical matchups and coaching changes;
- motivation or schedule priorities.

These factors can matter more than historical averages for a single match.

## Temporal and leakage risk

Sequential features are intended to use only prior matches, but correctness depends on stable chronological ordering and pre-match source values. The current public metrics come from a legacy-compatible feature configuration that permits two Elo-derived signals whose strict pre-match timing has not yet been fully verified. Until that audit is closed, the published score may overstate generalization.

## Evaluation design

The later-season holdout is more realistic than a random split, but it is not a fully untouched final lockbox. Candidate comparison and final reporting currently use the same holdout. Repeated analytical decisions based on that period can gradually overfit the evaluation set.

Subgroup performance by surface, tournament level, ranking band and player-history depth is not yet reported comprehensively.

## Probability uncertainty

A probability is a model estimate, not an observed property of a match. Aggregate calibration can look good while individual subgroups are miscalibrated. Point estimates do not currently include confidence intervals or uncertainty caused by missing data.

## Distribution shift

Tour composition, playing styles, ranking rules and event schedules evolve. A model trained on long history can become stale, and very old matches may not reflect the current tour. Monitoring and rolling backtests are needed to distinguish normal variance from structural change.

## Product freshness

The public site is driven by generated static data. Between refreshes, rankings, schedules, withdrawals and match status may become stale. The site should display publication context and should not be treated as a live official score service.

## Responsible use

ATP Insight is a portfolio and research product. Predictions are experimental, do not constitute betting advice and cannot guarantee future results. Users should not make financial decisions from these outputs.
