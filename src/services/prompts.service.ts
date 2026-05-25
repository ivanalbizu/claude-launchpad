import type { Prompt, PromptInput } from '@/data/prompt.ts';

const STORAGE_KEY = 'claude-dashboard:prompts';

function loadAll(): Prompt[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Prompt[]) : [];
  } catch {
    return [];
  }
}

function saveAll(prompts: Prompt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

function newId(): string {
  return crypto.randomUUID();
}

export function listPrompts(): Prompt[] {
  return loadAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getPrompt(id: string): Prompt | null {
  return loadAll().find((p) => p.id === id) ?? null;
}

export function createPrompt(input: PromptInput): Prompt {
  const now = Date.now();
  const prompt: Prompt = {
    id: newId(),
    title: input.title.trim(),
    content: input.content,
    tags: dedupeTags(input.tags),
    createdAt: now,
    updatedAt: now,
  };
  const prompts = loadAll();
  prompts.push(prompt);
  saveAll(prompts);
  return prompt;
}

export function updatePrompt(id: string, input: PromptInput): Prompt | null {
  const prompts = loadAll();
  const index = prompts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const existing = prompts[index];
  const updated: Prompt = {
    ...existing,
    title: input.title.trim(),
    content: input.content,
    tags: dedupeTags(input.tags),
    updatedAt: Date.now(),
  };
  prompts[index] = updated;
  saveAll(prompts);
  return updated;
}

export function deletePrompt(id: string): boolean {
  const prompts = loadAll();
  const next = prompts.filter((p) => p.id !== id);
  if (next.length === prompts.length) return false;
  saveAll(next);
  return true;
}

function dedupeTags(tags: readonly string[]): readonly string[] {
  const cleaned = tags.map((t) => t.trim()).filter((t) => t.length > 0);
  return Array.from(new Set(cleaned));
}

const BACKUP_VERSION = 1;

interface PromptsBackup {
  version: number;
  exportedAt: string;
  prompts: Prompt[];
}

export function exportPromptsJson(): string {
  const payload: PromptsBackup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    prompts: loadAll(),
  };
  return JSON.stringify(payload, null, 2);
}

export type ImportStrategy = 'merge' | 'replace';

export interface ImportResult {
  total: number;
  added: number;
  skipped: number;
}

export function previewImport(json: string): { count: number } {
  const prompts = parseAndValidate(json);
  return { count: prompts.length };
}

export function importPromptsJson(json: string, strategy: ImportStrategy): ImportResult {
  const incoming = parseAndValidate(json);
  if (strategy === 'replace') {
    saveAll(incoming);
    return { total: incoming.length, added: incoming.length, skipped: 0 };
  }
  const existing = loadAll();
  const existingIds = new Set(existing.map((p) => p.id));
  const newOnes = incoming.filter((p) => !existingIds.has(p.id));
  saveAll([...existing, ...newOnes]);
  return {
    total: incoming.length,
    added: newOnes.length,
    skipped: incoming.length - newOnes.length,
  };
}

function parseAndValidate(json: string): Prompt[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('El fichero no es JSON válido.');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('El fichero no tiene el formato esperado.');
  }
  const obj = parsed as { prompts?: unknown };
  if (!Array.isArray(obj.prompts)) {
    throw new Error('Falta el array "prompts" en el fichero.');
  }
  return obj.prompts.filter(isPrompt);
}

function isPrompt(value: unknown): value is Prompt {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.content === 'string' &&
    Array.isArray(p.tags) &&
    p.tags.every((t) => typeof t === 'string') &&
    typeof p.createdAt === 'number' &&
    typeof p.updatedAt === 'number'
  );
}
