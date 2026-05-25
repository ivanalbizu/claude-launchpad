import type { ProjectTypeId } from './project-types.ts';
import type { ConventionCategoryId } from './conventions.ts';
import type { TestType } from './testing-strategies.ts';

export interface ScriptEntry {
  readonly cmd: string;
  readonly description: string;
}

export interface WizardState {
  readonly projectName: string;
  readonly projectType: ProjectTypeId | null;
  readonly techStack: readonly string[];
  readonly conventions: Partial<Record<ConventionCategoryId, string>>;
  readonly testing: {
    readonly frameworks: readonly string[];
    readonly strategies: readonly TestType[];
    readonly coverage: string | null;
  };
  readonly description: string;
  readonly commands: readonly ScriptEntry[];
  readonly restrictions: string;
  readonly commandTemplates: readonly string[];
  readonly customPromptCommands: readonly string[];
  readonly hardenedPermissions: boolean;
  readonly agentTemplates: readonly string[];
  readonly skillTemplates: readonly string[];
  readonly mcpServers: readonly string[];
}

export const INITIAL_WIZARD_STATE: WizardState = {
  projectName: '',
  projectType: null,
  techStack: [],
  conventions: {},
  testing: {
    frameworks: [],
    strategies: [],
    coverage: null,
  },
  description: '',
  commands: [],
  restrictions: '',
  commandTemplates: [],
  customPromptCommands: [],
  hardenedPermissions: false,
  agentTemplates: [],
  skillTemplates: [],
  mcpServers: [],
};
