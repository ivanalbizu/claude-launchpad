import { describe, expect, it } from 'vitest';
import type { Prompt } from '@/data/prompt.ts';
import { promptToSlashCommand } from './prompt-to-command.service.ts';

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: 'abcd1234-uuid-here-1234-abcdef123456',
    title: 'Mi prompt',
    content: 'contenido del prompt',
    tags: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('promptToSlashCommand', () => {
  it('converts a simple title to a kebab-case slug', () => {
    const result = promptToSlashCommand(makePrompt({ title: 'Refactor utils' }));
    expect(result.slug).toBe('refactor-utils');
    expect(result.label).toBe('/refactor-utils');
  });

  it('strips diacritics', () => {
    const result = promptToSlashCommand(makePrompt({ title: 'Análisis técnico' }));
    expect(result.slug).toBe('analisis-tecnico');
  });

  it('collapses non-alphanumerics into single dashes', () => {
    const result = promptToSlashCommand(makePrompt({ title: 'Hello!!  World__123' }));
    expect(result.slug).toBe('hello-world-123');
  });

  it('trims leading and trailing dashes', () => {
    const result = promptToSlashCommand(makePrompt({ title: '---foo---' }));
    expect(result.slug).toBe('foo');
  });

  it('truncates the slug to 60 characters', () => {
    const longTitle = 'a'.repeat(100);
    const result = promptToSlashCommand(makePrompt({ title: longTitle }));
    expect(result.slug.length).toBeLessThanOrEqual(60);
  });

  it('falls back to the first 8 chars of the id when the title produces an empty slug', () => {
    const result = promptToSlashCommand(makePrompt({ id: 'xxxx-yyyy-zzzz', title: '!!!' }));
    expect(result.slug).toBe('xxxx-yyy');
  });

  it('uses a generic description when the title is whitespace', () => {
    const result = promptToSlashCommand(makePrompt({ title: '   ' }));
    expect(result.description).toBe('Prompt personalizado');
  });

  it('uses the trimmed title as the description otherwise', () => {
    const result = promptToSlashCommand(makePrompt({ title: '  Mi prompt cool  ' }));
    expect(result.description).toBe('Mi prompt cool');
  });

  it('passes the content through untouched', () => {
    const result = promptToSlashCommand(
      makePrompt({ content: 'línea 1\nlínea 2  con  espacios\n' }),
    );
    expect(result.content).toBe('línea 1\nlínea 2  con  espacios\n');
  });
});
