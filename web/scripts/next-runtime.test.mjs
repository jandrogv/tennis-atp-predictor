import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import test from "node:test";

test("Next CLI starts using the installed version", () => {
  const child = spawnSync(process.execPath, ["scripts/next-cli.mjs", "--version"],
    { encoding: "utf8", windowsHide: true });
  assert.equal(child.status, 0, child.stderr);
  const next = createRequire(import.meta.url)("next/package.json");
  assert.ok(child.stdout.includes(`Next.js v${next.version}`));
  assert.equal(child.stderr, "");
});

test("Windows workers use initialized WASM without attempting the blocked DLL", { skip: process.platform !== "win32" }, () => {
  const preload = new URL("./next-wasm.mjs", import.meta.url).href;
  const env = { ...process.env, NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${preload}`].filter(Boolean).join(" ") };
  const child = spawnSync(process.execPath,
    ["-e", "require('next/dist/build/swc').loadBindings().then(b => console.log(b.isWasm))"],
    { env, encoding: "utf8", windowsHide: true });
  assert.equal(child.status, 0, child.stderr);
  assert.equal(child.stdout.trim(), "true");
  assert.equal(child.stderr, "");
});
