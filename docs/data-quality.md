# Data quality

## Why validation matters

Sports data combines identities, chronological events and derived statistics. A file can be syntactically valid while still being analytically wrong: a player can change identifiers, a match can be duplicated, a ranking can be joined from the future or a serve percentage can have an impossible denominator.

ATP Insight uses validation at the boundaries between acquisition, transformation, modeling and publication.

## Schema checks

Every major dataset defines required columns. Missing fields fail early with a clear contract error instead of becoming silent nulls downstream. Numeric, date and boolean fields are normalized before analytical use.

## Critical fields

Critical identifiers and relationships include:

- player identifiers and names;
- tournament edition and surface;
- match date, competitors and winner;
- prediction match identifier and paired probabilities;
- ranking snapshot date and position.

Rows missing critical match identity are not suitable for sequential state or model training.

## Identity and uniqueness

Checks look for:

- duplicate match identifiers;
- conflicting identities for the same player identifier;
- repeated ranking positions within a snapshot;
- duplicate tournament editions or partition keys;
- prediction detail records without a matching card record.

Name variations are normalized, but player identifiers remain the preferred join key.

## Relationship checks

Published products are cross-validated so that:

- player links resolve to a known profile;
- tournament matches point to a known tournament edition;
- partition indexes point to existing data;
- summary counts agree with the available detail rows;
- match-stat records map to completed matches;
- both probabilities exist and form a valid pair.

## Statistical consistency

Serve and return fields are checked for valid counts and ranges. Percentages must remain within logical bounds, and numerators cannot exceed their denominators. Scores, winners and result labels are compared where the source supports that validation.

## Temporal checks

Sequential state depends on stable order. The system carries source season and order metadata privately to detect accidental mixing. Ranking joins should use a snapshot available on or before the match, and later-season rows remain outside historical training.

## Warnings versus failures

Not every missing value is a contract failure. Older matches may legitimately lack detailed serve statistics; some tournaments may not publish complete metadata; and new players may have short histories. The validation layer distinguishes:

- **errors**, which make a dataset unsafe to publish or model;
- **warnings**, which preserve usable data while documenting incomplete coverage.

This distinction avoids both silent corruption and unnecessary loss of valid records.
