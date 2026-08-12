import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const LEGAL_ROUTES = ["privacy", "cookies", "legal"];
const OPTIONAL_PROVIDER_PATTERN = /www\.googletagmanager\.com|google-analytics\.com|gtag\(|@vercel\/analytics|@vercel\/speed-insights|hotjar\.com|@sentry|sentry\.io|posthog-js|app\.posthog\.com|mixpanel-browser|cdn\.segment\.com|@amplitude|clarity\.ms|@microsoft\/clarity/i;
const CLIENT_STORAGE_API_PATTERN = /document\.cookie|(?:window\.)?sessionStorage\.(?:getItem|setItem|removeItem)|indexedDB\.open|navigator\.serviceWorker|caches\.open/;
const SECRET_PATTERN = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{30,}|eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;

test("privacy is essential-only and persists only the versioned notice preference", async () => {
  assert.ok(existsSync("lib/privacy.ts"), "privacy helper must exist");
  const privacy = await import("../lib/privacy.ts");
  const storage = createMemoryStorage();

  assert.equal(privacy.PRIVACY_MODE, "essential-only");
  assert.equal(privacy.readPrivacyNoticePreference(storage), false);
  privacy.dismissPrivacyNotice(storage);
  assert.equal(privacy.readPrivacyNoticePreference(storage), true);
  assert.deepEqual([...storage.keys()], [privacy.PRIVACY_NOTICE_STORAGE_KEY]);
  privacy.resetPrivacyNotice(storage);
  assert.equal(privacy.readPrivacyNoticePreference(storage), false);
  assert.equal(storage.size, 0);
});

test("privacy notice and footer expose accessible controls and legal routes", async () => {
  const notice = await readFile("components/privacy/PrivacyNotice.tsx", "utf8");
  const shell = await readFile("components/layout/AppShell.tsx", "utf8");

  assert.match(notice, /role="region"/);
  assert.match(notice, /aria-labelledby="privacy-notice-title"/);
  assert.match(notice, /Got it/);
  assert.match(notice, /Reset notice/);
  assert.doesNotMatch(notice, /Accept all|Reject all/);
  for (const route of LEGAL_ROUTES) {
    assert.match(shell, new RegExp(`href="\/${route}"`));
  }
  assert.match(shell, /<PrivacySettingsButton/);
  assert.match(notice, /Privacy settings/);
});

test("legal pages are noindex follow and remain outside the sitemap", async () => {
  for (const route of LEGAL_ROUTES) {
    const source = await readFile(`app/${route}/page.tsx`, "utf8");
    assert.match(source, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true/s);
    assert.doesNotMatch(source, /\[PUBLIC OWNER NAME\]|\[PRIVACY CONTACT EMAIL\]/);
  }
  const sitemap = await readFile("lib/sitemap.ts", "utf8");
  for (const route of LEGAL_ROUTES) {
    assert.ok(!sitemap.includes(`"/${route}"`), `/${route} must stay outside the sitemap`);
  }
});

test("security headers keep unsafe-eval development-only and forbid wildcard CORS", async () => {
  const source = await readFile("next.config.mjs", "utf8");
  const { buildContentSecurityPolicy } = await import("../next.config.mjs");
  const productionPolicy = buildContentSecurityPolicy("production");
  const developmentPolicy = buildContentSecurityPolicy("development");
  for (const header of [
    "Content-Security-Policy",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "X-Frame-Options",
    "Strict-Transport-Security"
  ]) {
    assert.ok(source.includes(header), `missing ${header}`);
  }
  assert.match(productionPolicy, /frame-ancestors 'none'/);
  assert.doesNotMatch(productionPolicy, /unsafe-eval/);
  assert.match(developmentPolicy, /script-src[^;]*'unsafe-eval'/);
  assert.doesNotMatch(source, /Access-Control-Allow-Origin[^\n]*\*/i);
});

test("client source contains no optional tracking or suspicious public variables", () => {
  const sourceFiles = collectFiles(["app", "components", "lib"], new Set([".ts", ".tsx", ".js", ".mjs"]));
  const combined = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(combined, OPTIONAL_PROVIDER_PATTERN);
  assert.doesNotMatch(combined, /NEXT_PUBLIC_(?:API|TOKEN|SECRET|PASSWORD|KEY|AUTH|CREDENTIAL)/i);
  assert.doesNotMatch(combined, CLIENT_STORAGE_API_PATTERN);
});

test("public source and generated client artifacts expose no known secrets or personal local paths", () => {
  const roots = ["app", "components", "lib", "public"];
  if (existsSync(".next/static")) roots.push(".next/static");
  const files = collectFiles(roots, new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".csv", ".txt", ".html", ".svg"]));

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, SECRET_PATTERN, `possible secret exposed in ${file}`);
    assert.doesNotMatch(source, /[A-Za-z]:\\Users\\/i, `personal local path exposed in ${file}`);
  }
});
test("external blank-target links are protected and production source maps are absent", () => {
  const sourceFiles = collectFiles(["app", "components", "lib"], new Set([".ts", ".tsx"]));
  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    const blankLinks = source.match(/<a\b[^>]*target=["']_blank["'][^>]*>/g) ?? [];
    for (const link of blankLinks) {
      assert.match(link, /rel=["'][^"']*noopener[^"']*["']/);
      assert.match(link, /rel=["'][^"']*noreferrer[^"']*["']/);
    }
  }

  if (existsSync(".next/static")) {
    const sourceMaps = collectFiles([".next/static"], new Set([".map"]));
    assert.deepEqual(sourceMaps, []);
  }
});

function createMemoryStorage() {
  const values = new Map();
  return {
    get size() {
      return values.size;
    },
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    keys() {
      return values.keys();
    }
  };
}

function collectFiles(roots, extensions) {
  const files = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    walk(root, files, extensions);
  }
  return files.sort();
}

function walk(current, files, extensions) {
  for (const entry of readdirSync(current)) {
    const fullPath = path.join(current, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, files, extensions);
    } else if (extensions.has(path.extname(entry))) {
      files.push(fullPath);
    }
  }
}
