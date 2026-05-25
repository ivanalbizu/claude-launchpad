import type { ClaudeModelAlias } from './command-templates.ts';

export type AgentTemplateId =
  | 'code-reviewer'
  | 'planner'
  | 'debugger'
  | 'test-writer'
  | 'doc-writer'
  | 'dependency-auditor';

/**
 * Metadata-only catalog (always in the initial bundle).
 * The heavy fields — `body` and `frontmatterDescription` — live in `agent-bodies.ts`
 * and are loaded on demand via dynamic import.
 */
export interface AgentMetadata {
  readonly id: AgentTemplateId;
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly model?: ClaudeModelAlias;
  readonly tools?: readonly string[];
}

const READ_ONLY_TOOLS: readonly string[] = ['Read', 'Grep', 'Glob', 'Bash'];
const FULL_CODE_TOOLS: readonly string[] = ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash'];

export const AGENT_TEMPLATES: readonly AgentMetadata[] = [
  {
    id: 'code-reviewer',
    name: 'code-reviewer',
    label: 'Code reviewer',
    description: 'Revisa cambios pendientes en el branch sin tocar código.',
    model: 'sonnet',
    tools: READ_ONLY_TOOLS,
  },
  {
    id: 'planner',
    name: 'planner',
    label: 'Planner',
    description: 'Produce planes detallados antes de implementar tareas no triviales.',
    model: 'opus',
    tools: READ_ONLY_TOOLS,
  },
  {
    id: 'debugger',
    name: 'debugger',
    label: 'Debugger',
    description: 'Diagnostica un fallo siguiendo hipótesis → experimento antes de tocar código.',
    model: 'sonnet',
    tools: READ_ONLY_TOOLS,
  },
  {
    id: 'test-writer',
    name: 'test-writer',
    label: 'Test writer',
    description: 'Escribe tests siguiendo el framework y convenciones del proyecto.',
    model: 'sonnet',
    tools: FULL_CODE_TOOLS,
  },
  {
    id: 'doc-writer',
    name: 'doc-writer',
    label: 'Doc writer',
    description: 'Genera documentación concisa para APIs, módulos o features.',
    model: 'sonnet',
    tools: FULL_CODE_TOOLS,
  },
  {
    id: 'dependency-auditor',
    name: 'dependency-auditor',
    label: 'Dependency auditor',
    description: 'Audita dependencias del proyecto: obsoletas, abandonadas o de riesgo.',
    model: 'sonnet',
    tools: READ_ONLY_TOOLS,
  },
];
