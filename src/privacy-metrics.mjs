/**
 * Privacy-preserving usage metrics.
 *
 * Metrics are disabled by default and stored locally. The schema cannot accept
 * paths, names, prompts, file contents, or arbitrary event properties. A
 * share preview uses a day-scoped pseudonym that changes every UTC day; CCO
 * does not upload it unless a future release adds an explicit endpoint and a
 * separate opt-in flow.
 */

import { createHmac, randomBytes } from "node:crypto";
import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ALLOWED_EVENTS = new Set([
  "doctor_open",
  "repair_apply",
  "repair_undo",
  "migration_preview",
  "migration_apply",
  "migration_undo",
]);

const ALLOWED_HARNESSES = new Set(["claude", "codex", "opencode", "unknown"]);
const stateQueues = new Map();

function dayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function defaultState() {
  return {
    version: 1,
    enabled: false,
    localOnly: true,
    createdAt: null,
    secret: null,
    days: {},
  };
}

export function metricsPath(home) {
  return join(home, ".cco", "privacy-metrics.json");
}

async function readState(home) {
  try {
    const parsed = JSON.parse(await readFile(metricsPath(home), "utf8"));
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

async function saveState(home, state) {
  const path = metricsPath(home);
  const directory = dirname(path);
  const temporary = `${path}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  try {
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true }).catch(() => {});
  }
}

async function withStateLock(home, operation) {
  const key = metricsPath(home);
  const previous = stateQueues.get(key) || Promise.resolve();
  const current = previous.catch(() => {}).then(operation);
  stateQueues.set(key, current);
  try {
    return await current;
  } finally {
    if (stateQueues.get(key) === current) stateQueues.delete(key);
  }
}

function publicStatus(state) {
  return {
    enabled: Boolean(state.enabled),
    localOnly: true,
    retentionDays: 30,
    storedDays: Object.keys(state.days || {}).length,
    collectedFields: ["UTC day", "event count", "harness id", "coarse inventory buckets"],
    neverCollected: ["paths", "file names", "skill names", "prompts", "session content", "credentials"],
  };
}

export async function getPrivacyMetricsStatus(home) {
  const state = await readState(home);
  return { ...publicStatus(state), sharePreview: state.enabled ? buildSharePreview(state) : null };
}

export async function setPrivacyMetricsEnabled(home, enabled) {
  return withStateLock(home, async () => {
    const state = await readState(home);
    state.enabled = Boolean(enabled);
    state.localOnly = true;
    state.createdAt ||= new Date().toISOString();
    state.secret ||= randomBytes(32).toString("hex");
    await saveState(home, state);
    return publicStatus(state);
  });
}

function coarseBucket(value) {
  const count = Math.max(0, Number(value) || 0);
  if (count === 0) return "0";
  if (count <= 5) return "1-5";
  if (count <= 20) return "6-20";
  if (count <= 50) return "21-50";
  if (count <= 100) return "51-100";
  return "100+";
}

function pruneDays(state, today) {
  const cutoff = new Date(`${today}T00:00:00.000Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  for (const day of Object.keys(state.days || {})) {
    if (new Date(`${day}T00:00:00.000Z`) < cutoff) delete state.days[day];
  }
}

export async function recordPrivacyMetric(home, event, harnessId, { inventoryCount = null } = {}) {
  if (!ALLOWED_EVENTS.has(event)) return false;
  return withStateLock(home, async () => {
    const state = await readState(home);
    if (!state.enabled) return false;
    const day = dayKey();
    const harness = ALLOWED_HARNESSES.has(harnessId) ? harnessId : "unknown";
    state.days[day] ||= { events: {}, harnesses: {}, inventoryBucket: null };
    state.days[day].events[event] = (state.days[day].events[event] || 0) + 1;
    state.days[day].harnesses[harness] = (state.days[day].harnesses[harness] || 0) + 1;
    if (inventoryCount !== null) state.days[day].inventoryBucket = coarseBucket(inventoryCount);
    pruneDays(state, day);
    await saveState(home, state);
    return true;
  });
}

export function buildSharePreview(state, day = dayKey()) {
  const bucket = state.days?.[day] || { events: {}, harnesses: {}, inventoryBucket: null };
  const secret = state.secret || "local-preview-without-secret";
  return {
    schema: "cco-privacy-metrics-v1",
    day,
    dailyId: createHmac("sha256", secret).update(day).digest("hex").slice(0, 20),
    events: { ...bucket.events },
    harnesses: { ...bucket.harnesses },
    inventoryBucket: bucket.inventoryBucket,
  };
}
