import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { parseCsv } from "../data/csv-parser.ts";
import type { TournamentDetail } from "../data/types.ts";
import { getTournamentImage, type TournamentImageManifest } from "./tournament-presentation.ts";

const manifest = JSON.parse(readFileSync(resolve("public/images/tournaments/courts/manifest.json"), "utf8").replace(/^\uFEFF/, "")) as TournamentImageManifest;

test("tournament image manifest uses existing local assets and complete fallbacks", () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.deepEqual(Object.keys(manifest.fallbacks).sort(), ["Carpet", "Clay", "Grass", "Hard"]);
  assert.ok(Object.keys(manifest.tournaments).length > 0);

  const imagePaths = [
    ...Object.values(manifest.fallbacks),
    ...Object.values(manifest.tournaments).map((entry) => entry.image)
  ];
  for (const imagePath of imagePaths) {
    assert.equal(existsSync(resolve(`public${imagePath}`)), true, `missing image asset: ${imagePath}`);
  }
});

test("every known event and its future editions resolve the same documented image", () => {
  const tournaments = parseCsv(readFileSync(resolve("public/data/web_tournament_details.csv"), "utf8").replace(/^\uFEFF/, ""));
  for (const row of tournaments) {
    const eventId = row.tournament_id.split("-").at(-1)!;
    const entry = manifest.tournaments[eventId];
    assert.ok(entry, `missing event: ${row.tournament_id}`);
    const tournament = row as unknown as TournamentDetail;
    assert.equal(getTournamentImage(tournament, manifest).image, entry.image);
    for (const year of ["2025", "2026", "2027"]) {
      assert.equal(getTournamentImage({ ...tournament, tournament_id: `${year}-${eventId}`, year, tournament_name: "Sponsor alias" }, manifest).image, entry.image);
    }
  }

  for (const [eventId, entry] of Object.entries(manifest.tournaments)) {
    assert.match(eventId, /^\d+$/, `edition key must not include a year: ${eventId}`);
    if (entry.isFallback) {
      assert.ok(Object.values(manifest.fallbacks).includes(entry.image));
      assert.ok(entry.pendingReason && entry.pendingReason.length > 40, `undocumented fallback: ${eventId}`);
    } else {
      assert.ok(!Object.values(manifest.fallbacks).includes(entry.image), `generic image disguised as specific: ${eventId}`);
      assert.ok(entry.alt && entry.credit?.author && entry.credit.license);
      assert.equal(new URL(entry.credit.sourceUrl).hostname, "commons.wikimedia.org");
    }
  }
});

test("different events do not collide, except the documented Davis Cup stage photograph", () => {
  const owners = new Map<string, string[]>();
  for (const [eventId, entry] of Object.entries(manifest.tournaments)) {
    if (entry.isFallback) continue;
    owners.set(entry.image, [...(owners.get(entry.image) ?? []), eventId]);
  }
  for (const ids of owners.values()) {
    if (ids.length > 1) assert.deepEqual(ids.sort(), ["8096", "8097"]);
  }
  assert.notEqual(manifest.tournaments["0311"].image, manifest.tournaments["0540"].image);
});
