import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isPathWithin, normalizedPath } from "../../src/path-security.mjs";

describe("path security", () => {
  it("accepts a Windows path inside a discovered project across case and separator differences", () => {
    assert.equal(isPathWithin("c:/WORK/Repo/.claude/skills/review/SKILL.md", "C:\\work\\repo", "win32"), true);
  });

  it("accepts a Windows drive root and the root itself", () => {
    assert.equal(isPathWithin("D:\\projects\\app\\AGENTS.md", "D:\\", "win32"), true);
    assert.equal(isPathWithin("D:\\", "d:/", "win32"), true);
  });

  it("rejects a different Windows drive", () => {
    assert.equal(isPathWithin("D:\\repo\\file.md", "C:\\repo", "win32"), false);
  });

  it("rejects Windows sibling-prefix paths", () => {
    assert.equal(isPathWithin("C:\\repo-old\\file.md", "C:\\repo", "win32"), false);
  });

  it("handles Windows UNC shares without crossing share boundaries", () => {
    assert.equal(isPathWithin("\\\\server\\share\\repo\\file.md", "\\\\SERVER\\SHARE\\repo", "win32"), true);
    assert.equal(isPathWithin("\\\\server\\share-two\\repo\\file.md", "\\\\server\\share", "win32"), false);
  });

  it("rejects relative paths on every platform", () => {
    assert.equal(isPathWithin("repo/file.md", "/repo", "linux"), false);
    assert.equal(isPathWithin("repo\\file.md", "C:\\repo", "win32"), false);
  });

  it("preserves POSIX case sensitivity and descendant boundaries", () => {
    assert.equal(isPathWithin("/repo/app/file.md", "/repo/app", "linux"), true);
    assert.equal(isPathWithin("/Repo/app/file.md", "/repo/app", "linux"), false);
    assert.equal(isPathWithin("/repo/application/file.md", "/repo/app", "linux"), false);
  });

  it("normalizes Windows paths case-insensitively", () => {
    assert.equal(normalizedPath("C:\\Repo\\..\\Repo\\FILE.md", "win32"), "c:\\repo\\file.md");
  });
});
