import assert from "node:assert/strict";
import test from "node:test";
import type { TournamentDetail, TournamentMatch } from "../data/types.ts";
import {
  filterTournaments,
  getDrawStageWindow,
  getFeaturedTournaments,
  getTournamentDrawMatches,
  getTournamentImage,
  groupTournamentsByStartMonth
} from "./tournament-presentation.ts";

test("Draw excludes qualifying rounds without hiding team matches or changing Table data", () => {
  const matches = [
    { id_num: "MS001", round: "Final", round_display: "Final" },
    { id_num: "QS001", round: "1st Round Qualifying" },
    { id_num: "QS002", round_display: "2nd Round Qualifying" },
    { id_num: "QS003", round_raw: "3rd Round Qualifying - Court 1" },
    { id_num: "QS004", round: "Round Robin", round_display: "Round Robin" }
  ] as TournamentMatch[];

  assert.deepEqual(getTournamentDrawMatches(matches), [matches[0], matches[4]]);
  assert.equal(matches.length, 5);
  assert.deepEqual(getTournamentDrawMatches(matches.slice(1, 4)), []);
});

test("expanded Draw keeps four stages around late and unplayed rounds without changing compact Draw", () => {
  const stages = [6, 5, 4, 3, 2, 1, 0];
  assert.deepEqual(getDrawStageWindow(stages, 0, true), [6, 5, 4, 3]);
  assert.deepEqual(getDrawStageWindow(stages, 3, true), [3, 2, 1, 0]);
  assert.deepEqual(getDrawStageWindow(stages, 4, true), [3, 2, 1, 0]);
  assert.deepEqual(getDrawStageWindow(stages, 5, true), [3, 2, 1, 0]);
  assert.deepEqual(getDrawStageWindow(stages, 6, true), [3, 2, 1, 0]);
  assert.deepEqual(getDrawStageWindow(stages, 3, true, [6, 5, 4]), [6, 5, 4, 3]);
  assert.deepEqual(getDrawStageWindow(stages, 4, true, [6, 5, 4, 3]), [5, 4, 3, 2]);
  assert.deepEqual(getDrawStageWindow(stages, 5, true, [6, 5, 4, 3, 2]), [4, 3, 2, 1]);
  assert.deepEqual(getDrawStageWindow(stages, 6, true, [6, 5, 4, 3, 2, 1]), [3, 2, 1, 0]);
  assert.deepEqual(getDrawStageWindow(stages, 3, false), [4, 3, 2]);
  assert.deepEqual(getDrawStageWindow(stages, 6, false), [2, 1, 0]);
  assert.deepEqual(getDrawStageWindow([1, 0], 1, false), [1, 0]);
  assert.deepEqual(getDrawStageWindow([1, 0], 1, true), [1, 0]);
  assert.deepEqual(getDrawStageWindow([], 0, true), []);
});

test("active tournaments use inclusive date boundaries and chronological order", () => {
  const tournaments = [
    tournament({ tournament_id: "later", start_date: "2026-07-17", end_date: "2026-07-20" }),
    tournament({ tournament_id: "earlier", start_date: "2026-07-15", end_date: "2026-07-17" }),
    tournament({ tournament_id: "past", start_date: "2026-07-01", end_date: "2026-07-16" })
  ];

  const featured = getFeaturedTournaments(tournaments, "2026-07-17");

  assert.equal(featured.kind, "active");
  assert.deepEqual(featured.tournaments.map((item) => item.tournament_id), ["earlier", "later"]);
});

test("the next tournament is returned when no tournament is active", () => {
  const tournaments = [
    tournament({ tournament_id: "next-2", start_date: "2026-08-03", end_date: "2026-08-09" }),
    tournament({ tournament_id: "next-1", start_date: "2026-07-20", end_date: "2026-07-26" })
  ];

  const featured = getFeaturedTournaments(tournaments, "2026-07-17");

  assert.equal(featured.kind, "next");
  assert.deepEqual(featured.tournaments.map((item) => item.tournament_id), ["next-1"]);
});

test("filtered tournaments stay grouped by start month and active events remain in their month", () => {
  const active = tournament({
    tournament_id: "active",
    tournament_name: "Bastad",
    surface: "Clay",
    start_date: "2026-07-13",
    end_date: "2026-07-19"
  });
  const august = tournament({
    tournament_id: "august",
    tournament_name: "Toronto",
    surface: "Hard",
    start_date: "2026-08-03",
    end_date: "2026-08-09"
  });

  const filtered = filterTournaments([active, august], {
    query: "bastad",
    surface: "Clay",
    year: "2026"
  });
  const groups = groupTournamentsByStartMonth(filtered);

  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.key, "2026-07");
  assert.deepEqual(groups[0]?.tournaments.map((item) => item.tournament_id), ["active"]);
  assert.equal(getFeaturedTournaments([active, august], "2026-07-17").tournaments[0]?.tournament_id, "active");
});

test("image manifest entries win and missing entries use the surface fallback", () => {
  const manifest = {
    schemaVersion: 1 as const,
    fallbacks: {
      Hard: "/images/fallback-hard.webp",
      Clay: "/images/fallback-clay.webp",
      Grass: "/images/fallback-grass.webp",
      Carpet: "/images/fallback-carpet.webp"
    },
    tournaments: {
      exact: {
        image: "/images/exact.webp",
        isFallback: false,
        sourceReference: "exact-source"
      }
    }
  };

  assert.deepEqual(getTournamentImage(tournament({ tournament_id: "exact" }), manifest), manifest.tournaments.exact);
  assert.deepEqual(getTournamentImage(tournament({ tournament_id: "missing", surface: "Clay" }), manifest), {
    image: "/images/fallback-clay.webp",
    isFallback: true,
    sourceReference: "surface-fallback:clay"
  });
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
