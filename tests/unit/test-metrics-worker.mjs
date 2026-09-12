import assert from "node:assert/strict";
import { describe, it } from "node:test";

import worker from "../../infra/metrics-worker/src/index.js";

function mockEnvironment(changes = 1) {
  const calls = [];
  return {
    calls,
    env: {
      METRICS_DB: {
        prepare(sql) {
          return {
            bind(...values) {
              calls.push({ sql, values });
              return { run: async () => ({ meta: { changes } }) };
            },
          };
        },
      },
    },
  };
}

function signal(overrides = {}) {
  return {
    schema: "cco-mau-v1",
    month: new Date().toISOString().slice(0, 7),
    monthlyId: "a".repeat(32),
    version: "0.20.0",
    harness: "claude",
    ...overrides,
  };
}

describe("metrics worker", () => {
  it("exposes only a minimal health response", async () => {
    const response = await worker.fetch(new Request("https://metrics.example/health"), {});
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, service: "cco-metrics", schema: "cco-mau-v1" });
  });

  it("accepts every allowlisted harness in a current-month signal", async () => {
    const { env, calls } = mockEnvironment();
    const harnesses = ["claude", "codex", "opencode", "dsh", "unknown"];
    for (const harness of harnesses) {
      const response = await worker.fetch(new Request("https://metrics.example/v1/mau", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(signal({ harness })),
      }), env);

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { ok: true, counted: true });
    }
    assert.equal(calls.length, harnesses.length);
    assert.deepEqual(calls.map(call => call.values[3]), harnesses);
  });

  it("rejects stale, oversized, and expanded payloads before database access", async () => {
    const { env, calls } = mockEnvironment();
    const requests = [
      signal({ month: "2000-01" }),
      signal({ prompt: "must never be accepted" }),
      signal({ monthlyId: "not-an-id" }),
    ];

    for (const payload of requests) {
      const response = await worker.fetch(new Request("https://metrics.example/v1/mau", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }), env);
      assert.equal(response.status, 400);
    }

    const oversized = await worker.fetch(new Request("https://metrics.example/v1/mau", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(signal({ monthlyId: "b".repeat(2_000) })),
    }), env);
    assert.equal(oversized.status, 413);
    assert.equal(calls.length, 0);
  });
});
