# Future improvements

This roadmap describes technically meaningful next steps. It is ordered by analytical credibility and product value rather than by visual novelty.

## Data

- Expand source reconciliation and record provenance at field level.
- Improve identity resolution for players with name changes or missing identifiers.
- Quantify coverage by season, tournament tier, surface and statistic family.
- Add freshness indicators and automated stale-fixture detection.
- Evaluate whether older eras should be down-weighted or segmented.

## Feature engineering

- Complete formal pre-match verification for every sequential feature.
- Add rest days, travel distance and tournament-stage workload where reliable.
- Model opponent-adjusted recent form rather than raw win rates alone.
- Explore serve and return strength as separate latent signals.
- Add uncertainty-aware features for sparse-history and missing-stat cases.

## Modeling

- Establish an untouched post-selection lockbox and rolling-origin backtests.
- Compare time-decay strategies and recency-weighted training.
- Evaluate ensembles only when they improve both discrimination and calibration.
- Add calibration by surface or ranking band when sample size supports it.
- Produce prediction intervals or uncertainty bands, not only point probabilities.
- Monitor drift, calibration decay and subgroup performance across refreshes.

## Analytics

- Add surface and tournament-tier evaluation slices.
- Visualize expected-versus-observed outcomes over time.
- Explain changes in a player's Elo and form with event annotations.
- Add richer draw progression and tournament-strength views.
- Separate model confidence from data-quality confidence in the interface.

## Product

- Add saved player comparisons without introducing unnecessary tracking.
- Improve empty, stale and low-evidence states.
- Add accessible table-to-chart alternatives and keyboard-first exploration.
- Make data publication time and model version more visible.
- Add lightweight sharing views for player and match comparisons.

## Engineering

- Introduce continuous frontend tests, dependency review and secret scanning.
- Automate data-contract checks before publication.
- Add observability for failed refreshes and stale outputs without exposing private operations.
- Track bundle, route and static-data budgets in continuous integration.
- Expand accessibility testing and structured manual review.
- Define a safe rollback process for both data publications and frontend releases.
