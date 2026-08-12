# Feature engineering

## Design principle

Tennis is sequential. A feature for match *t* should summarize only evidence available before match *t*. ATP Insight therefore treats player history, ratings and rolling statistics as state that changes after each completed match.

Most inputs are comparative differences between Player 1 and Player 2. Positive and negative values describe the direction and magnitude of an advantage while remaining compatible with balanced player orientation.

## Feature families

### ATP ranking context

- Difference in official ATP rank
- Difference in ATP ranking points
- Draw size and tournament context

Ranking position is ordinal while ranking points provide a wider measure of recent tour performance. Both are retained because equal rank gaps can represent different point gaps.

### Player attributes and experience

- Age difference
- Height difference
- Difference in historical matches played

These fields offer physical and experience context. Missing biographical values reduce coverage and are not imputed with claims of certainty.

### Head-to-head history

- Overall head-to-head win difference
- Surface-specific head-to-head win difference

The counters are intended to be read before the current result is added. Small samples are common, so head-to-head is a supporting signal rather than a standalone forecast.

### Recent form

Rolling win-rate differences summarize multiple horizons, from very short windows to broader recent history. Short windows react quickly but are noisy; longer windows are steadier but slower to reflect changes.

### Serve-performance form

When source statistics are available, rolling differences are calculated for:

- ace rate;
- double-fault rate;
- first-serve-in rate;
- first-serve points won;
- second-serve points won;
- break points saved.

Multiple window lengths let the model contrast immediate form with a more stable historical profile. Ratios are calculated only when their denominators are valid.

### Elo and surface strength

- General Elo difference
- Surface-specific Elo difference
- Recent Elo trend differences across several horizons

Elo supplies a continuous strength estimate and reacts to opponent quality. Surface Elo distinguishes hard, clay, grass and the limited carpet history.

## Orientation and target construction

Source match records naturally identify a winner and loser. Training directly on that orientation would reveal the target. ATP Insight balances orientation so either competitor can become Player 1, swaps all paired features consistently and updates the target accordingly.

## Leakage controls and open risk

The intended safe calculation order is:

1. read both players' historical state;
2. emit pre-match features;
3. observe the result;
4. update ratings and rolling histories.

Head-to-head and recent-form calculations follow this pattern. The current published metrics, however, come from a legacy-compatible operational configuration that permits two Elo-derived columns whose strict pre-match status has not yet been fully proven. This is a material evaluation limitation and is discussed in [Evaluation](evaluation.md) and [Limitations](limitations.md).

## Interpreting feature importance

The current model ranks surface Elo difference, general Elo difference and medium-horizon recent win rate among its strongest signals. Importance describes how the fitted tree model used a feature; it does not prove causality and can be shared across correlated variables.
