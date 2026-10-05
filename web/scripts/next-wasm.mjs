// Initialize every Windows worker before it can attempt the blocked native DLL.
import { createRequire } from "node:module";

if (process.platform === "win32") {
  const require = createRequire(import.meta.url);
  const swc = require("next/dist/build/swc");
  const warn = console.warn;
  console.warn = (...args) => {
    // Next emits this obsolete config warning even when its API loads WASM.
    if (!/experimental\.useWasmBinary.*will be ignored/.test(args.join(" "))) warn(...args);
  };
  try {
    const bindings = await swc.loadBindings(true);
    if (!bindings.isWasm) throw new Error("Next.js no ha podido inicializar el compilador WebAssembly.");
  } finally {
    console.warn = warn;
  }
}
