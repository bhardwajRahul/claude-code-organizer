import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dshAdapter } from '../../src/harness/adapters/dsh.mjs';
import { validateAdapter } from '../../src/harness/interface.mjs';
import { scanHarness } from '../../src/harness/scanner-framework.mjs';

describe('dsh adapter', () => {
  let home;
  let project;
  let adapter;

  before(async () => {
    home = await mkdtemp(join(tmpdir(), 'cco-dsh-adapter-'));
    const d = join(home, '.dsh');
    project = join(home, 'work', 'demo-project');

    await mkdir(join(d, 'profiles', 'web'), { recursive: true });
    await mkdir(join(d, 'profiles', 'headless'), { recursive: true });
    await mkdir(join(d, 'skills', 'demo-skill'), { recursive: true });
    await mkdir(join(d, 'skills', '.system', 'system-skill'), { recursive: true });
    await mkdir(join(d, 'skills', 'nested', 'not-a-top-level-skill'), { recursive: true });
    await mkdir(join(home, '.agents', 'skills', 'shared-skill'), { recursive: true });
    await mkdir(join(project, '.git'), { recursive: true });
    await mkdir(join(project, '.dsh', 'skills', 'project-dsh-skill'), { recursive: true });
    await mkdir(join(project, '.agents', 'skills', 'project-agent-skill'), { recursive: true });

    await writeFile(join(d, 'settings.yaml'), [
      'ui-onboarding:',
      '  welcomeNoticeVersion: 2026-08-13',
      'agent-default-model:',
      '  provider: deepseek-official',
      '  model: deepseek-v4-flash-vision-exp',
    ].join('\n'));

    await writeFile(join(d, 'profiles', 'web', 'cordis.yml'), '# dsh profile root\n[]\n');
    await writeFile(join(d, 'profiles', 'web', 'cordis.patch.yml'), [
      '- insert:',
      '    - id: ponytail',
      "      name: file:///F:/dsh-ponytail/src/index.js",
    ].join('\n'));
    await writeFile(join(d, 'profiles', 'web', 'package.json'), JSON.stringify({
      name: 'dsh-web',
      description: 'DSH web profile',
    }, null, 2));
    await writeFile(join(d, 'profiles', 'headless', 'cordis.yml'), '# dsh profile root\n[]\n');

    await writeFile(join(d, 'skills', 'demo-skill', 'SKILL.md'), '# Demo Skill\n\nUse this for DSH adapter smoke tests.\n');
    await writeFile(join(d, 'skills', 'flat-skill.md'), '# Flat Skill\n\nDSH also supports flat Markdown skills.\n');
    await writeFile(join(d, 'skills', '.system', 'system-skill', 'SKILL.md'), '# System Skill\n\nNested system skill layout.\n');
    await writeFile(join(d, 'skills', 'nested', 'not-a-top-level-skill', 'SKILL.md'), '# Nested\n\nDSH deliberately ignores nested skills.\n');
    await writeFile(join(home, '.agents', 'skills', 'shared-skill', 'SKILL.md'), '# Shared Skill\n\nLoaded from the shared agent root.\n');
    await writeFile(join(project, '.dsh', 'skills', 'project-dsh-skill', 'SKILL.md'), '# Project DSH Skill\n\nProject-local DSH skill.\n');
    await writeFile(join(project, '.agents', 'skills', 'project-agent-skill', 'SKILL.md'), '# Project Agent Skill\n\nProject-local shared skill.\n');

    adapter = validateAdapter(dshAdapter);
  });

  after(async () => {
    await rm(home, { recursive: true, force: true });
  });

  it('validates against the HarnessAdapter contract', () => {
    assert.equal(adapter.id, 'dsh');
    assert.equal(adapter.displayName, 'DeepSeek Harness');
    assert.ok(Array.isArray(adapter.categories));
    assert.ok(Array.isArray(adapter.scopeTypes));
    assert.ok(typeof adapter.getPaths === 'function');
    assert.ok(typeof adapter.discoverScopes === 'function');
    assert.ok(adapter.scanners && typeof adapter.scanners === 'object');
  });

  it('declares supported capabilities as booleans', () => {
    for (const key of ['contextBudget', 'mcpControls', 'mcpPolicy', 'mcpSecurity', 'sessions', 'sessionDistill', 'effective', 'backup']) {
      assert.equal(typeof adapter.capabilities[key], 'boolean', `capabilities.${key} must be boolean`);
    }
    assert.equal(adapter.capabilities.sessions, false);
    assert.equal(adapter.capabilities.sessionDistill, false);
  });

  it('scans config, profiles, and skills', async () => {
    const result = await scanHarness(adapter, { home, cwd: project, env: {} });

    const configNames = result.items.filter((i) => i.category === 'config').map((i) => i.name);
    const profileNames = result.items.filter((i) => i.category === 'profile').map((i) => i.name);
    // skill names may use / or \\ on Windows; assert by suffix (portable).
    const skillNames = result.items.filter((i) => i.category === 'skill').map((i) => i.name);

    assert.ok(configNames.includes('settings.yaml'), 'scans global settings.yaml');
    assert.ok(configNames.includes('web/cordis.yml'), 'scans web cordis.yml');
    assert.ok(configNames.includes('web/cordis.patch.yml'), 'scans web cordis.patch.yml');
    assert.ok(configNames.includes('headless/cordis.yml'), 'scans headless cordis.yml');

    assert.ok(profileNames.includes('web'), 'finds web profile');
    assert.ok(profileNames.includes('headless'), 'finds headless profile');

    assert.ok(skillNames.includes('demo-skill'), 'finds demo skill');
    assert.ok(skillNames.includes('flat-skill'), 'finds flat Markdown skill');
    assert.ok(skillNames.includes('shared-skill'), 'finds shared ~/.agents skill');
    assert.ok(skillNames.includes('project-dsh-skill'), 'finds project .dsh skill');
    assert.ok(skillNames.includes('project-agent-skill'), 'finds project .agents skill');
    assert.ok(!skillNames.some((n) => n.includes('system-skill')), 'skips non-loadable .system child');
    assert.ok(!skillNames.some((n) => n.includes('not-a-top-level-skill')), 'does not invent nested skills DSH would not load');
    assert.equal(result.scopes.length, 2, 'global + current project');
    assert.equal(result.scopes.find((scope) => scope.type === 'project')?.parentId, 'global');
  });

  it('reports reasonable counts', async () => {
    const result = await scanHarness(adapter, { home, cwd: project, env: {} });
    assert.equal(result.counts.total, 11, 'settings + 3 cordis + 2 profiles + 5 skills');
    assert.equal(result.counts.config, 4);
    assert.equal(result.counts.profile, 2);
    assert.equal(result.counts.skill, 5);
  });

  it('honors DSH path overrides without allowing the whole home directory', () => {
    const customDsh = join(home, 'custom-dsh');
    const customAgents = join(home, 'custom-agents');
    const paths = adapter.getPaths({
      home,
      env: { DSH_HOME: customDsh, DSH_AGENTS_HOME: customAgents },
    });
    assert.equal(paths.rootDir, customDsh);
    assert.deepEqual(paths.safeRoots, [customDsh, customAgents]);
    assert.ok(!paths.safeRoots.includes(home));
  });
});
