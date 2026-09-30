# Modeling

## Objective

The model estimates the probability that Player 1 wins an ATP men's singles match. The target is binary, and player orientation is balanced during feature construction so Player 1 is not synonymous with the source-record winner.

## Training population

The current evaluation uses 98,022 training rows drawn from 1991–2025 history. The later 2026 partition contains 2,202 engineered rows before model-input validation; 1,698 complete rows are used by the published evaluation.

This is a time-aware separation between historical training data and a later season. It is preferable to a purely random split for a changing sport, although a single later season does not represent every future environment.

## Candidate models

The internal research workflow supports multiple families:

- tree ensembles as robust tabular baselines;
- gradient-boosted trees for nonlinear interactions;
- a basic neural-network experiment;
- calibrated wrappers for probability quality.

The current standard comparison contains XGBoost and a sigmoid-calibrated XGBoost variant. Hyperparameter search takes place within training data. Calibration, when used, is fitted on an internal training partition rather than on the later-season holdout.

## Feature contract

Model inputs are numeric comparative features. Player names, identifiers, source metadata, split labels and the target are excluded. The operational model uses 77 features spanning rankings, player context, head-to-head, rolling results, serve-performance form and Elo signals.

Input validation rejects missing required columns and prevents target or source metadata from entering the estimator. Feature order is saved with the private model artifact and checked again for prediction.

## Baseline

The primary baseline predicts the higher ATP-ranked player. It is intentionally simple, understandable and difficult to dismiss. Comparing against it asks whether the richer feature set adds value beyond information already visible in the official ranking.

## Probability calibration

Classification accuracy alone does not establish trustworthy probabilities. Evaluation also includes Brier score, log loss, expected calibration error and probability-bin reliability. A calibrated candidate is retained even when it is not selected, because calibration can trade a small amount of ranking performance for more conservative probabilities.

## Selection and reporting

Candidates are compared on consistent metrics. The current selected model is uncalibrated XGBoost because it leads the published comparison on ROC AUC, accuracy, Brier score and log loss, while the sigmoid-calibrated candidate has slightly lower expected calibration error.

The published legacy evaluation has no separate untouched final lockbox after candidate selection. The same later-season holdout supports comparison and reporting, so its figures may be optimistic. The opt-in strict implementation now separates an earlier selection period from a later final test, but it has not been used to replace the operational model or produce new public metrics.

## Leakage posture

The 29 September audit confirmed that the legacy inputs `ELO_DIFF` and `ELO_SURFACE_DIFF` are calculated after applying the match result. This leaks outcome information into training. The operational model remains legacy-compatible, so its public scores are not evidence of leakage-free predictive performance.

The opt-in `strict-pre-match-v3` contract excludes these columns, uses pre-match Elo and updates history after the verified result availability day, which can differ from the match start day. All temporal dates must use a verified common UTC day basis, declared as `temporal_date_basis=UTC`; local or unspecified bases and earlier feature contracts are rejected. Pending matches cannot update history. Temporal cross-validation, internal calibration and final evaluation use separate chronological periods. The final data fingerprint rejects changes after selection.

Strict mode requires verified match-level dates throughout the input. The local 2026 annual dataset currently lacks those dates, and 17 derived date corrections are verified for presentation without establishing UTC days for training. Tests validate the code with synthetic inputs; no real strict training or performance improvement is claimed. Verified ranking and player-context availability before the match day are also required; these declarations must be supported by source evidence. See [the audit and transition procedure](validacion-temporal-estricta.md) and [the sourced date corrections](auditoria-fechas-partidos-2026-09-30.md).
