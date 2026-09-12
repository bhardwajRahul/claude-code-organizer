import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { distillSession } from "../../src/session-distiller.mjs";

const OLD_SESSION_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function record(type, uuid, parentUuid, message, extra = {}) {
  return {
    type,
    uuid,
    parentUuid,
    sessionId: OLD_SESSION_ID,
    session_id: OLD_SESSION_ID,
    isSidechain: false,
    userType: "external",
    entrypoint: "cli",
    cwd: "/tmp/project",
    version: "2.1.261",
    gitBranch: "main",
    timestamp: "2026-09-11T12:00:00.000Z",
    message,
    ...extra,
  };
}

function fixture(label = "ONE") {
  const largeResult = `${label}|first line\n${label}-${"x".repeat(1900)}`;
  return {
    largeResult,
    records: [
      { type: "ai-title", sessionId: OLD_SESSION_ID, aiTitle: "Distiller fixture" },
      record("user", "u1", null, { role: "user", content: "Keep this user text exactly." }),
      record("assistant", "a1", "u1", {
        id: "msg_tool",
        role: "assistant",
        content: [
          { type: "thinking", thinking: "private reasoning must not become ordinary text" },
          { type: "tool_use", id: "tool-1", name: "Bash", input: { command: "generate output" } },
        ],
        usage: { input_tokens: 1000 },
        diagnostics: { something: true },
      }),
      record("attachment", "attachment-1", "a1", undefined, { attachment: { name: "large.bin" } }),
      record("user", "u2", "attachment-1", {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "tool-1", content: largeResult }],
      }, {
        sourceToolAssistantUUID: "a1",
        toolUseResult: { stdout: largeResult },
      }),
      record("user", "summary", "u2", {
        role: "user",
        content: "A lossy compact summary that should not be duplicated.",
      }, { isCompactSummary: true }),
      record("assistant", "a2", "summary", {
        id: "msg_final",
        role: "assistant",
        content: [{ type: "text", text: "Keep this assistant text exactly." }],
        usage: { output_tokens: 50 },
      }),
      { type: "last-prompt", sessionId: OLD_SESSION_ID, leafUuid: "deleted-leaf", lastPrompt: "original prompt" },
    ],
  };
}

async function writeFixture(dir, name, data) {
  const path = join(dir, name);
  await writeFile(path, data.records.map(value => JSON.stringify(value)).join("\n") + "\n");
  return path;
}

async function withTempDir(fn) {
  const dir = await mkdtemp(join(tmpdir(), "cco-distiller-test-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

function parseJsonl(text) {
  return text.trim().split("\n").map(line => JSON.parse(line));
}

describe("session-distiller", () => {
  it("creates an independent, fully chained Claude transcript and exact backup", async () => {
    await withTempDir(async dir => {
      const data = fixture();
      const source = await writeFixture(dir, "source.jsonl", data);
      const sourceBytes = await readFile(source, "utf-8");
      const newId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

      const result = await distillSession(source, { outputDir: dir, sessionId: newId });
      const output = parseJsonl(await readFile(result.outputPath, "utf-8"));
      const conversation = output.filter(value => value.type === "user" || value.type === "assistant");

      assert.equal(await readFile(result.backupPath, "utf-8"), sourceBytes, "backup must match the indexed snapshot byte-for-byte");
      assert.equal(output[0].type, "ai-title");
      assert.equal(output[0].sessionId, newId);
      assert.equal(conversation.length, 4, "tool result remains as a concise conversation record; compact summary is removed");

      const originalUuids = new Set(["u1", "a1", "attachment-1", "u2", "summary", "a2"]);
      for (let index = 0; index < conversation.length; index++) {
        const value = conversation[index];
        assert.equal(value.sessionId, newId);
        assert.equal(value.session_id, newId);
        assert.equal(value.parentUuid, index === 0 ? null : conversation[index - 1].uuid);
        assert.equal(originalUuids.has(value.uuid), false, "distilled records need independent UUIDs");
      }

      const lastPrompt = output.find(value => value.type === "last-prompt");
      assert.equal(lastPrompt.leafUuid, conversation.at(-1).uuid);

      const allText = conversation.flatMap(value => (
        typeof value.message.content === "string"
          ? [value.message.content]
          : value.message.content.filter(block => block.type === "text").map(block => block.text)
      ));
      assert.ok(allText.includes("Keep this user text exactly."));
      assert.ok(allText.includes("Keep this assistant text exactly."));
      assert.equal(allText.some(text => text.includes("lossy compact summary")), false);
      assert.equal(allText.some(text => text.includes("private reasoning")), false);
      assert.equal(JSON.stringify(output).includes('"tool_use"'), false);
      assert.equal(JSON.stringify(output).includes('"tool_result"'), false);
      assert.equal(JSON.stringify(output).includes(data.largeResult), false, "large result must not remain inline");

      const index = await readFile(result.stats.indexPath, "utf-8");
      assert.match(index, /ONE\\\|first line/);
      assert.match(index, /Backup line/);
      assert.match(allText.at(-1), /DISTILLED SESSION METADATA/);
    });
  });

  it("fails closed on malformed JSONL and never overwrites its source", async () => {
    await withTempDir(async dir => {
      const source = join(dir, "cccccccc-cccc-4ccc-8ccc-cccccccccccc.jsonl");
      await writeFile(source, '{"type":"user"}\nnot-json\n');

      await assert.rejects(
        distillSession(source, { outputDir: dir, sessionId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" }),
        /Malformed session JSONL at line 2/,
      );

      await writeFile(source, JSON.stringify(record(
        "user",
        "valid-user",
        null,
        { role: "user", content: "valid content" },
      )) + "\n");
      await assert.rejects(
        distillSession(source, { outputDir: dir, sessionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" }),
        /cannot overwrite its source/,
      );
    });
  });

  it("keeps concurrent indexes isolated", async () => {
    await withTempDir(async dir => {
      const first = fixture("FIRST");
      const second = fixture("SECOND");
      const firstPath = await writeFixture(dir, "first.jsonl", first);
      const secondPath = await writeFixture(dir, "second.jsonl", second);

      const [firstResult, secondResult] = await Promise.all([
        distillSession(firstPath, { outputDir: dir, sessionId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee" }),
        distillSession(secondPath, { outputDir: dir, sessionId: "ffffffff-ffff-4fff-8fff-ffffffffffff" }),
      ]);
      const [firstIndex, secondIndex] = await Promise.all([
        readFile(firstResult.stats.indexPath, "utf-8"),
        readFile(secondResult.stats.indexPath, "utf-8"),
      ]);

      assert.match(firstIndex, /FIRST/);
      assert.doesNotMatch(firstIndex, /SECOND/);
      assert.match(secondIndex, /SECOND/);
      assert.doesNotMatch(secondIndex, /FIRST/);
    });
  });

  it("keeps only the resumable branch and crosses compact boundaries into its original history", async () => {
    await withTempDir(async dir => {
      const source = join(dir, "branched.jsonl");
      const rows = [
        record("user", "root-user", null, { role: "user", content: "ROOT ACTIVE" }),
        record("assistant", "root-assistant", "root-user", { role: "assistant", content: "ROOT ANSWER" }),
        record("user", "abandoned-user", "root-assistant", { role: "user", content: "ABANDONED BRANCH" }),
        record("assistant", "abandoned-assistant", "abandoned-user", { role: "assistant", content: "ABANDONED ANSWER" }),
        record("user", "active-user", "root-assistant", { role: "user", content: "ACTIVE BEFORE COMPACT" }),
        {
          type: "system",
          subtype: "compact_boundary",
          uuid: "compact-boundary",
          parentUuid: null,
          logicalParentUuid: "active-user",
          sessionId: OLD_SESSION_ID,
        },
        record("user", "compact-summary", "compact-boundary", {
          role: "user",
          content: "LOSSY COMPACT SUMMARY",
        }, { isCompactSummary: true }),
        record("assistant", "active-after-compact", "compact-summary", {
          role: "assistant",
          content: "ACTIVE AFTER COMPACT",
        }),
        { type: "last-prompt", sessionId: OLD_SESSION_ID, leafUuid: "active-after-compact" },
      ];
      await writeFile(source, rows.map(value => JSON.stringify(value)).join("\n") + "\n");

      const result = await distillSession(source, {
        outputDir: dir,
        sessionId: "12121212-1212-4212-8212-121212121212",
      });
      const output = await readFile(result.outputPath, "utf-8");

      assert.match(output, /ROOT ACTIVE/);
      assert.match(output, /ROOT ANSWER/);
      assert.match(output, /ACTIVE BEFORE COMPACT/);
      assert.match(output, /ACTIVE AFTER COMPACT/);
      assert.doesNotMatch(output, /ABANDONED BRANCH|ABANDONED ANSWER/);
      assert.doesNotMatch(output, /LOSSY COMPACT SUMMARY/);
      assert.equal(result.stats.skippedInactiveRecords, 2);
    });
  });

  it("keeps all conversation records when duplicate UUIDs make the graph ambiguous", async () => {
    await withTempDir(async dir => {
      const source = join(dir, "duplicate-uuid.jsonl");
      const rows = [
        record("user", "root-user", null, { role: "user", content: "ROOT RECORD" }),
        record("assistant", "duplicate", "root-user", {
          role: "assistant",
          content: "FIRST DUPLICATE RECORD",
        }),
        record("user", "duplicate", "root-user", {
          role: "user",
          content: "SECOND DUPLICATE RECORD",
        }),
        { type: "last-prompt", sessionId: OLD_SESSION_ID, leafUuid: "duplicate" },
      ];
      await writeFile(source, rows.map(value => JSON.stringify(value)).join("\n") + "\n");

      const result = await distillSession(source, {
        outputDir: dir,
        sessionId: "13131313-1313-4313-8313-131313131313",
      });
      const output = await readFile(result.outputPath, "utf-8");

      assert.match(output, /ROOT RECORD/);
      assert.match(output, /FIRST DUPLICATE RECORD/);
      assert.match(output, /SECOND DUPLICATE RECORD/);
      assert.equal(result.stats.skippedInactiveRecords, 0);
    });
  });
});
