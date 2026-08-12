import assert from "node:assert/strict";
import test from "node:test";
import type { TournamentDetail } from "../data/types.ts";
import { getTournamentStatus } from "./tournament-presentation.ts";

test("tournament status is derived only from inclusive start and end dates", () => {
  const current = tournament({ start_date: "2026-07-13", end_date: "2026-07-19" });

  assert.equal(getTournamentStatus(current, "2026-07-12"), "Upcoming");
  assert.equal(getTournamentStatus(current, "2026-07-13"), "In progress");
  assert.equal(getTournamentStatus(current, "2026-07-19"), "In progress");
  assert.equal(getTournamentStatus(current, "2026-07-20"), "Completed");
  assert.equal(
    getTournamentStatus({ ...current, tournament_date: "", start_date: "", end_date: "" }, "2026-07-17"),
    null
  );
});

function tournament(overrides: Partial<TournamentDetail>): TournamentDetail {
  return {
    tournament_id: "sample",
    tournament_slug: "sample",
    tournament_name: "Sample",
    year: "2026",
    surface: "Hard",
    tournament_date: "2026-07-13",
    start_date: "2026-07-13",
    end_date: "2026-07-19",
    location: "Sample City",
    country: "",
    draw_size: "32",
    prize_money: "$100,000",
    last_winner: "Sample Winner",
    has_completed_matches: "true",
    has_predictions: "false",
    completed_matches_count: "31",
    predictions_count: "0",
    ...overrides
  };
}
