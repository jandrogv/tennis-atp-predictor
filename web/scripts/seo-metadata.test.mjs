import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseCsv } from "../lib/data/csv-parser.ts";
import { siteConfig } from "../lib/site.ts";

const STATIC_ROUTES = [
  "/",
  "/predictions",
  "/players",
  "/compare",
  "/rankings/atp",
  "/rankings/elo",
  "/tournaments",
  "/model",
  "/feature-importance",
  "/about-project"
];

const STATIC_PAGE_FILES = [
  "app/page.tsx",
  "app/predictions/page.tsx",
  "app/players/page.tsx",
  "app/compare/page.tsx",
  "app/rankings/atp/page.tsx",
  "app/rankings/elo/page.tsx",
  "app/tournaments/page.tsx",
  "app/model/page.tsx",
  "app/feature-importance/page.tsx",
  "app/about-project/page.tsx"
];

const DYNAMIC_PAGE_FILES = [
  "app/players/[playerId]/page.tsx",
  "app/tournaments/[tournamentId]/page.tsx",
  "app/tournaments/[tournamentId]/matches/[matchId]/page.tsx",
  "app/predictions/[matchId]/page.tsx"
];

test("central SEO configuration and metadata helper are complete", async () => {
  const seoSource = await readFile("lib/seo.ts", "utf8");
  const layoutSource = await readFile("app/layout.tsx", "utf8");

  assert.equal(siteConfig.siteUrl, "https://atpinsight-two.vercel.app");
  assert.equal(siteConfig.defaultTitle, "ATP Insight — Tennis Analytics & Match Prediction");
  assert.equal(siteConfig.titleTemplate, "%s | ATP Insight");
  assert.ok(siteConfig.description.length > 50 && siteConfig.description.length <= 170);
  assert.match(seoSource, /new URL\(definition\.path, siteConfig\.siteUrl\)/);
  assert.match(seoSource, /alternates: \{ canonical \}/);
  assert.match(seoSource, /url: canonical/);
  assert.match(layoutSource, /metadataBase: new URL\(siteConfig\.siteUrl\)/);
  assert.doesNotMatch(layoutSource, /alternates:/);
  for (const route of STATIC_ROUTES) {
    assert.ok(seoSource.includes(`"${route}"`), `missing SEO definition for ${route}`);
    const canonical = new URL(route, siteConfig.siteUrl).toString();
    assert.ok(canonical.startsWith("https://"));
  }
});

test("all public pages wire static or dynamic metadata", async () => {
  for (const file of STATIC_PAGE_FILES) {
    const source = await readFile(file, "utf8");
    assert.match(source, /export (?:const metadata|async function generateMetadata)/, `${file} has no metadata export`);
  }
  for (const file of DYNAMIC_PAGE_FILES) {
    const source = await readFile(file, "utf8");
    assert.match(source, /export async function generateMetadata/, `${file} has no dynamic metadata`);
    assert.match(source, /createUnavailableMetadata/, `${file} does not protect missing records from indexing`);
  }
});

test("Open Graph and Twitter images are exact 1200x630 PNG assets with alt text", async () => {
  const expectedAlt = "ATP Insight — Tennis analytics, rankings, Elo trends and match predictions";
  for (const baseName of ["opengraph-image", "twitter-image"]) {
    const image = await readFile(`app/${baseName}.png`);
    assert.equal(image.toString("ascii", 1, 4), "PNG");
    assert.equal(image.readUInt32BE(16), 1200);
    assert.equal(image.readUInt32BE(20), 630);
    assert.equal((await readFile(`app/${baseName}.alt.txt`, "utf8")).trim(), expectedAlt);
  }
});

test("sitemap stays focused on representative, canonical portfolio URLs", async () => {
  const sitemapRouteSource = await readFile("app/sitemap.ts", "utf8");
  const sitemapBuilderSource = await readFile("lib/sitemap.ts", "utf8");
  const { buildSitemapEntries } = await import("../lib/sitemap.ts");

  const players = parseCsv(await readFile("public/data/web_players_directory.csv", "utf8"));
  const tournaments = parseCsv(await readFile("public/data/web_tournament_details.csv", "utf8"));
  const tournamentIndex = JSON.parse(await readFile("public/data/tournaments/index.json", "utf8"));
  const partitionKeys = tournamentIndex.entries.map((entry) => entry.key);

  const entries = buildSitemapEntries({
    siteUrl: siteConfig.siteUrl,
    players,
    tournaments,
    tournamentPartitionKeys: partitionKeys
  });
  const repeatedEntries = buildSitemapEntries({
    siteUrl: siteConfig.siteUrl,
    players: [...players].reverse(),
    tournaments: [...tournaments].reverse(),
    tournamentPartitionKeys: [...partitionKeys].reverse()
  });
  const urls = entries.map((entry) => entry.url);
  const repeatedUrls = repeatedEntries.map((entry) => entry.url);
  const playerUrls = urls.filter((url) => /\/players\/[^/]+$/.test(new URL(url).pathname));
  const tournamentUrls = urls.filter((url) => /\/tournaments\/[^/]+$/.test(new URL(url).pathname));

  assert.deepEqual(repeatedUrls, urls, "sitemap generation must not depend on input row order");
  assert.equal(new Set(urls).size, urls.length, "sitemap URLs must be unique");
  assert.ok(urls.every((url) => url.startsWith(`${siteConfig.siteUrl}/`)));
  assert.ok(urls.every((url) => !url.includes("?") && !url.includes("#")));
  assert.ok(STATIC_ROUTES.every((route) => urls.includes(new URL(route, siteConfig.siteUrl).toString())));

  const expectedPlayerIds = expectedTopPlayerIds(players);
  assert.equal(playerUrls.length, 100, "only the current top 100 active players are promoted");
  assert.deepEqual(
    playerUrls.map((url) => decodeURIComponent(new URL(url).pathname.split("/").at(-1))),
    expectedPlayerIds
  );
  assert.ok(!urls.some((url) => /\/predictions\/.+/.test(new URL(url).pathname)));
  assert.ok(!urls.some((url) => /\/matches\/.+/.test(new URL(url).pathname)));
  assert.ok(!urls.some((url) => /\/(privacy|cookies|legal)$/.test(new URL(url).pathname)));

  const expectedTournamentSlugs = expectedPublishedTournamentSlugs(tournaments, partitionKeys);
  assert.deepEqual(
    tournamentUrls.map((url) => decodeURIComponent(new URL(url).pathname.split("/").at(-1))),
    expectedTournamentSlugs
  );
  assert.ok(entries.length >= 140 && entries.length <= 170, `unexpected focused sitemap size: ${entries.length}`);

  assert.doesNotMatch(sitemapRouteSource, /getTournamentMatches|getCurrentMatchStatistics/);
  assert.doesNotMatch(sitemapBuilderSource, /has_match_statistics|statistics\.matches|lastModified:\s*new Date\(\)/);
  assert.match(sitemapBuilderSource, /MAX_PLAYER_URLS = 100/);
  assert.match(sitemapBuilderSource, /partitionKeys\.has\(slug\)/);
});

test("robots references the production sitemap and host", async () => {
  const source = await readFile("app/robots.ts", "utf8");
  assert.match(source, /siteConfig\.siteUrl/);
  assert.match(source, /sitemap\.xml/);
  assert.match(source, /allow:\s*"\/"/);
});

function expectedTopPlayerIds(players) {
  const ranked = players
    .map((row) => ({
      playerId: normalize(row.player_id),
      playerName: normalize(row.player_name),
      rank: Number(normalize(row.atp_rank)),
      active: truthy(row.is_active)
    }))
    .filter(
      (player) =>
        player.active &&
        Number.isInteger(player.rank) &&
        player.rank > 0 &&
        validSegment(player.playerId) &&
        hasText(player.playerName)
    )
    .sort((left, right) => left.rank - right.rank || left.playerId.localeCompare(right.playerId));

  const unique = new Map();
  for (const player of ranked) {
    if (!unique.has(player.playerId)) {
      unique.set(player.playerId, player);
    }
    if (unique.size === 100) {
      break;
    }
  }

  return [...unique.values()].map((player) => player.playerId);
}

function expectedPublishedTournamentSlugs(tournaments, partitionKeys) {
  const years = tournaments
    .map((row) => Number(normalize(row.year)))
    .filter((year) => Number.isInteger(year) && year > 0);
  if (years.length === 0) {
    return [];
  }
  const currentYear = Math.max(...years);
  const publishedKeys = new Set(partitionKeys.map(normalize));
  const unique = new Map();

  for (const row of tournaments) {
    const year = Number(normalize(row.year));
    const tournamentId = normalize(row.tournament_id);
    const slug = normalize(row.tournament_slug);
    const name = normalize(row.tournament_name);
    if (
      year !== currentYear ||
      !validSegment(tournamentId) ||
      !validSegment(slug) ||
      !hasText(name) ||
      !publishedKeys.has(slug)
    ) {
      continue;
    }

    const dateKey = [row.start_date, row.tournament_date, row.end_date]
      .map(normalize)
      .find((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)) ?? "9999-12-31";
    const previous = unique.get(slug);
    if (!previous || dateKey < previous.dateKey) {
      unique.set(slug, { slug, dateKey });
    }
  }

  return [...unique.values()]
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey) || left.slug.localeCompare(right.slug))
    .map((tournament) => tournament.slug);
}

function normalize(value) {
  return String(value ?? "").trim().replace(/\.0$/, "");
}

function hasText(value) {
  const normalized = normalize(value).toLowerCase();
  return normalized !== "" && normalized !== "nan" && normalized !== "n/a";
}

function validSegment(value) {
  const normalized = normalize(value);
  return hasText(normalized) && !/[/?#]/.test(normalized);
}

function truthy(value) {
  return ["true", "1", "yes"].includes(normalize(value).toLowerCase());
}
