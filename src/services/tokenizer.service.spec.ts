import { describe, expect, it } from 'vitest';
import { estimateTokens } from './tokenizer.service.ts';

describe('estimateTokens', () => {
  it('returns 0 for an empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('returns 1 for exactly 4 characters', () => {
    expect(estimateTokens('abcd')).toBe(1);
  });

  it('rounds up for partial tokens', () => {
    expect(estimateTokens('abcde')).toBe(2);
    expect(estimateTokens('a')).toBe(1);
  });

  it('scales linearly with length', () => {
    expect(estimateTokens('a'.repeat(40))).toBe(10);
    expect(estimateTokens('a'.repeat(41))).toBe(11);
  });

  it('counts multibyte characters by code units, not bytes', () => {
    expect(estimateTokens('💯')).toBe(estimateTokens('ab'));
  });
});
