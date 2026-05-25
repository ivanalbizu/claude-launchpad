import { describe, expect, it, vi } from 'vitest';
import { INITIAL_WIZARD_STATE, type WizardState } from '@/data/wizard-state.ts';
import { generateClaudeMd } from './md-generator.service.ts';

vi.mock('./prompts.service.ts', () => ({
  listPrompts: () => [],
}));

function makeState(overrides: Partial<WizardState> = {}): WizardState {
  return { ...INITIAL_WIZARD_STATE, ...overrides };
}

describe('generateClaudeMd', () => {
  it('uses fallback title when projectName is empty', () => {
    const md = generateClaudeMd(INITIAL_WIZARD_STATE);
    expect(md.startsWith('# Mi Proyecto')).toBe(true);
  });

  it('uses projectName as H1 when present', () => {
    const md = generateClaudeMd(makeState({ projectName: 'mi-app' }));
    expect(md.startsWith('# mi-app')).toBe(true);
  });

  it('renders description as a blockquote', () => {
    const md = generateClaudeMd(makeState({ description: 'Línea 1\nLínea 2' }));
    expect(md).toContain('> Línea 1\n> Línea 2');
  });

  it('renders Stack section when techStack has items', () => {
    const md = generateClaudeMd(makeState({ techStack: ['typescript', 'lit'] }));
    expect(md).toContain('## Stack');
    expect(md).toContain('TypeScript');
    expect(md).toContain('Lit');
  });

  it('renders Comandos section with non-empty entries only', () => {
    const md = generateClaudeMd(
      makeState({
        commands: [
          { cmd: 'pnpm dev', description: 'Dev server' },
          { cmd: '   ', description: 'ignorame' },
          { cmd: 'pnpm test', description: '' },
        ],
      }),
    );
    expect(md).toContain('## Comandos');
    expect(md).toContain('`pnpm dev` — Dev server');
    expect(md).toContain('`pnpm test`');
    expect(md).not.toContain('ignorame');
  });

  it('renders Convenciones using only filled categories', () => {
    const md = generateClaudeMd(
      makeState({ conventions: { 'code-style': 'prettier-eslint', naming: 'kebab-case-files' } }),
    );
    expect(md).toContain('## Convenciones');
    expect(md).toContain('Estilo de código');
    expect(md).toContain('Naming');
  });

  it('renders Restricciones when provided', () => {
    const md = generateClaudeMd(makeState({ restrictions: '- No hacer foo\n- No hacer bar' }));
    expect(md).toContain('## Restricciones');
    expect(md).toContain('- No hacer foo');
  });

  it('appends hardened-permissions note when enabled', () => {
    const md = generateClaudeMd(
      makeState({ restrictions: '- regla', hardenedPermissions: true }),
    );
    expect(md).toContain('## Restricciones');
    expect(md).toContain('- regla');
    expect(md).toContain('Permisos endurecidos activos');
  });

  it('emits Restricciones section with only the hardened note when restrictions empty', () => {
    const md = generateClaudeMd(makeState({ hardenedPermissions: true }));
    expect(md).toContain('## Restricciones');
    expect(md).toContain('Permisos endurecidos activos');
  });

  it('omits Restricciones entirely when no restrictions and no hardened', () => {
    const md = generateClaudeMd(INITIAL_WIZARD_STATE);
    expect(md).not.toContain('## Restricciones');
  });

  it('renders Sub-agentes section from agentTemplates', () => {
    const md = generateClaudeMd(makeState({ agentTemplates: ['code-reviewer', 'planner'] }));
    expect(md).toContain('## Sub-agentes disponibles');
    expect(md).toContain('Code reviewer');
    expect(md).toContain('`code-reviewer`');
    expect(md).toContain('Planner');
  });

  it('ignores unknown agent ids silently', () => {
    const md = generateClaudeMd(makeState({ agentTemplates: ['does-not-exist'] }));
    expect(md).not.toContain('## Sub-agentes disponibles');
  });

  it('renders Skills section from skillTemplates with invocation mode', () => {
    const md = generateClaudeMd(
      makeState({ skillTemplates: ['changelog-update', 'release-prep'] }),
    );
    expect(md).toContain('## Skills disponibles');
    expect(md).toContain('Changelog update');
    expect(md).toContain('`changelog-update`, auto');
    expect(md).toContain('Release prep');
    expect(md).toContain('`release-prep`, manual');
  });

  it('ignores unknown skill ids silently', () => {
    const md = generateClaudeMd(makeState({ skillTemplates: ['does-not-exist'] }));
    expect(md).not.toContain('## Skills disponibles');
  });

  it('renders MCP servers section with setup notes', () => {
    const md = generateClaudeMd(makeState({ mcpServers: ['github', 'git'] }));
    expect(md).toContain('## MCP servers');
    expect(md).toContain('GitHub');
    expect(md).toContain('`github`');
    expect(md).toContain('_Setup_:');
    expect(md).toContain('GITHUB_TOKEN');
  });

  it('ignores unknown mcp server ids silently', () => {
    const md = generateClaudeMd(makeState({ mcpServers: ['does-not-exist'] }));
    expect(md).not.toContain('## MCP servers');
  });

  it('renders Slash commands section from commandTemplates', () => {
    const md = generateClaudeMd(makeState({ commandTemplates: ['review', 'plan'] }));
    expect(md).toContain('## Slash commands disponibles');
    expect(md).toContain('/review');
    expect(md).toContain('/plan');
  });

  it('ends with a single trailing newline', () => {
    const md = generateClaudeMd(INITIAL_WIZARD_STATE);
    expect(md.endsWith('\n')).toBe(true);
    expect(md.endsWith('\n\n')).toBe(false);
  });

  it('preserves the canonical section order', () => {
    const md = generateClaudeMd(
      makeState({
        projectName: 'demo',
        description: 'algo',
        techStack: ['typescript'],
        commands: [{ cmd: 'pnpm dev', description: 'Dev' }],
        conventions: { 'code-style': 'prettier-eslint' },
        restrictions: '- regla',
        agentTemplates: ['code-reviewer'],
        skillTemplates: ['changelog-update'],
        mcpServers: ['github'],
        commandTemplates: ['review'],
      }),
    );
    const order = [
      '## Stack',
      '## Comandos',
      '## Convenciones',
      '## Restricciones',
      '## Sub-agentes disponibles',
      '## Skills disponibles',
      '## MCP servers',
      '## Slash commands disponibles',
    ].map((h) => md.indexOf(h));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});
