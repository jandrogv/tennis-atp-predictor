import assert from "node:assert/strict";
import test from "node:test";
import type { MatchStatisticsCurrentFile, MatchStatisticsRecord } from "./match-statistics-types.ts";
import { createMatchStatisticsLoader } from "./match-statistics-loader.ts";

test("lookup by id and multiple ids shares one fetch", async () => {
  let fetchCount = 0;
  const file = statisticsFile();
  const loader = createMatchStatisticsLoader(async () => {
    fetchCount += 1;
    return response(file);
  }, 2026);

  assert.equal((await loader.getById("match-1"))?.matchId, "match-1");
  assert.equal(await loader.getById("missing"), null);
  assert.deepEqual(Object.keys(await loader.getByIds(["match-1", "missing"])), ["match-1"]);
  assert.equal(fetchCount, 1);
});

test("a rejected initial load is cleared so retry can succeed", async () => {
  let fetchCount = 0;
  const loader = createMatchStatisticsLoader(async () => {
    fetchCount += 1;
    if (fetchCount === 1) throw new Error("offline");
    return response(statisticsFile());
  }, 2026);

  await assert.rejects(loader.getById("match-1"), /offline/);
  assert.equal((await loader.getById("match-1"))?.matchId, "match-1");
  assert.equal(fetchCount, 2);
});

test("schema and current year are validated before caching", async () => {
  const loader = createMatchStatisticsLoader(async () => response({ ...statisticsFile(), year: 2025 }), 2026);
  await assert.rejects(loader.load(), /year 2025/);
});

function statisticsFile(): MatchStatisticsCurrentFile {
  const match = {
    matchId: "match-1",
    year: 2026,
    status: "completed",
    tournament: { id: "1", slug: "sample", name: "Sample", date: "2026-01-01", surface: "Hard", round: "Finals", score: "6-4 6-4", durationMinutes: null },
    players: {
      player1: { id: "1", name: "One" },
      player2: { id: "2", name: "Two" },
      winnerId: "1"
    },
    officialStatistics: null,
    preMatchContext: { player1: {}, player2: {} },
    headToHead: {},
    modelSignals: {}
  } satisfies MatchStatisticsRecord;
  return { schemaVersion: 1, year: 2026, matchCount: 1, matches: { "match-1": match } };
}

function response(value: unknown): Response {
  return new Response(JSON.stringify(value), { status: 200, headers: { "Content-Type": "application/json" } });
}
