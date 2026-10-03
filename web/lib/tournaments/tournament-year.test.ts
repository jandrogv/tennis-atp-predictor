import assert from "node:assert/strict";
import test from "node:test";
import { filterTournaments, resolveTournamentYear } from "./tournament-presentation.ts";
import type { TournamentDetail } from "../data/types.ts";

test("a fresh visit uses the current UTC year, including the next year without data", () => {
  assert.equal(resolveTournamentYear(null, "2026-12-31"), "2026");
  assert.equal(resolveTournamentYear(null, "2027-01-01"), "2027");
  const rows = [{ year: "2026", tournament_name: "Wimbledon", surface: "Grass" }] as TournamentDetail[];
  const year = resolveTournamentYear(null, "2027-01-01");
  assert.deepEqual(filterTournaments(rows, { query: "", surface: "all", year }), []);
});

test("explicit years and All survive reload while malformed years use the current year", () => {
  assert.equal(resolveTournamentYear("2025", "2026-10-03"), "2025");
  assert.equal(resolveTournamentYear("2027", "2026-10-03"), "2027");
  assert.equal(resolveTournamentYear("all", "2026-10-03"), "all");
  for (const value of ["", "2026x", "26", "0000", "2025,2026"]) {
    assert.equal(resolveTournamentYear(value, "2026-10-03"), "2026");
  }
});
