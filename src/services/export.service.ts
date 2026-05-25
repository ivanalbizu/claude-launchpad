import type { WizardState } from '@/data/wizard-state.ts';
import { COMMAND_TEMPLATES, type CommandTemplate } from '@/data/command-templates.ts';
import { AGENT_TEMPLATES, type AgentMetadata } from '@/data/agent-templates.ts';
import type { AgentBody } from '@/data/agent-bodies.ts';
import { SKILL_TEMPLATES, type SkillMetadata } from '@/data/skill-templates.ts';
import type { SkillBody } from '@/data/skill-bodies.ts';
import { MCP_SERVERS, type McpServerConfig } from '@/data/mcp-servers.ts';
import { generateClaudeMd } from './md-generator.service.ts';
import { listPrompts } from './prompts.service.ts';
import { promptToSlashCommand } from './prompt-to-command.service.ts';

export interface ClaudeSettings {
  permissions: {
    allow: string[];
    deny: string[];
  };
  mcpServers?: Record<string, McpServerConfig>;
}

export async function exportClaudeBundle(state: WizardState): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = zip.folder('.claude');
  if (!folder) throw new Error('No se pudo crear el directorio .claude/ en el zip');

  folder.file('CLAUDE.md', generateClaudeMd(state));
  folder.file('settings.json', JSON.stringify(generateSettings(state), null, 2) + '\n');

  const hasBuiltins = state.commandTemplates.length > 0;
  const hasCustomPrompts = state.customPromptCommands.length > 0;
  if (hasBuiltins || hasCustomPrompts) {
    const commandsFolder = folder.folder('commands');
    if (!commandsFolder) throw new Error('No se pudo crear .claude/commands/ en el zip');

    for (const id of state.commandTemplates) {
      const template = COMMAND_TEMPLATES.find((t) => t.id === id);
      if (template) commandsFolder.file(`${template.id}.md`, buildCommandFile(template));
    }

    if (hasCustomPrompts) {
      const prompts = listPrompts();
      const usedSlugs = new Set(state.commandTemplates);
      for (const promptId of state.customPromptCommands) {
        const prompt = prompts.find((p) => p.id === promptId);
        if (!prompt) continue;
        const converted = promptToSlashCommand(prompt);
        const filename = dedupeSlug(converted.slug, usedSlugs);
        commandsFolder.file(
          `${filename}.md`,
          buildPromptCommandFile(converted.description, prompt.content),
        );
      }
    }
  }

  if (state.agentTemplates.length > 0) {
    const { AGENT_BODIES } = await import('@/data/agent-bodies.ts');
    const agentsFolder = folder.folder('agents');
    if (!agentsFolder) throw new Error('No se pudo crear .claude/agents/ en el zip');
    for (const id of state.agentTemplates) {
      const agent = AGENT_TEMPLATES.find((a) => a.id === id);
      if (!agent) continue;
      const body = AGENT_BODIES[agent.id];
      agentsFolder.file(`${agent.name}.md`, buildAgentFile(agent, body));
    }
  }

  if (state.skillTemplates.length > 0) {
    const { SKILL_BODIES } = await import('@/data/skill-bodies.ts');
    const skillsFolder = folder.folder('skills');
    if (!skillsFolder) throw new Error('No se pudo crear .claude/skills/ en el zip');
    for (const id of state.skillTemplates) {
      const skill = SKILL_TEMPLATES.find((s) => s.id === id);
      if (!skill) continue;
      const skillFolder = skillsFolder.folder(skill.name);
      if (!skillFolder)
        throw new Error(`No se pudo crear .claude/skills/${skill.name}/ en el zip`);
      const body = SKILL_BODIES[skill.id];
      skillFolder.file('SKILL.md', buildSkillFile(skill, body));
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

function buildSkillFile(skill: SkillMetadata, body: SkillBody): string {
  const frontmatter: string[] = [
    `name: ${skill.name}`,
    `description: ${yamlBlock(body.frontmatterDescription)}`,
  ];
  if (skill.disableModelInvocation) frontmatter.push('disable-model-invocation: true');
  if (skill.argumentHint) {
    frontmatter.push(`argument-hint: ${yamlValue(`<${skill.argumentHint}>`)}`);
  }
  if (skill.allowedTools.length > 0) {
    frontmatter.push('allowed-tools:');
    for (const tool of skill.allowedTools) frontmatter.push(`  - ${tool}`);
  }
  return `---\n${frontmatter.join('\n')}\n---\n\n${body.body}`;
}

function buildAgentFile(agent: AgentMetadata, body: AgentBody): string {
  const frontmatter: string[] = [
    `name: ${agent.name}`,
    `description: ${yamlBlock(body.frontmatterDescription)}`,
  ];
  if (agent.model) frontmatter.push(`model: ${agent.model}`);
  if (agent.tools && agent.tools.length > 0) {
    frontmatter.push('tools:');
    for (const tool of agent.tools) frontmatter.push(`  - ${tool}`);
  }
  return `---\n${frontmatter.join('\n')}\n---\n\n${body.body}`;
}

function yamlBlock(s: string): string {
  if (s.length < 70 && !/[:#"'\n]/.test(s)) return s;
  const indented = s
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');
  return `>\n${indented}`;
}

function dedupeSlug(slug: string, used: Set<string>): string {
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }
  let i = 2;
  while (used.has(`${slug}-${i}`)) i += 1;
  const next = `${slug}-${i}`;
  used.add(next);
  return next;
}

function buildPromptCommandFile(description: string, content: string): string {
  const frontmatter = `description: ${yamlValue(description)}`;
  return `---\n${frontmatter}\n---\n\n${content}`;
}

function buildCommandFile(template: CommandTemplate): string {
  const frontmatter: string[] = [`description: ${yamlValue(template.description)}`];
  if (template.argumentHint) {
    frontmatter.push(`argument-hint: ${yamlValue(`<${template.argumentHint}>`)}`);
  }
  if (template.model) {
    frontmatter.push(`model: ${template.model}`);
  }
  if (template.allowedTools && template.allowedTools.length > 0) {
    frontmatter.push(`allowed-tools: ${template.allowedTools.join(', ')}`);
  }
  return `---\n${frontmatter.join('\n')}\n---\n\n${template.content}`;
}

function yamlValue(s: string): string {
  if (/[:#"'\n]/.test(s)) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

type RuntimeProfile = 'bun' | 'deno' | 'rust' | 'go' | 'python' | 'node';

function detectRuntime(state: WizardState): RuntimeProfile {
  const has = (id: string): boolean => state.techStack.includes(id);
  if (has('bun')) return 'bun';
  if (has('deno')) return 'deno';
  if (has('rust')) return 'rust';
  if (has('go')) return 'go';
  if (has('python')) return 'python';
  return 'node';
}

const COMMON_ALLOW: readonly string[] = [
  'Bash(git status)',
  'Bash(git diff:*)',
  'Bash(git log:*)',
  'Bash(git show:*)',
  'Bash(git branch)',
  'Bash(git branch -v)',
  'Bash(git branch --list:*)',
  'Bash(git remote -v)',
];

const COMMON_DENY: readonly string[] = [
  'Bash(rm -rf:*)',
  'Bash(git reset --hard:*)',
  'Bash(git branch -D:*)',
  'Bash(git branch -d:*)',
  'Bash(git push --force:*)',
  'Bash(git push -f:*)',
  'Bash(sudo:*)',
];

const HARDENED_DENY: readonly string[] = [
  'Bash(curl:*)',
  'Bash(wget:*)',
  'Bash(nc:*)',
  'Bash(ssh:*)',
  'Bash(scp:*)',
  'Bash(eval:*)',
  'Bash(base64 -d:*)',
  'Bash(base64 --decode:*)',
  'Read(.env)',
  'Read(.env.*)',
  'Read(~/.ssh/**)',
  'Read(~/.aws/**)',
  'Read(~/.config/**)',
  'Read(~/.npmrc)',
  'Edit(.github/workflows/**)',
  'Write(.github/workflows/**)',
  'Edit(.gitlab-ci.yml)',
  'Write(.gitlab-ci.yml)',
];

const PROFILES: Record<RuntimeProfile, { allow: readonly string[]; deny: readonly string[] }> = {
  node: {
    allow: [
      'Bash(pnpm dev)',
      'Bash(pnpm build)',
      'Bash(pnpm test:*)',
      'Bash(pnpm lint)',
      'Bash(pnpm format)',
      'Bash(npm test:*)',
      'Bash(npm run:*)',
    ],
    deny: [
      'Bash(pnpm publish:*)',
      'Bash(npm publish:*)',
      'Bash(pnpm add:*)',
      'Bash(pnpm install:*)',
      'Bash(npm install:*)',
    ],
  },
  bun: {
    allow: [
      'Bash(bun dev)',
      'Bash(bun run:*)',
      'Bash(bun test:*)',
      'Bash(bun build:*)',
      'Bash(bunx:*)',
    ],
    deny: ['Bash(bun publish:*)', 'Bash(bun add:*)', 'Bash(bun install:*)', 'Bash(bun remove:*)'],
  },
  deno: {
    allow: [
      'Bash(deno run:*)',
      'Bash(deno test:*)',
      'Bash(deno task:*)',
      'Bash(deno fmt)',
      'Bash(deno lint)',
      'Bash(deno check:*)',
    ],
    deny: ['Bash(deno publish:*)', 'Bash(deno install:*)'],
  },
  rust: {
    allow: [
      'Bash(cargo build)',
      'Bash(cargo build:*)',
      'Bash(cargo test:*)',
      'Bash(cargo run:*)',
      'Bash(cargo check)',
      'Bash(cargo fmt)',
      'Bash(cargo clippy:*)',
    ],
    deny: ['Bash(cargo publish:*)', 'Bash(cargo install:*)'],
  },
  go: {
    allow: [
      'Bash(go build:*)',
      'Bash(go test:*)',
      'Bash(go run:*)',
      'Bash(go vet:*)',
      'Bash(go fmt:*)',
      'Bash(gofmt:*)',
    ],
    deny: ['Bash(go get:*)', 'Bash(go install:*)'],
  },
  python: {
    allow: [
      'Bash(python -m:*)',
      'Bash(python3 -m:*)',
      'Bash(pytest:*)',
      'Bash(ruff:*)',
      'Bash(mypy:*)',
      'Bash(uv run:*)',
      'Bash(poetry run:*)',
    ],
    deny: [
      'Bash(pip install:*)',
      'Bash(pip3 install:*)',
      'Bash(uv add:*)',
      'Bash(poetry add:*)',
    ],
  },
};

export function generateSettings(state: WizardState): ClaudeSettings {
  const profile = PROFILES[detectRuntime(state)];
  const deny = [...COMMON_DENY, ...profile.deny];
  if (state.hardenedPermissions) {
    deny.push(...HARDENED_DENY);
  }
  const settings: ClaudeSettings = {
    permissions: {
      allow: [...COMMON_ALLOW, ...profile.allow],
      deny,
    },
  };
  const mcpServers = buildMcpServers(state);
  if (mcpServers) settings.mcpServers = mcpServers;
  return settings;
}

function buildMcpServers(state: WizardState): Record<string, McpServerConfig> | null {
  if (state.mcpServers.length === 0) return null;
  const out: Record<string, McpServerConfig> = {};
  for (const id of state.mcpServers) {
    const server = MCP_SERVERS.find((s) => s.id === id);
    if (server) out[server.key] = server.config;
  }
  return Object.keys(out).length > 0 ? out : null;
}
