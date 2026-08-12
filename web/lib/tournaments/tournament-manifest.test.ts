import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { TournamentImageManifest } from "./tournament-presentation.ts";

test("tournament image manifest uses existing local assets and complete fallbacks", () => {
  const manifestPath = resolve("public/images/tournaments/courts/manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as TournamentImageManifest;

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
