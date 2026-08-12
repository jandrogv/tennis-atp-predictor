import assert from "node:assert/strict";
import test from "node:test";
import { RetryablePromiseCache } from "./retryable-promise-cache.ts";

test("reuses one pending and resolved promise per key", async () => {
  const cache = new RetryablePromiseCache();
  let calls = 0;
  const load = async () => {
    calls += 1;
    return { rows: 42 };
  };

  const first = cache.get("players.csv", load);
  const second = cache.get("players.csv", load);
  const [firstResult, secondResult] = await Promise.all([first, second]);
  const thirdResult = await cache.get("players.csv", load);

  assert.equal(calls, 1);
  assert.strictEqual(first, second);
  assert.strictEqual(firstResult, secondResult);
  assert.strictEqual(firstResult, thirdResult);
});

test("evicts a rejected promise so a later call can retry", async () => {
  const cache = new RetryablePromiseCache();
  let calls = 0;
  const load = async () => {
    calls += 1;
    if (calls === 1) {
      throw new Error("temporary read failure");
    }
    return "loaded";
  };

  await assert.rejects(cache.get("rankings.json", load), /temporary read failure/);
  assert.equal(await cache.get("rankings.json", load), "loaded");
  assert.equal(calls, 2);
});