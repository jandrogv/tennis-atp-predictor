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

There is not yet a separate untouched final lockbox after candidate selection. The later-season holdout supports comparison and reporting, so its figures may be optimistic relative to a fully independent final test. Establishing a locked final evaluation period is a roadmap priority.

## Leakage posture

Sequential features are designed to read historical state before applying the current result. Nevertheless, the public metrics come from a legacy-compatible feature configuration that allows two Elo-derived columns still awaiting strict pre-match proof. The model is therefore presented as experimental, and no claim of leakage-free performance is made.
