import type { WizardState } from '@/data/wizard-state.ts';

export interface WizardPreset {
  readonly id: string;
  readonly name: string;
  readonly state: WizardState;
  readonly createdAt: number;
  readonly updatedAt: number;
}

const STORAGE_KEY = 'claude-dashboard:wizard-presets';

function loadAll(): WizardPreset[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as WizardPreset[]) : [];
  } catch {
    return [];
  }
}

function saveAll(presets: WizardPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function listPresets(): WizardPreset[] {
  return loadAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function savePreset(name: string, state: WizardState): WizardPreset {
  const presets = loadAll();
  const trimmedName = name.trim();
  const now = Date.now();
  const existing = presets.find((p) => p.name.toLowerCase() === trimmedName.toLowerCase());

  if (existing) {
    const updated: WizardPreset = { ...existing, state, updatedAt: now };
    const next = presets.map((p) => (p.id === existing.id ? updated : p));
    saveAll(next);
    return updated;
  }

  const preset: WizardPreset = {
    id: crypto.randomUUID(),
    name: trimmedName,
    state,
    createdAt: now,
    updatedAt: now,
  };
  saveAll([...presets, preset]);
  return preset;
}

export function deletePreset(id: string): boolean {
  const presets = loadAll();
  const next = presets.filter((p) => p.id !== id);
  if (next.length === presets.length) return false;
  saveAll(next);
  return true;
}
