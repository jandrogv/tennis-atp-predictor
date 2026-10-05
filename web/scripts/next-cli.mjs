import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const env = { ...process.env };
if (process.platform === "win32") {
  const preload = new URL("./next-wasm.mjs", import.meta.url).href;
  env.NODE_OPTIONS = [env.NODE_OPTIONS, `--import=${preload}`].filter(Boolean).join(" ");
  if (["build", "dev"].includes(args[0]) && !args.includes("--webpack")) args.push("--webpack");
  console.log("Next.js: compilador WebAssembly compatible con Windows.");
}
const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), ...args],
  { stdio: "inherit", env, windowsHide: true });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
