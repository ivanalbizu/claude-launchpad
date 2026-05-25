import { INITIAL_WIZARD_STATE, type ScriptEntry, type WizardState } from '@/data/wizard-state.ts';

const STORAGE_KEY = 'claude-dashboard:wizard-state';

export function saveWizardState(state: WizardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadWizardState(): WizardState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return INITIAL_WIZARD_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<WizardState> & {
      testing?: Partial<WizardState['testing']>;
      conventions?: WizardState['conventions'];
      commands?: unknown;
    };
    return {
      ...INITIAL_WIZARD_STATE,
      ...parsed,
      testing: { ...INITIAL_WIZARD_STATE.testing, ...(parsed.testing ?? {}) },
      conventions: { ...INITIAL_WIZARD_STATE.conventions, ...(parsed.conventions ?? {}) },
      commands: normalizeCommands(parsed.commands),
    };
  } catch {
    return INITIAL_WIZARD_STATE;
  }
}

export function clearWizardState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function normalizeCommands(raw: unknown): readonly ScriptEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is ScriptEntry =>
      entry !== null &&
      typeof entry === 'object' &&
      typeof (entry as ScriptEntry).cmd === 'string' &&
      typeof (entry as ScriptEntry).description === 'string',
  );
}
