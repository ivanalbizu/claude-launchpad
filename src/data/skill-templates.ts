export type SkillTemplateId =
  | 'changelog-update'
  | 'release-prep'
  | 'commit-batch'
  | 'codemod'
  | 'api-snapshot';

/**
 * Metadata-only catalog (always in the initial bundle).
 * The heavy fields — `body` and `frontmatterDescription` — live in `skill-bodies.ts`
 * and are loaded on demand via dynamic import.
 */
export interface SkillMetadata {
  readonly id: SkillTemplateId;
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly disableModelInvocation: boolean;
  readonly allowedTools: readonly string[];
  readonly argumentHint?: string;
}

const READ_ONLY: readonly string[] = ['Read', 'Grep', 'Glob', 'Bash'];
const CODE_TOOLS: readonly string[] = ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'Bash'];

export const SKILL_TEMPLATES: readonly SkillMetadata[] = [
  {
    id: 'changelog-update',
    name: 'changelog-update',
    label: 'Changelog update',
    description: 'Genera entradas de CHANGELOG desde commits desde el último tag.',
    disableModelInvocation: false,
    allowedTools: CODE_TOOLS,
  },
  {
    id: 'release-prep',
    name: 'release-prep',
    label: 'Release prep',
    description: 'Prepara un release: bump de versión, changelog, tag (sin publicar).',
    disableModelInvocation: true,
    allowedTools: CODE_TOOLS,
    argumentHint: 'tipo de bump (patch|minor|major) opcional',
  },
  {
    id: 'commit-batch',
    name: 'commit-batch',
    label: 'Commit batch',
    description: 'Divide los cambios staged en commits lógicos con mensajes coherentes.',
    disableModelInvocation: true,
    allowedTools: CODE_TOOLS,
  },
  {
    id: 'codemod',
    name: 'codemod',
    label: 'Codemod',
    description: 'Aplica una transformación de código sistemática en todo el repo.',
    disableModelInvocation: true,
    allowedTools: CODE_TOOLS,
    argumentHint: 'descripción de la transformación',
  },
  {
    id: 'api-snapshot',
    name: 'api-snapshot',
    label: 'API snapshot',
    description: 'Extrae y documenta la API pública de un módulo o paquete.',
    disableModelInvocation: false,
    allowedTools: READ_ONLY,
    argumentHint: 'ruta del módulo o paquete',
  },
];
