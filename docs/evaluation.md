# Evaluation

## Evaluation frame

The current published evaluation trains on match history from 1991–2025 and scores a later 2026 holdout. After input validation, the evaluation contains 1,698 matches. All candidate rows shown below come from the same run and use the same evaluation population.

## Results

| Candidate | Accuracy | Precision | Recall | F1 | ROC AUC | Brier | Log loss | ECE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| XGBoost | 0.8457 | 0.8512 | 0.8453 | 0.8482 | 0.9209 | 0.1117 | 0.3588 | 0.0198 |
| XGBoost + sigmoid calibration | 0.8392 | 0.8468 | 0.8360 | 0.8414 | 0.9180 | 0.1135 | 0.3678 | 0.0186 |
| Higher-ranked-player baseline | 0.6284 | 0.6346 | 0.6397 | 0.6371 | 0.6597 | — | — | — |

The selected XGBoost improves accuracy by 21.73 percentage points and ROC AUC by 0.2612 over the ranking baseline on this holdout.

## Confusion matrix

| Actual / predicted | Player 2 | Player 1 |
|---|---:|---:|
| Player 2 | 704 | 128 |
| Player 1 | 134 | 732 |

The two orientation classes are close to balanced, and the error counts are similar in both directions.

## Metric interpretation

- **Accuracy:** share of matches with the correct predicted winner.
- **Precision:** among Player 1 win predictions, the share that were correct.
- **Recall:** share of actual Player 1 wins recovered by the model.
- **F1:** harmonic mean of precision and recall.
- **ROC AUC:** ability to rank winners above losers across probability thresholds.
- **Brier score:** mean squared probability error; lower is better.
- **Log loss:** heavily penalizes confident wrong probabilities; lower is better.
- **Expected calibration error:** weighted gap between predicted and observed rates across probability bins; lower is better.

## Calibration observations

Across ten equal-width probability bands, observed win rates generally track predicted probabilities. The central bands are noisier because they contain fewer matches, while the most confident bins contain more observations. A low aggregate calibration error does not guarantee calibration for a specific surface, tournament tier or player subgroup.

The calibrated candidate is less extreme: it produces far fewer probabilities above 95% or below 5%. In this run that conservatism does not improve Brier score or log loss, but it slightly improves expected calibration error.

## Important limitations

These metrics are **offline holdout results**, not live production monitoring.

1. Candidate comparison and final reporting share the same holdout; there is no separate post-selection lockbox.
2. The operational feature configuration includes two Elo-derived signals whose strict pre-match timing still requires proof.
3. Coverage and missingness differ by era, player and surface.
4. The evaluation does not measure injuries, withdrawals or stale upcoming-match information.
5. A single later season may not capture future distribution shift.

For these reasons, the numbers demonstrate the current analytical system but should not be interpreted as guaranteed future performance.
