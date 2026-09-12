import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
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

  it('opens the actual fallback port after the dashboard starts listening', { skip: process.platform === 'win32' }, async () => {
    const home = await mkdtemp(join(tmpdir(), 'cco-cli-home-'));
    const fakeBin = join(home, 'bin');
    const capturePath = join(home, 'opened-url.txt');
    const openCommand = process.platform === 'darwin' ? 'open' : 'xdg-open';
    const openCommandPath = join(fakeBin, openCommand);
    await mkdir(fakeBin, { recursive: true });
    await writeFile(openCommandPath, [
      '#!/usr/bin/env node',
      'const { writeFileSync } = require("node:fs");',
      'writeFileSync(process.env.CCO_OPEN_CAPTURE, process.argv[2]);',
      '',
    ].join('\n'));
    await chmod(openCommandPath, 0o755);

    const blocker = createServer();
    await new Promise((resolve, reject) => {
      blocker.once('error', reject);
      blocker.listen(0, '127.0.0.1', resolve);
    });
    const busyPort = blocker.address().port;
    const child = spawn(process.execPath, [cliPath, '--port', String(busyPort)], {
      cwd: repoRoot,
      env: {
        ...process.env,
        HOME: home,
        PATH: `${fakeBin}:${process.env.PATH}`,
        CCO_OPEN_CAPTURE: capturePath,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let boundPort = null;

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`CLI did not use a fallback port; stderr: ${stderr}`)), 5000);
        child.stderr.on('data', chunk => { stderr += chunk; });
        child.stdout.on('data', chunk => {
          stdout += chunk;
          const match = stdout.match(/running at http:\/\/localhost:(\d+)/);
          if (match) {
            boundPort = Number(match[1]);
            clearTimeout(timeout);
            resolve();
          }
        });
        child.once('error', error => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      let openedUrl = '';
      for (let attempt = 0; attempt < 20 && !openedUrl; attempt++) {
        try { openedUrl = await readFile(capturePath, 'utf8'); } catch {}
        if (!openedUrl) await new Promise(resolve => setTimeout(resolve, 25));
      }
      assert.notEqual(boundPort, busyPort);
      assert.equal(openedUrl, `http://localhost:${boundPort}`);
      assert.equal(stderr, '');
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');
        child.kill('SIGTERM');
        await exited;
      }
      await new Promise(resolve => blocker.close(resolve));
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
