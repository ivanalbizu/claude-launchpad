import { describe, expect, it } from 'vitest';
import { INITIAL_WIZARD_STATE, type WizardState } from '@/data/wizard-state.ts';
import {
  buildShareUrl,
  decodeShareLink,
  encodeShareLink,
  readShareLinkFromHash,
} from './share-link.service.ts';

function makeState(overrides: Partial<WizardState> = {}): WizardState {
  return { ...INITIAL_WIZARD_STATE, ...overrides };
}

describe('share-link round-trip', () => {
  it('encodes then decodes the initial state losslessly', async () => {
    const encoded = await encodeShareLink(INITIAL_WIZARD_STATE);
    const decoded = await decodeShareLink(encoded);
    expect(decoded).toEqual(INITIAL_WIZARD_STATE);
  });

  it('encodes then decodes a fully populated state losslessly', async () => {
    const state = makeState({
      projectName: 'demo',
      projectType: 'web-app',
      techStack: ['typescript', 'lit', 'vite'],
      conventions: { 'code-style': 'prettier-eslint', naming: 'kebab-case-files' },
      testing: { frameworks: ['vitest'], strategies: ['unit'], coverage: 'standard' },
      description: 'Descripción del proyecto\ncon saltos de línea',
      commands: [
        { cmd: 'pnpm dev', description: 'Dev' },
        { cmd: 'pnpm build', description: 'Build' },
      ],
      restrictions: '- No hacer X\n- No hacer Y',
      commandTemplates: ['review', 'plan'],
      customPromptCommands: ['some-id'],
      hardenedPermissions: true,
      agentTemplates: ['code-reviewer', 'planner'],
      skillTemplates: ['changelog-update'],
      mcpServers: ['github', 'filesystem'],
    });
    const encoded = await encodeShareLink(state);
    const decoded = await decodeShareLink(encoded);
    expect(decoded).toEqual(state);
  });

  it('produces a URL-safe payload (no +, /, = chars)', async () => {
    const encoded = await encodeShareLink(INITIAL_WIZARD_STATE);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it('keeps a populated state under 2000 chars (URL-safe limit)', async () => {
    const state = makeState({
      projectName: 'demo',
      techStack: ['typescript', 'lit', 'vite', 'css-vars', 'node'],
      commands: Array.from({ length: 10 }, (_, i) => ({
        cmd: `pnpm task${i}`,
        description: `Tarea ${i}`,
      })),
      restrictions: 'a'.repeat(200),
      agentTemplates: ['code-reviewer', 'planner', 'debugger', 'test-writer'],
      skillTemplates: ['changelog-update', 'commit-batch', 'codemod'],
    });
    const encoded = await encodeShareLink(state);
    expect(encoded.length).toBeLessThan(2000);
  });
});

describe('decodeShareLink', () => {
  it('returns null for an empty string', async () => {
    expect(await decodeShareLink('')).toBeNull();
  });

  it('returns null for invalid base64', async () => {
    expect(await decodeShareLink('not%%base64')).toBeNull();
  });

  it('returns null when the decompressed bytes are not valid JSON', async () => {
    // valid base64 of "hello" — won't inflate as deflate-raw
    expect(await decodeShareLink('aGVsbG8')).toBeNull();
  });

  it('fills missing keys from INITIAL_WIZARD_STATE (forward-compat)', async () => {
    const partial = { projectName: 'only-this' };
    const json = JSON.stringify(partial);
    const compressed = await deflateRaw(new TextEncoder().encode(json));
    const encoded = toBase64Url(compressed);
    const decoded = await decodeShareLink(encoded);
    expect(decoded?.projectName).toBe('only-this');
    expect(decoded?.techStack).toEqual([]);
    expect(decoded?.hardenedPermissions).toBe(false);
    expect(decoded?.agentTemplates).toEqual([]);
    expect(decoded?.skillTemplates).toEqual([]);
    expect(decoded?.mcpServers).toEqual([]);
  });
});

describe('readShareLinkFromHash', () => {
  it('extracts the cfg= value from a hash', () => {
    expect(readShareLinkFromHash('#cfg=abc123')).toBe('abc123');
  });

  it('accepts a hash without the leading #', () => {
    expect(readShareLinkFromHash('cfg=abc123')).toBe('abc123');
  });

  it('returns null when the prefix is missing', () => {
    expect(readShareLinkFromHash('#other=xyz')).toBeNull();
    expect(readShareLinkFromHash('')).toBeNull();
  });

  it('returns null when cfg= has no value', () => {
    expect(readShareLinkFromHash('#cfg=')).toBeNull();
  });
});

describe('buildShareUrl', () => {
  it('appends the cfg= prefix to the URL hash', () => {
    const url = buildShareUrl('abc123', 'https://example.com/path');
    expect(url).toBe('https://example.com/path#cfg=abc123');
  });

  it('overwrites any pre-existing hash', () => {
    const url = buildShareUrl('new', 'https://example.com/#cfg=old');
    expect(url).toBe('https://example.com/#cfg=new');
  });
});

// helpers mirroring the service for the forward-compat test
async function deflateRaw(input: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(input)]).stream().pipeThrough(
    new CompressionStream('deflate-raw'),
  );
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function toBase64Url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
