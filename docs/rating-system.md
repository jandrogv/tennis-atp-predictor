# Rating system

## Why Elo

ATP rankings reward tournament results under official tour rules. Elo answers a different question: given the sequence and quality of past opponents, what relative playing strength does the history imply?

This makes Elo useful as both an analytical ranking and a predictive feature. It updates after every completed match, reacts to upsets and does not require fixed tournament point tables.

## General Elo

All players begin from a common neutral rating. Before a match, the difference between the two ratings is converted into an expected win probability. After the result, the winner gains and the loser gives up the same amount of rating. An upset produces a larger adjustment than an expected result.

Conceptually:

\[
E_A = \frac{1}{1 + 10^{(R_B - R_A)/400}}
\]

\[
R'_A = R_A + K(S_A - E_A)
\]

where \(R_A\) is the current rating, \(E_A\) the expected score, \(S_A\) the observed result and \(K\) the update scale.

## Surface Elo

Tennis surfaces change pace, bounce and movement demands. ATP Insight therefore maintains independent rating state for hard, clay, grass and carpet. A clay match updates clay Elo but not the player's grass Elo.

Surface ratings are valuable for specialists, but they are also sparser. Grass seasons are short and carpet is largely historical, so confidence in those ratings varies with match volume.

## Temporal update order

For predictive use, the rating difference should be captured before the current match changes either rating. The match result is then applied to the state used by future matches. Stable chronological ordering is therefore part of the rating contract, not merely a sorting preference.

## Trend features

Recent rating histories can be summarized as slopes over several horizons. These features ask whether one player's underlying rating trajectory is improving faster than the other's. Short trends are responsive and noisy; long trends are stable and may lag form changes.

## Interpretation in the product

The web application presents:

- an overall Elo leaderboard;
- surface-specific rankings;
- recent rating movement;
- player rating histories;
- Elo differences within match explanations.

Elo is one signal among many. It does not directly observe injuries, fatigue or tactical matchup details, and it becomes less reliable for players with limited history.
