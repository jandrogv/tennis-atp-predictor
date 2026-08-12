import assert from "node:assert/strict";
import test from "node:test";
import type { OfficialMatchStatistics } from "../data/match-statistics-types.ts";
import {
  OFFICIAL_STATISTIC_CONFIG,
  buildModelSignalRows,
  buildOfficialStatisticRows
} from "./statistics-presentation.ts";

test("official metric direction marks double faults as lower-is-better", () => {
  const doubleFaults = OFFICIAL_STATISTIC_CONFIG.find((metric) => metric.key === "doubleFaults");
  assert.equal(doubleFaults?.direction, "lower-is-better");
});

test("official rows preserve zero and omit only rows missing on both sides", () => {
  const statistics: OfficialMatchStatistics = {
    player1: { aces: 0, doubleFaults: 2 },
    player2: { aces: 4 }
  };

  const rows = buildOfficialStatisticRows(statistics);

  assert.deepEqual(rows.map((row) => row.key), ["aces", "doubleFaults"]);
  assert.equal(rows[0]?.player1.label, "0");
  assert.equal(rows[1]?.player2.label, "n/a");
});

test("model signal rows preserve signed values and favored side", () => {
  const rows = buildModelSignalRows(
    {
      atpPointsDifference: 125,
      eloPreDifference: -0.4,
      surfaceH2hDifference: 0
    },
    "Player One",
    "Player Two"
  );

  assert.deepEqual(rows.map((row) => row.value), [125, -0.4, 0]);
  assert.equal(rows[0]?.favoredPlayer, "Player One");
  assert.equal(rows[1]?.favoredPlayer, "Player Two");
  assert.equal(rows[2]?.favoredPlayer, "Even");
});
