import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, it } from 'node:test';

const execFileAsync = promisify(execFile);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const cliPath = join(repoRoot, 'bin', 'cli.mjs');
const releaseVerifierPath = join(repoRoot, 'scripts', 'verify-release.mjs');
const packageVersion = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8')).version;

async function runInformationalFlag(flag) {
  const home = await mkdtemp(join(tmpdir(), 'cco-cli-home-'));
  try {
    return await execFileAsync(process.execPath, [cliPath, flag], {
      cwd: repoRoot,
      env: { ...process.env, HOME: home },
    });
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

describe('CLI informational flags', () => {
  it('--help prints usage without requiring a Claude home', async () => {
    const { stdout, stderr } = await runInformationalFlag('--help');
    assert.match(stdout, /Usage:/);
    assert.match(stdout, /--distill <session\.jsonl>/);
    assert.equal(stderr, '');
  });

  it('--version prints the package version without starting the server', async () => {
    const { stdout, stderr } = await runInformationalFlag('--version');
    assert.equal(stdout.trim(), '0.20.0');
    assert.equal(stderr, '');
  });

  it('starts for non-Claude users without creating a Claude home', async () => {
    const home = await mkdtemp(join(tmpdir(), 'cco-cli-home-'));
    const child = spawn(process.execPath, [cliPath, '--no-open', '--port', '0'], {
      cwd: repoRoot,
      env: { ...process.env, HOME: home },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`CLI did not start; stderr: ${stderr}`)), 5000);
        child.stderr.on('data', chunk => { stderr += chunk; });
        child.stdout.on('data', chunk => {
          stdout += chunk;
          if (stdout.includes('Cross-Code Organizer (CCO) running at')) {
            clearTimeout(timeout);
            resolve();
          }
        });
        child.once('error', error => {
          clearTimeout(timeout);
          reject(error);
        });
        child.once('exit', code => {
          if (!stdout.includes('Cross-Code Organizer (CCO) running at')) {
            clearTimeout(timeout);
            reject(new Error(`CLI exited early (${code}); stderr: ${stderr}`));
          }
        });
      });

      assert.equal(stderr, '');
      await assert.rejects(access(join(home, '.claude')));
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');
        child.kill('SIGTERM');
        await exited;
      }
      await rm(home, { recursive: true, force: true });
    }
  });

  it('installs a current cross-harness /cco skill that follows the actual server URL', async () => {
    const home = await mkdtemp(join(tmpdir(), 'cco-cli-home-'));
    await mkdir(join(home, '.claude'), { recursive: true });
    const child = spawn(process.execPath, [cliPath, '--no-open', '--port', '0'], {
      cwd: repoRoot,
      env: { ...process.env, HOME: home },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`CLI did not start; stderr: ${stderr}`)), 5000);
        child.stderr.on('data', chunk => { stderr += chunk; });
        child.stdout.on('data', chunk => {
          stdout += chunk;
          if (stdout.includes('Cross-Code Organizer (CCO) running at')) {
            clearTimeout(timeout);
            resolve();
          }
        });
        child.once('error', error => {
          clearTimeout(timeout);
          reject(error);
        });
        child.once('exit', code => {
          if (!stdout.includes('Cross-Code Organizer (CCO) running at')) {
            clearTimeout(timeout);
            reject(new Error(`CLI exited early (${code}); stderr: ${stderr}`));
          }
        });
      });

      const skill = await readFile(join(home, '.claude', 'skills', 'cco', 'SKILL.md'), 'utf8');
      assert.match(skill, /Claude Code, Codex CLI, OpenCode, and DeepSeek Harness/);
      assert.match(skill, /exact URL that CCO printed/);
      assert.doesNotMatch(skill, /Global > Workspace > Project/);
      assert.doesNotMatch(skill, /http:\/\/localhost:3847/);
      assert.equal(stderr, '');
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');
        child.kill('SIGTERM');
        await exited;
      }
      await rm(home, { recursive: true, force: true });
    }
  });
});

describe('release metadata verifier', () => {
  it('accepts synchronized package, plugin, MCP, tag, and notes metadata', async () => {
    const { stdout, stderr } = await execFileAsync(process.execPath, [releaseVerifierPath], {
      cwd: repoRoot,
      env: { ...process.env, CCO_RELEASE_TAG: `v${packageVersion}` },
    });
    assert.match(stdout, /Release metadata verified/);
    assert.equal(stderr, '');
  });

  it('rejects a tag that does not match the package version', async () => {
    await assert.rejects(
      execFileAsync(process.execPath, [releaseVerifierPath], {
        cwd: repoRoot,
        env: { ...process.env, CCO_RELEASE_TAG: 'v9.9.9' },
      }),
      error => {
        assert.ok(error.stderr.includes(`release tag: expected "v${packageVersion}", got "v9.9.9"`));
        return true;
      },
    );
  });
});
