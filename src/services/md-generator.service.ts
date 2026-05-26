import { TECH_CATEGORIES, TECH_STACKS } from '@/data/tech-stacks.ts';
import { CONVENTION_CATEGORIES } from '@/data/conventions.ts';
import { TESTING_FRAMEWORKS } from '@/data/testing-strategies.ts';
import { COMMAND_TEMPLATES } from '@/data/command-templates.ts';
import { AGENT_TEMPLATES } from '@/data/agent-templates.ts';
import { SKILL_TEMPLATES } from '@/data/skill-templates.ts';
import { MCP_SERVERS } from '@/data/mcp-servers.ts';
import type { WizardState } from '@/data/wizard-state.ts';
import { promptToSlashCommand } from './prompt-to-command.service.ts';
import { listPrompts } from './prompts.service.ts';

const FALLBACK_TITLE = 'Mi Proyecto';

export function generateClaudeMd(state: WizardState): string {
  const title = state.projectName.trim() || FALLBACK_TITLE;
  const parts: string[] = [`# ${title}`];

  const description = state.description.trim();
  if (description) {
    parts.push(blockquote(description));
  }

  for (const section of [
    renderStack(state),
    renderCommands(state),
    renderConventions(state),
    renderRestrictions(state),
    renderPermissions(),
    renderAgents(state),
    renderSkills(state),
    renderMcpServers(state),
    renderSlashCommands(state),
  ]) {
    if (section) parts.push(section);
  }

  return parts.join('\n\n') + '\n';
}

function blockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function renderStack(state: WizardState): string | null {
  const rows: string[] = [];

  for (const category of TECH_CATEGORIES) {
    const items = TECH_STACKS.filter(
      (item) => item.category === category.id && state.techStack.includes(item.id),
    );
    if (items.length === 0) continue;
    const labels = items.map((item) => item.label).join(', ');
    rows.push(`- **${category.label}**: ${labels}`);
  }

  const testingFrameworks = state.testing.frameworks
    .map((id) => TESTING_FRAMEWORKS.find((f) => f.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  if (testingFrameworks.length > 0) {
    rows.push(`- **Testing**: ${testingFrameworks.join(', ')}`);
  }

  if (rows.length === 0) return null;
  return ['## Stack', '', ...rows].join('\n');
}

function renderCommands(state: WizardState): string | null {
  const rows = state.commands
    .filter((entry) => entry.cmd.trim().length > 0)
    .map((entry) => {
      const description = entry.description.trim();
      return description
        ? `- \`${entry.cmd.trim()}\` — ${description}`
        : `- \`${entry.cmd.trim()}\``;
    });
  if (rows.length === 0) return null;
  return ['## Comandos', '', ...rows].join('\n');
}

function renderConventions(state: WizardState): string | null {
  const entries = Object.entries(state.conventions).filter(([, optionId]) => optionId);
  if (entries.length === 0) return null;
  const lines: string[] = ['## Convenciones', ''];
  for (const category of CONVENTION_CATEGORIES) {
    const chosenId = state.conventions[category.id];
    if (!chosenId) continue;
    const option = category.options.find((o) => o.id === chosenId);
    if (!option) continue;
    lines.push(`- **${category.label}**: ${option.label}`);
  }
  return lines.join('\n');
}

function renderRestrictions(state: WizardState): string | null {
  const restrictions = state.restrictions.trim();
  const blocks: string[] = [];
  if (restrictions) blocks.push(restrictions);
  if (state.hardenedPermissions) {
    blocks.push(
      '> **Permisos endurecidos activos.** El bundle `.claude/settings.json` añade reglas `deny` extra: bloquea `curl`/`wget`/`ssh`, `eval`/`base64 -d`, lectura de `.env`/`~/.ssh`/`~/.aws`/`~/.config`/`~/.npmrc`, y escritura en `.github/workflows/`.',
    );
  }
  if (blocks.length === 0) return null;
  return `## Restricciones\n\n${blocks.join('\n\n')}`;
}

function renderPermissions(): string {
  return [
    '## Permisos',
    '',
    'El bundle `.claude/settings.json` configura los permisos de Claude Code con dos listas:',
    '',
    '- **`allow`** — la herramienta se ejecuta sin pedir confirmación.',
    '- **`deny`** — rechazo inmediato, sin prompt ni override (salvo editar el fichero).',
    '- **No listada** — Claude Code pregunta al usuario en el momento. Es el default sano.',
    '',
    'Solo se deniegan operaciones realmente irreversibles (`rm -rf`, `git push --force`, `sudo`, `publish`). Las operaciones tipo `pnpm add` / `npm install` se dejan **no listadas a propósito**: hay casos legítimos (bootstrap, dependencia justificada en _Restricciones_), pero requieren confirmación explícita en el momento.',
  ].join('\n');
}

function renderAgents(state: WizardState): string | null {
  if (state.agentTemplates.length === 0) return null;
  const rows: string[] = [];
  for (const id of state.agentTemplates) {
    const agent = AGENT_TEMPLATES.find((a) => a.id === id);
    if (!agent) continue;
    rows.push(`- **${agent.label}** (\`${agent.name}\`) — ${agent.description}`);
  }
  if (rows.length === 0) return null;
  return ['## Sub-agentes disponibles', '', 'Definidos en `.claude/agents/`:', '', ...rows].join(
    '\n',
  );
}

function renderSkills(state: WizardState): string | null {
  if (state.skillTemplates.length === 0) return null;
  const rows: string[] = [];
  let hasManual = false;
  for (const id of state.skillTemplates) {
    const skill = SKILL_TEMPLATES.find((s) => s.id === id);
    if (!skill) continue;
    const invocation = skill.disableModelInvocation ? 'manual' : 'auto';
    if (skill.disableModelInvocation) hasManual = true;
    rows.push(`- **${skill.label}** (\`${skill.name}\`, ${invocation}) — ${skill.description}`);
  }
  if (rows.length === 0) return null;
  const lines = [
    '## Skills disponibles',
    '',
    'Definidas en `.claude/skills/<name>/SKILL.md`:',
    '',
    ...rows,
  ];
  if (hasManual) {
    lines.push(
      '',
      '> Las skills `manual` no se autoanuncian en la lista de skills disponibles de Claude Code — se cargan solo cuando se invocan explícitamente por nombre.',
    );
  }
  return lines.join('\n');
}

function renderMcpServers(state: WizardState): string | null {
  if (state.mcpServers.length === 0) return null;
  const lines: string[] = ['## MCP servers', '', 'Configurados en `.claude/settings.json` bajo `mcpServers`:', ''];
  let any = false;
  for (const id of state.mcpServers) {
    const server = MCP_SERVERS.find((s) => s.id === id);
    if (!server) continue;
    any = true;
    lines.push(`- **${server.label}** (\`${server.key}\`) — ${server.description}`);
    if (server.setupNote) lines.push(`  - _Setup_: ${server.setupNote}`);
  }
  return any ? lines.join('\n') : null;
}

function renderSlashCommands(state: WizardState): string | null {
  const builtin: string[] = [];
  for (const id of state.commandTemplates) {
    const template = COMMAND_TEMPLATES.find((t) => t.id === id);
    if (!template) continue;
    const hint = template.argumentHint ? ` <${template.argumentHint}>` : '';
    builtin.push(`- \`${template.label}${hint}\` — ${template.description}`);
  }

  const custom: string[] = [];
  if (state.customPromptCommands.length > 0) {
    const prompts = listPrompts();
    for (const id of state.customPromptCommands) {
      const prompt = prompts.find((p) => p.id === id);
      if (!prompt) continue;
      const converted = promptToSlashCommand(prompt);
      custom.push(`- \`${converted.label}\` — ${converted.description}`);
    }
  }

  if (builtin.length === 0 && custom.length === 0) return null;
  const lines: string[] = ['## Slash commands disponibles', '', 'Definidos en `.claude/commands/`:', ''];
  lines.push(...builtin, ...custom);
  return lines.join('\n');
}
