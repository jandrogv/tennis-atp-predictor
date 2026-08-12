# Data pipeline

## Data domains

The analytical system works with four connected domains:

- **Players:** stable identifiers, names, nationality, handedness and available biographical attributes.
- **Rankings:** dated ATP rank and point snapshots.
- **Tournaments:** edition, location, category, surface, dates and draw context.
- **Matches:** competitors, winner, score, round, date and available serve statistics.

The public product receives derived subsets of these domains rather than the raw sources.

## Acquisition and historical coverage

Historical match data supplies the long-term sequence needed for ratings and form. Current-season tournament, ranking and match records extend that history and supply upcoming fixtures. Source coverage is not uniform: older seasons and lower-level events may contain fewer identifiers or point-by-point statistics.

## Cleaning and normalization

Normalization addresses the recurring problems in multi-source sports data:

- trimming and canonicalizing player names;
- standardizing numeric identifiers without losing precision;
- harmonizing surface and round labels;
- parsing dates and tournament editions consistently;
- distinguishing played matches from scheduled fixtures;
- converting ranking, point and serve fields to validated numeric types;
- removing exact duplicates while preserving legitimate repeat matchups.

Identity resolution uses player identifiers whenever available and treats names as descriptive attributes rather than primary keys.

## Temporal treatment

Sequential features depend on order. Matches are sorted by season, tournament timing and stable within-source order. Historical state is carried forward, while the later evaluation season is kept separate from training history.

The current offline dataset uses 1991–2025 records for training and 2026 records for a later-season holdout. Feature preparation reduces the raw holdout to rows that satisfy the model's input requirements.

## Preparation for machine learning

Each match is represented as a comparison between Player 1 and Player 2. Numeric features are expressed primarily as differences, which gives the model a consistent orientation. The target indicates whether Player 1 won. Orientation balancing prevents the source's winner-first layout from becoming a trivial target leak.

Metadata needed for lineage and temporal checks is retained privately but excluded from model inputs and public datasets.

## Preparation for the web

Publication transforms analytical outputs into task-specific products:

- compact prediction cards and detailed prediction records;
- player directories, profiles, histories and surface summaries;
- ATP and Elo ranking snapshots;
- tournament summaries, matches and partition indexes;
- model metrics, baseline comparisons and calibration bins;
- selected match statistics for completed matches.

Large collections are partitioned where route-level access benefits from smaller payloads. Static indexes describe available partitions, enabling deterministic loading without exposing private storage structure.

## Quality gates

Before publication, the system checks schema presence, critical identifiers, uniqueness, relationships between summary and detail records, probability ranges, match-stat consistency and tournament partition integrity. Warnings distinguish incomplete source coverage from hard contract violations.

Further detail is available in [Data quality](data-quality.md).
