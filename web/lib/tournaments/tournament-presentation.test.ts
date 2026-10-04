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

test("compact Draw centers three consecutive rounds and fills either boundary", () => {
  const stages = [4, 3, 2, 1, 0];
  const expected = [[4, 3, 2], [4, 3, 2], [3, 2, 1], [2, 1, 0], [2, 1, 0]];
  stages.forEach((_, index) => assert.deepEqual(getDrawStageWindow(stages, index, 3), expected[index]));
});

test("expanded Draw prefers one previous and two following rounds, then fills boundaries", () => {
  const stages = [4, 3, 2, 1, 0];
  const expected = [[4, 3, 2, 1], [4, 3, 2, 1], [3, 2, 1, 0], [3, 2, 1, 0], [3, 2, 1, 0]];
  stages.forEach((_, index) => assert.deepEqual(getDrawStageWindow(stages, index, 4), expected[index]));
  assert.deepEqual(getDrawStageWindow([6, 5, 4, 3, 2, 1, 0], 3, 4), [4, 3, 2, 1]);
});

test("Draw retains structural future rounds without requiring played matches or fixed round names", () => {
  // The last rounds exist in the draw, even when no match or player has been loaded yet.
  const stages = [50, 40, 30, 20, 10];
  assert.deepEqual(getDrawStageWindow(stages, 2, 3), [40, 30, 20]);
  assert.deepEqual(getDrawStageWindow(stages, 2, 4), [40, 30, 20, 10]);
  assert.deepEqual(getDrawStageWindow(stages, 3, 4), [40, 30, 20, 10]);
});

test("Draw windows preserve count, selection, order and both sides throughout navigation", () => {
  for (const limit of [3, 4] as const) {
    assert.deepEqual(getDrawStageWindow([], 0, limit), []);
    for (let size = 1; size <= 9; size++) {
      const stages = Array.from({ length: size }, (_, index) => (size - index) * 10);
      const original = [...stages];
      for (let index = 0; index < size; index++) {
        const visible = getDrawStageWindow(stages, index, limit);
        const start = stages.indexOf(visible[0]);
        assert.equal(visible.length, Math.min(size, limit));
        assert.ok(visible.includes(stages[index]));
        assert.equal(new Set(visible).size, visible.length);
        assert.deepEqual(visible, stages.slice(start, start + visible.length));
        if (index > 0) assert.ok(visible.includes(stages[index - 1]));
        if (index < size - 1) assert.ok(visible.includes(stages[index + 1]));
        if (index > 0 && index + 2 < size && limit === 4) {
          assert.ok(visible.includes(stages[index + 2]));
        }
        if (index === 0) assert.deepEqual(visible, stages.slice(0, limit));
        if (index === size - 1) assert.deepEqual(visible, stages.slice(-limit));
      }
      assert.deepEqual(stages, original);
    }
  }
});

test("switching Draw size recalculates the window without changing the selected stage", () => {
  const stages = [6, 5, 4, 3, 2, 1, 0];
  for (let index = 0; index < stages.length; index++) {
    const selected = stages[index];
    const compact = getDrawStageWindow(stages, index, 3);
    const expanded = getDrawStageWindow(stages, index, 4);
    assert.ok(compact.includes(selected));
    assert.ok(expanded.includes(selected));
    assert.deepEqual(getDrawStageWindow(stages, index, 3), compact);
    assert.equal(stages[index], selected);
  }
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

  assert.deepEqual(getTournamentImage(tournament({ tournament_id: "exact" }), manifest), { ...manifest.tournaments.exact, fallbackImage: manifest.fallbacks.Hard });
  assert.deepEqual(getTournamentImage(tournament({ tournament_id: "missing", surface: "Clay" }), manifest), {
    image: "/images/fallback-clay.webp",
    fallbackImage: "/images/fallback-clay.webp",
    isFallback: true,
    sourceReference: "surface-fallback:clay"
  });
});

test("venue images follow the ATP event ID across years and sponsor aliases, not the city", () => {
  const image = { image: "/images/wimbledon.webp", isFallback: false, sourceReference: "licensed-photo" };
  const manifest = {
    schemaVersion: 1 as const,
    fallbacks: { Hard: "/hard.webp", Clay: "/clay.webp", Grass: "/grass.webp", Carpet: "/carpet.webp" },
    tournaments: { "0540": image }
  };
  for (const year of ["2025", "2026", "2027"]) {
    assert.deepEqual(getTournamentImage(tournament({ tournament_id: `${year}-0540`, year, tournament_name: "Wimbledon", location: "London", surface: "Grass" }), manifest), { ...image, fallbackImage: manifest.fallbacks.Grass });
  }
  assert.equal(getTournamentImage(tournament({ tournament_id: "2027-0311", tournament_name: "HSBC Championships", location: "London", surface: "Grass" }), manifest).isFallback, true);
  assert.deepEqual(getTournamentImage(tournament({ tournament_id: "2027-0540", tournament_name: "Sponsor variant" }), manifest), { ...image, fallbackImage: manifest.fallbacks.Hard });
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
