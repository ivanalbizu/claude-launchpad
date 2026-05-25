import { describe, expect, it, vi } from 'vitest';
import { INITIAL_WIZARD_STATE, type WizardState } from '@/data/wizard-state.ts';
import { generateSettings } from './export.service.ts';

vi.mock('./prompts.service.ts', () => ({
  listPrompts: () => [],
}));

function makeState(overrides: Partial<WizardState> = {}): WizardState {
  return { ...INITIAL_WIZARD_STATE, ...overrides };
}

describe('generateSettings', () => {
  it('defaults to the node profile when no runtime detected', () => {
    const settings = generateSettings(INITIAL_WIZARD_STATE);
    expect(settings.permissions.allow).toContain('Bash(pnpm dev)');
    expect(settings.permissions.allow).toContain('Bash(npm run:*)');
    expect(settings.permissions.deny).toContain('Bash(pnpm publish:*)');
  });

  it('uses the bun profile when bun is in the stack', () => {
    const settings = generateSettings(makeState({ techStack: ['bun'] }));
    expect(settings.permissions.allow).toContain('Bash(bun dev)');
    expect(settings.permissions.deny).toContain('Bash(bun publish:*)');
    expect(settings.permissions.allow).not.toContain('Bash(pnpm dev)');
  });

  it('uses the python profile for python projects', () => {
    const settings = generateSettings(makeState({ techStack: ['python'] }));
    expect(settings.permissions.allow).toContain('Bash(pytest:*)');
    expect(settings.permissions.deny).toContain('Bash(pip install:*)');
  });

  it('uses the rust profile for rust projects', () => {
    const settings = generateSettings(makeState({ techStack: ['rust'] }));
    expect(settings.permissions.allow).toContain('Bash(cargo build)');
    expect(settings.permissions.deny).toContain('Bash(cargo publish:*)');
  });

  it('uses the go profile for go projects', () => {
    const settings = generateSettings(makeState({ techStack: ['go'] }));
    expect(settings.permissions.allow).toContain('Bash(go build:*)');
    expect(settings.permissions.deny).toContain('Bash(go install:*)');
  });

  it('uses the deno profile when deno is in the stack', () => {
    const settings = generateSettings(makeState({ techStack: ['deno'] }));
    expect(settings.permissions.allow).toContain('Bash(deno run:*)');
    expect(settings.permissions.deny).toContain('Bash(deno install:*)');
  });

  it('prioritizes bun over node when both are present', () => {
    const settings = generateSettings(makeState({ techStack: ['bun', 'node'] }));
    expect(settings.permissions.allow).toContain('Bash(bun dev)');
    expect(settings.permissions.allow).not.toContain('Bash(pnpm dev)');
  });

  it('always includes the common allow/deny rules across profiles', () => {
    const settings = generateSettings(INITIAL_WIZARD_STATE);
    expect(settings.permissions.allow).toContain('Bash(git status)');
    expect(settings.permissions.deny).toContain('Bash(rm -rf:*)');
    expect(settings.permissions.deny).toContain('Bash(git push --force:*)');
    expect(settings.permissions.deny).toContain('Bash(sudo:*)');
  });

  it('does NOT add hardened rules when hardenedPermissions is false', () => {
    const settings = generateSettings(INITIAL_WIZARD_STATE);
    expect(settings.permissions.deny).not.toContain('Bash(curl:*)');
    expect(settings.permissions.deny).not.toContain('Read(.env)');
    expect(settings.permissions.deny).not.toContain('Edit(.github/workflows/**)');
  });

  it('adds hardened deny rules when hardenedPermissions is true', () => {
    const settings = generateSettings(makeState({ hardenedPermissions: true }));
    const deny = settings.permissions.deny;
    expect(deny).toContain('Bash(curl:*)');
    expect(deny).toContain('Bash(wget:*)');
    expect(deny).toContain('Bash(eval:*)');
    expect(deny).toContain('Bash(base64 -d:*)');
    expect(deny).toContain('Read(.env)');
    expect(deny).toContain('Read(~/.ssh/**)');
    expect(deny).toContain('Read(~/.aws/**)');
    expect(deny).toContain('Edit(.github/workflows/**)');
    expect(deny).toContain('Write(.github/workflows/**)');
  });

  it('keeps profile deny rules alongside hardened ones', () => {
    const settings = generateSettings(
      makeState({ techStack: ['python'], hardenedPermissions: true }),
    );
    expect(settings.permissions.deny).toContain('Bash(pip install:*)');
    expect(settings.permissions.deny).toContain('Bash(curl:*)');
  });

  it('produces a JSON-serializable shape', () => {
    const settings = generateSettings(makeState({ hardenedPermissions: true }));
    expect(() => JSON.stringify(settings)).not.toThrow();
    expect(Array.isArray(settings.permissions.allow)).toBe(true);
    expect(Array.isArray(settings.permissions.deny)).toBe(true);
  });

  it('omits mcpServers when none are selected', () => {
    const settings = generateSettings(INITIAL_WIZARD_STATE);
    expect(settings.mcpServers).toBeUndefined();
  });

  it('adds the selected MCP servers under mcpServers in settings.json', () => {
    const settings = generateSettings(makeState({ mcpServers: ['github', 'git'] }));
    expect(settings.mcpServers).toBeDefined();
    expect(Object.keys(settings.mcpServers ?? {})).toEqual(['github', 'git']);
    expect(settings.mcpServers?.github.command).toBe('npx');
    expect(settings.mcpServers?.github.env?.GITHUB_PERSONAL_ACCESS_TOKEN).toBe('${GITHUB_TOKEN}');
    expect(settings.mcpServers?.git.args).toContain('@modelcontextprotocol/server-git');
  });

  it('skips unknown MCP server ids silently', () => {
    const settings = generateSettings(makeState({ mcpServers: ['does-not-exist'] }));
    expect(settings.mcpServers).toBeUndefined();
  });
});
