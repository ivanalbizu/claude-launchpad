import { INITIAL_WIZARD_STATE, type WizardState } from '@/data/wizard-state.ts';

const HASH_PREFIX = 'cfg=';

export async function encodeShareLink(state: WizardState): Promise<string> {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  const compressed = await deflate(bytes);
  return toBase64Url(compressed);
}

export async function decodeShareLink(encoded: string): Promise<WizardState | null> {
  if (!encoded) return null;
  try {
    const compressed = fromBase64Url(encoded);
    const bytes = await inflate(compressed);
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    return normalize(parsed as Partial<WizardState>);
  } catch {
    return null;
  }
}

export function readShareLinkFromHash(hash: string = location.hash): string | null {
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!trimmed.startsWith(HASH_PREFIX)) return null;
  const value = trimmed.slice(HASH_PREFIX.length);
  return value.length > 0 ? value : null;
}

export function buildShareUrl(encoded: string, base: string = location.href): string {
  const url = new URL(base);
  url.hash = `${HASH_PREFIX}${encoded}`;
  return url.toString();
}

export function clearShareLinkHash(): void {
  if (typeof history === 'undefined' || typeof location === 'undefined') return;
  const url = new URL(location.href);
  url.hash = '';
  history.replaceState(null, '', url.toString());
}

function normalize(raw: Partial<WizardState>): WizardState {
  const testing = (raw.testing ?? {}) as Partial<WizardState['testing']>;
  const conventions = (raw.conventions ?? {}) as WizardState['conventions'];
  const commands = Array.isArray(raw.commands)
    ? raw.commands.filter(
        (c): c is WizardState['commands'][number] =>
          c !== null &&
          typeof c === 'object' &&
          typeof (c as { cmd?: unknown }).cmd === 'string' &&
          typeof (c as { description?: unknown }).description === 'string',
      )
    : [];
  return {
    ...INITIAL_WIZARD_STATE,
    ...raw,
    testing: { ...INITIAL_WIZARD_STATE.testing, ...testing },
    conventions: { ...INITIAL_WIZARD_STATE.conventions, ...conventions },
    commands,
  };
}

function toBase64Url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): Uint8Array {
  let s = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (s.length % 4)) % 4;
  s += '='.repeat(pad);
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function deflate(input: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(input)]).stream().pipeThrough(
    new CompressionStream('deflate-raw'),
  );
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function inflate(input: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(input)]).stream().pipeThrough(
    new DecompressionStream('deflate-raw'),
  );
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}
