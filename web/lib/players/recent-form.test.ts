import assert from "node:assert/strict";
import test from "node:test";
import type { PlayerRecentMatch } from "../data/types.ts";
import { selectRecentForm } from "./recent-form.ts";

test("recent form returns the five latest completed results", () => {
  const matches = [
    match("2026-07-01", "W"),
    match("2026-07-06", "L"),
    match("2026-07-05", "W"),
    match("2026-07-04", "W"),
    match("2026-07-03", "L"),
    match("2026-07-02", "W")
  ];

  assert.deepEqual(selectRecentForm(matches).map((item) => item.result), ["L", "W", "W", "L", "W"]);
});

test("recent form keeps fewer than five valid results", () => {
  assert.deepEqual(selectRecentForm([match("2026-07-02", "W"), match("2026-07-01", "L")]).map((item) => item.result), ["W", "L"]);
});

test("recent form omits rows without a completed W or L result", () => {
  assert.deepEqual(selectRecentForm([match("2026-07-02", ""), match("2026-07-01", "n/a")]), []);
});

function match(matchDate: string, result: string): PlayerRecentMatch {
  return {
    player_id: "1",
    match_date: matchDate,
    tournament_name: "Sample Open",
    surface: "Hard",
    round: "Final",
    opponent_id: "2",
    opponent_name: "Opponent",
    result,
    winner_id: result === "W" ? "1" : "2",
    winner_name: result === "W" ? "Player" : "Opponent",
    score: "6-4 6-4",
    source: "sample.csv"
  };
}
