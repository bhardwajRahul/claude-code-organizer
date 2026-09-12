import assert from "node:assert/strict";
import { access, mkdir, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { describe, it } from "node:test";

import { buildContextMap, computeHygieneReport } from "../../src/control-plane.mjs";
import {
  applyExactDuplicateRepair,
  applySkillMigration,
  findExactDuplicateRepairs,
  fingerprintPath,
  previewSkillMigration,
  skillRootFor,
  undoControlPlaneTransaction,
} from "../../src/control-plane-operations.mjs";
import {
  buildMonthlyActiveSignal,
  getPrivacyMetricsStatus,
  metricsPath,
  recordPrivacyMetric,
  setPrivacyMetricsEnabled,
  submitMonthlyActiveSignal,
} from "../../src/privacy-metrics.mjs";
import { isNewerVersion } from "../../src/version.mjs";

describe("release update precedence", () => {
  it("offers only newer releases and never recommends a downgrade", () => {
    assert.equal(isNewerVersion("0.20.1", "0.20.0"), true);
    assert.equal(isNewerVersion("1.0.0", "0.20.0"), true);
    assert.equal(isNewerVersion("0.19.3", "0.20.0"), false);
    assert.equal(isNewerVersion("0.20.0", "0.20.0"), false);
    assert.equal(isNewerVersion("0.20.0", "0.20.0-beta.2"), true);
    assert.equal(isNewerVersion("0.20.0-beta.2", "0.20.0"), false);
    assert.equal(isNewerVersion("not-semver", "0.20.0"), false);
  });
});

function fixtureScan() {
  return {
    harness: { id: "claude", displayName: "Claude Code" },
    scopes: [
      { id: "global", name: "Global", repoDir: null },
      { id: "parent", name: "repo", repoDir: "/repo" },
      { id: "project", name: "app", repoDir: "/repo/app" },
    ],
    effective: {
      includeGlobalCategories: ["skill", "mcp", "command", "agent", "config", "memory", "hook"],
      ancestorCategories: ["config", "memory"],
    },
    items: [
      { category: "skill", scopeId: "global", name: "review", path: "/home/.claude/skills/review", sizeBytes: 400, description: "Review code" },
      { category: "mcp", scopeId: "global", name: "github", path: "/home/.claude.json", sizeBytes: 100 },
      { category: "command", scopeId: "global", name: "deploy", path: "/home/.claude/commands/deploy.md", sizeBytes: 40, description: "Deploy" },
      { category: "setting", scopeId: "global", name: "model", value: "sonnet", sourceFile: "settings.json", sourceTier: "user" },
      { category: "config", scopeId: "parent", name: "CLAUDE.md", path: "/repo/CLAUDE.md", sizeBytes: 800 },
      { category: "skill", scopeId: "project", name: "local", path: "/repo/app/.claude/skills/local", sizeBytes: 600, description: "" },
      { category: "mcp", scopeId: "project", name: "github", path: "/repo/app/.mcp.json", sizeBytes: 120 },
      { category: "command", scopeId: "project", name: "deploy", path: "/repo/app/.claude/commands/deploy.md", sizeBytes: 60, description: "Deploy here" },
      { category: "setting", scopeId: "project", name: "model", value: "opus", sourceFile: "settings.local.json", sourceTier: "local" },
    ],
  };
}

describe("control-plane context and hygiene", () => {
  it("maps only declared effective sources and resolves setting winners", () => {
    const map = buildContextMap(fixtureScan(), "project");
    assert.equal(map.mode, "effective");
    assert.deepEqual(map.nodes.map(node => node.relation), ["direct", "ancestor", "global"]);
    assert.equal(map.summary.shadowed, 1);
    assert.equal(map.summary.conflicts, 2);
    assert.equal(map.summary.contextBytes, 1900);
    assert.equal(map.settings.resolutions.find(entry => entry.name === "model").winner.value, "opus");
    assert.equal(map.settings.overriddenCount, 1);
  });

  it("does not claim effective behavior for inventory-only adapters", () => {
    const scan = fixtureScan();
    scan.effective = { includeGlobalCategories: [], ancestorCategories: [] };
    const map = buildContextMap(scan, "project");
    assert.equal(map.mode, "inventory-only");
    assert.deepEqual(map.nodes.map(node => node.relation), ["direct"]);
  });

  it("returns an explainable score and repair count", () => {
    const scan = fixtureScan();
    scan.items.push(
      { category: "skill", scopeId: "project", name: "local", path: "/repo/app/.agents/skills/local", sizeBytes: 600, description: "" },
      { category: "memory", scopeId: "project", name: "large", path: "/repo/app/large.md", sizeBytes: 30000, description: "Large" },
      { category: "session", scopeId: "project", name: "old", path: "/repo/app/old.jsonl", mtime: "2020-01-01T00:00:00Z" },
    );
    const report = computeHygieneReport(scan, "project", {
      now: Date.parse("2026-09-11T00:00:00Z"),
      exactDuplicateRepairs: [{ id: "repair-1" }],
    });
    assert.ok(report.score < 100);
    assert.equal(report.repairableCount, 1);
    assert.ok(report.findings.some(finding => finding.id === "duplicate-identities"));
    assert.ok(report.findings.some(finding => finding.id === "oversized-context"));
    assert.ok(report.findings.some(finding => finding.id === "stale-sessions"));
    assert.equal(report.methodology.version, 1);
  });

  it("does not audit unrelated categories from an inherited global scope", () => {
    const scan = fixtureScan();
    scan.items.push({
      category: "session",
      scopeId: "global",
      name: "old-global-session",
      path: "/home/.claude/projects/old.jsonl",
      mtime: "2020-01-01T00:00:00Z",
    });
    const report = computeHygieneReport(scan, "project", {
      now: Date.parse("2026-09-11T00:00:00Z"),
    });
    assert.equal(report.findings.some(finding => finding.id === "stale-sessions"), false);
  });
});

describe("reversible repair and skill migration", () => {
  it("refuses to fingerprint symbolic links", async () => {
    const root = await mkdtemp(join(tmpdir(), "cco-fingerprint-"));
    try {
      const target = join(root, "target.md");
      const link = join(root, "link.md");
      await writeFile(target, "safe\n");
      await symlink(target, link);
      await assert.rejects(fingerprintPath(link), /Symbolic links are not eligible/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("maps DeepSeek Harness skill migrations to its official roots", () => {
    assert.equal(skillRootFor("dsh", "/home/user/.dsh"), "/home/user/.dsh/skills");
    assert.equal(
      skillRootFor("dsh", "/home/user/.dsh", { repoDir: "/repo/app" }),
      "/repo/app/.dsh/skills",
    );
  });

  it("archives only verified identical duplicates and restores them", async () => {
    const root = await mkdtemp(join(tmpdir(), "cco-repair-"));
    try {
      const first = join(root, "first", "same");
      const second = join(root, "second", "same");
      await Promise.all([mkdir(first, { recursive: true }), mkdir(second, { recursive: true })]);
      await Promise.all([
        writeFile(join(first, "SKILL.md"), "---\nname: same\n---\nHello\n"),
        writeFile(join(second, "SKILL.md"), "---\nname: same\n---\nHello\n"),
      ]);
      const items = [first, second].map(path => ({ category: "skill", scopeId: "global", name: "same", path }));
      const repairs = await findExactDuplicateRepairs(items, "global");
      assert.equal(repairs.length, 1);
      const result = await applyExactDuplicateRepair(repairs[0], join(root, ".cco"), async path => path.startsWith(root));
      await assert.rejects(access(repairs[0].path));
      await access(repairs[0].keepPath);
      await undoControlPlaneTransaction(result.transactionId, join(root, ".cco"), async path => path.startsWith(root));
      await access(repairs[0].path);
      assert.match(await readFile(join(repairs[0].path, "SKILL.md"), "utf8"), /Hello/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("copies portable skills without overwriting and can undo", async () => {
    const root = await mkdtemp(join(tmpdir(), "cco-migrate-"));
    try {
      const source = join(root, "claude", "skills", "portable");
      const targetRoot = join(root, "codex");
      await mkdir(source, { recursive: true });
      await writeFile(join(source, "SKILL.md"), "---\nname: portable\n---\nPortable\n");
      const preview = await previewSkillMigration({
        sourceItems: [{ category: "skill", scopeId: "global", name: "portable", path: source }],
        targetItems: [],
        targetAdapterId: "codex",
        targetRootDir: targetRoot,
        targetScope: { id: "global", repoDir: null },
      });
      assert.equal(preview.summary.ready, 1);
      const result = await applySkillMigration({
        candidates: preview.candidates,
        selectedSourcePaths: [source],
        baseDir: join(root, ".cco"),
        validateSource: async path => path.startsWith(root),
        validateTarget: async path => path.startsWith(targetRoot),
      });
      assert.equal(result.migrated, 1);
      await access(join(targetRoot, "skills", "portable", "SKILL.md"));

      const identical = await previewSkillMigration({
        sourceItems: [{ category: "skill", scopeId: "global", name: "portable", path: source }],
        targetItems: [{ category: "skill", scopeId: "global", name: "portable", path: join(targetRoot, "skills", "portable") }],
        targetAdapterId: "codex",
        targetRootDir: targetRoot,
        targetScope: { id: "global", repoDir: null },
      });
      assert.equal(identical.candidates[0].status, "identical");

      await undoControlPlaneTransaction(result.transactionId, join(root, ".cco"), async path => path.startsWith(root));
      await assert.rejects(access(join(targetRoot, "skills", "portable")));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("refuses to undo a migrated skill after the target was edited", async () => {
    const root = await mkdtemp(join(tmpdir(), "cco-migrate-edited-"));
    try {
      const source = join(root, "claude", "skills", "portable");
      const targetRoot = join(root, "codex");
      await mkdir(source, { recursive: true });
      await writeFile(join(source, "SKILL.md"), "# Portable\nOriginal\n");
      const preview = await previewSkillMigration({
        sourceItems: [{ category: "skill", scopeId: "global", name: "portable", path: source }],
        targetItems: [], targetAdapterId: "codex", targetRootDir: targetRoot,
        targetScope: { id: "global", repoDir: null },
      });
      const result = await applySkillMigration({
        candidates: preview.candidates,
        selectedSourcePaths: [source],
        baseDir: join(root, ".cco"),
        validateSource: async path => path.startsWith(root),
        validateTarget: async path => path.startsWith(targetRoot),
      });
      const migrated = join(targetRoot, "skills", "portable");
      await writeFile(join(migrated, "SKILL.md"), "# Portable\nUser edit\n");
      await assert.rejects(
        undoControlPlaneTransaction(result.transactionId, join(root, ".cco"), async path => path.startsWith(root)),
        /target changed/,
      );
      assert.match(await readFile(join(migrated, "SKILL.md"), "utf8"), /User edit/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("refuses to restore an archived duplicate over a new path", async () => {
    const root = await mkdtemp(join(tmpdir(), "cco-repair-conflict-"));
    try {
      const first = join(root, "first", "same");
      const second = join(root, "second", "same");
      await Promise.all([mkdir(first, { recursive: true }), mkdir(second, { recursive: true })]);
      await Promise.all([
        writeFile(join(first, "SKILL.md"), "Same\n"),
        writeFile(join(second, "SKILL.md"), "Same\n"),
      ]);
      const repairs = await findExactDuplicateRepairs(
        [first, second].map(path => ({ category: "skill", scopeId: "global", name: "same", path })),
        "global",
      );
      const result = await applyExactDuplicateRepair(repairs[0], join(root, ".cco"), async path => path.startsWith(root));
      await mkdir(repairs[0].path, { recursive: true });
      await writeFile(join(repairs[0].path, "SKILL.md"), "New content\n");
      await assert.rejects(
        undoControlPlaneTransaction(result.transactionId, join(root, ".cco"), async path => path.startsWith(root)),
        /Original path now exists/,
      );
      assert.match(await readFile(join(repairs[0].path, "SKILL.md"), "utf8"), /New content/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("privacy metrics", () => {
  it("is opt-in, allowlisted, and keeps detailed events and its secret private", async () => {
    const home = await mkdtemp(join(tmpdir(), "cco-metrics-"));
    try {
      assert.equal((await getPrivacyMetricsStatus(home)).enabled, false);
      assert.equal(await recordPrivacyMetric(home, "doctor_open", "claude"), false);
      await assert.rejects(access(metricsPath(home)));

      await setPrivacyMetricsEnabled(home, true);
      assert.equal(await recordPrivacyMetric(home, "doctor_open", "claude", { inventoryCount: 37 }), true);
      assert.equal(await recordPrivacyMetric(home, "arbitrary-event", "claude"), false);
      const status = await getPrivacyMetricsStatus(home);
      assert.equal(status.enabled, true);
      assert.equal(status.localDetailsOnly, true);
      assert.equal(status.monthlySignalShared, true);
      assert.equal(status.sharePreview.inventoryBucket, "21-50");
      assert.equal(status.sharePreview.events.doctor_open, 1);
      assert.equal("secret" in status, false);
      assert.equal("path" in status.sharePreview, false);
      assert.equal((await stat(metricsPath(home))).mode & 0o777, 0o600);

      await Promise.all(Array.from({ length: 10 }, () =>
        recordPrivacyMetric(home, "doctor_open", "claude")
      ));
      assert.equal((await getPrivacyMetricsStatus(home)).sharePreview.events.doctor_open, 11);

      await writeFile(metricsPath(home), JSON.stringify({
        version: 2,
        enabled: true,
        consentVersion: "cco-mau-v1",
        secret: "local-test",
        days: null,
      }));
      assert.equal(await recordPrivacyMetric(home, "doctor_open", "claude"), true);
      assert.equal((await getPrivacyMetricsStatus(home)).sharePreview.events.doctor_open, 1);
    } finally {
      await rm(home, { recursive: true, force: true });
    }
  });

  it("does not reinterpret legacy local-only consent as upload consent", async () => {
    const home = await mkdtemp(join(tmpdir(), "cco-legacy-metrics-"));
    try {
      await mkdir(join(home, ".cco"), { recursive: true });
      const retainedDate = new Date();
      retainedDate.setUTCDate(retainedDate.getUTCDate() - 1);
      const expiredDate = new Date();
      expiredDate.setUTCDate(expiredDate.getUTCDate() - 31);
      const retainedDay = retainedDate.toISOString().slice(0, 10);
      const expiredDay = expiredDate.toISOString().slice(0, 10);
      await writeFile(metricsPath(home), JSON.stringify({
        version: 1,
        enabled: true,
        secret: "legacy-local-secret",
        days: {
          [expiredDay]: { events: { doctor_open: 1 }, harnesses: { claude: 1 }, inventoryBucket: null },
          [retainedDay]: { events: { doctor_open: 1 }, harnesses: { claude: 1 }, inventoryBucket: null },
        },
      }));
      const status = await getPrivacyMetricsStatus(home);
      assert.equal(status.enabled, false);
      assert.equal(status.monthlySignalShared, false);
      assert.equal(await recordPrivacyMetric(home, "doctor_open", "claude"), false);
      const retainedState = JSON.parse(await readFile(metricsPath(home), "utf8"));
      assert.equal(expiredDay in retainedState.days, false);
      assert.equal(retainedDay in retainedState.days, true);
      assert.equal(
        (await submitMonthlyActiveSignal(home, "0.20.0", "claude", { fetchImpl: async () => assert.fail("must not send") })).reason,
        "disabled",
      );
    } finally {
      await rm(home, { recursive: true, force: true });
    }
  });

  it("retains at most 30 UTC daily buckets including today", async () => {
    const home = await mkdtemp(join(tmpdir(), "cco-retention-"));
    const now = new Date("2026-09-11T12:00:00Z");
    const dayOffset = offset => {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() - offset);
      return date.toISOString().slice(0, 10);
    };
    const expiredDay = dayOffset(30);
    const oldestRetainedDay = dayOffset(29);
    const futureDay = dayOffset(-1);
    try {
      await mkdir(join(home, ".cco"), { recursive: true });
      await writeFile(metricsPath(home), JSON.stringify({
        version: 2,
        enabled: true,
        consentVersion: "cco-mau-v1",
        secret: "retention-test-secret",
        days: {
          [expiredDay]: { events: {}, harnesses: {}, inventoryBucket: null },
          [oldestRetainedDay]: { events: {}, harnesses: {}, inventoryBucket: null },
          [futureDay]: { events: {}, harnesses: {}, inventoryBucket: null },
          invalid: { events: {}, harnesses: {}, inventoryBucket: null },
        },
      }));

      await recordPrivacyMetric(home, "doctor_open", "claude", { now });
      const state = JSON.parse(await readFile(metricsPath(home), "utf8"));
      assert.equal(expiredDay in state.days, false);
      assert.equal(oldestRetainedDay in state.days, true);
      assert.equal(dayOffset(0) in state.days, true);
      assert.equal(futureDay in state.days, false);
      assert.equal("invalid" in state.days, false);
    } finally {
      await rm(home, { recursive: true, force: true });
    }
  });

  it("builds a minimal identifier that is stable within a month and rotates next month", () => {
    const state = { secret: "test-secret" };
    const september = buildMonthlyActiveSignal(state, "0.20.0", "claude", new Date("2026-09-01T00:00:00Z"));
    const septemberAgain = buildMonthlyActiveSignal(state, "0.20.0", "claude", new Date("2026-09-30T23:59:59Z"));
    const october = buildMonthlyActiveSignal(state, "0.20.0", "claude", new Date("2026-10-01T00:00:00Z"));
    const dshHarness = buildMonthlyActiveSignal(state, "0.20.0", "dsh", new Date("2026-10-01T00:00:00Z"));
    const unknownHarness = buildMonthlyActiveSignal(state, "0.20.0", "not-a-harness", new Date("2026-10-01T00:00:00Z"));

    assert.deepEqual(Object.keys(september), ["schema", "month", "monthlyId", "version", "harness"]);
    assert.match(september.monthlyId, /^[a-f0-9]{32}$/);
    assert.equal(september.monthlyId, septemberAgain.monthlyId);
    assert.notEqual(september.monthlyId, october.monthlyId);
    assert.equal(dshHarness.harness, "dsh");
    assert.equal(unknownHarness.harness, "unknown");
  });

  it("does not resubmit after monthly delivery succeeds and never sends local event details", async () => {
    const home = await mkdtemp(join(tmpdir(), "cco-mau-"));
    const payloads = [];
    const fetchImpl = async (_url, options) => {
      payloads.push(JSON.parse(options.body));
      return { ok: true };
    };
    try {
      assert.deepEqual(
        await submitMonthlyActiveSignal(home, "0.20.0", "claude", { fetchImpl, now: new Date("2026-09-11T12:00:00Z") }),
        { sent: false, reason: "disabled" },
      );

      await setPrivacyMetricsEnabled(home, true);
      await recordPrivacyMetric(home, "doctor_open", "claude", { inventoryCount: 37 });
      const first = await submitMonthlyActiveSignal(home, "0.20.0", "claude", { fetchImpl, now: new Date("2026-09-11T12:00:00Z") });
      const duplicate = await submitMonthlyActiveSignal(home, "0.20.0", "claude", { fetchImpl, now: new Date("2026-09-30T12:00:00Z") });
      const nextMonth = await submitMonthlyActiveSignal(home, "0.20.0", "codex", { fetchImpl, now: new Date("2026-10-01T12:00:00Z") });

      assert.equal(first.sent, true);
      assert.equal(duplicate.reason, "already-submitted");
      assert.equal(nextMonth.sent, true);
      assert.equal(payloads.length, 2);
      assert.equal("events" in payloads[0], false);
      assert.equal("inventoryBucket" in payloads[0], false);
      assert.equal(payloads[1].harness, "codex");
      assert.equal((await getPrivacyMetricsStatus(home)).lastSubmittedMonth, "2026-10");
    } finally {
      await rm(home, { recursive: true, force: true });
    }
  });

  it("throttles failed submissions before retrying", async () => {
    const home = await mkdtemp(join(tmpdir(), "cco-mau-retry-"));
    let attempts = 0;
    const fetchImpl = async () => {
      attempts += 1;
      return { ok: false };
    };
    try {
      await setPrivacyMetricsEnabled(home, true);
      const failed = await submitMonthlyActiveSignal(home, "0.20.0", "claude", { fetchImpl, now: new Date("2026-09-11T12:00:00Z") });
      const throttled = await submitMonthlyActiveSignal(home, "0.20.0", "claude", { fetchImpl, now: new Date("2026-09-11T13:00:00Z") });
      assert.equal(failed.reason, "server-rejected");
      assert.equal(throttled.reason, "retry-later");
      assert.equal(attempts, 1);
    } finally {
      await rm(home, { recursive: true, force: true });
    }
  });
});
