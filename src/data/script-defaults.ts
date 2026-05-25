import type { ScriptEntry, WizardState } from './wizard-state.ts';

type Runtime = 'node-pnpm' | 'node-npm' | 'bun' | 'deno' | 'python' | 'rust' | 'go';

function detectRuntime(state: WizardState): Runtime {
  const has = (id: string): boolean => state.techStack.includes(id);
  if (has('bun')) return 'bun';
  if (has('deno')) return 'deno';
  if (has('rust')) return 'rust';
  if (has('go')) return 'go';
  if (has('python')) return 'python';
  return 'node-pnpm';
}

const BASE_SCRIPTS: Record<Runtime, readonly ScriptEntry[]> = {
  'node-pnpm': [
    { cmd: 'pnpm dev', description: 'Dev server con HMR' },
    { cmd: 'pnpm build', description: 'Build de producción' },
    { cmd: 'pnpm test', description: 'Tests unitarios' },
    { cmd: 'pnpm lint', description: 'Linter sobre `src/`' },
    { cmd: 'pnpm format', description: 'Formateo con Prettier' },
  ],
  'node-npm': [
    { cmd: 'npm run dev', description: 'Dev server con HMR' },
    { cmd: 'npm run build', description: 'Build de producción' },
    { cmd: 'npm test', description: 'Tests unitarios' },
    { cmd: 'npm run lint', description: 'Linter sobre `src/`' },
  ],
  bun: [
    { cmd: 'bun dev', description: 'Dev server' },
    { cmd: 'bun run build', description: 'Build de producción' },
    { cmd: 'bun test', description: 'Tests unitarios' },
  ],
  deno: [
    { cmd: 'deno task dev', description: 'Dev server' },
    { cmd: 'deno test', description: 'Tests' },
    { cmd: 'deno fmt', description: 'Formateo' },
    { cmd: 'deno lint', description: 'Linter' },
  ],
  python: [
    { cmd: 'pytest', description: 'Tests' },
    { cmd: 'ruff check .', description: 'Linter' },
    { cmd: 'ruff format .', description: 'Formateo' },
    { cmd: 'mypy .', description: 'Type-check' },
  ],
  rust: [
    { cmd: 'cargo run', description: 'Ejecutar binario' },
    { cmd: 'cargo build --release', description: 'Build de producción' },
    { cmd: 'cargo test', description: 'Tests' },
    { cmd: 'cargo fmt', description: 'Formateo' },
    { cmd: 'cargo clippy', description: 'Linter' },
  ],
  go: [
    { cmd: 'go run .', description: 'Ejecutar binario' },
    { cmd: 'go build', description: 'Build de producción' },
    { cmd: 'go test ./...', description: 'Tests' },
    { cmd: 'go vet ./...', description: 'Análisis estático' },
    { cmd: 'go fmt ./...', description: 'Formateo' },
  ],
};

const TYPECHECK_SCRIPT: ScriptEntry = {
  cmd: 'tsc --noEmit',
  description: 'Type-check sin emitir',
};

export function suggestScripts(state: WizardState): readonly ScriptEntry[] {
  const runtime = detectRuntime(state);
  const base = [...BASE_SCRIPTS[runtime]];
  if (state.techStack.includes('typescript') && (runtime === 'node-pnpm' || runtime === 'node-npm')) {
    base.push(TYPECHECK_SCRIPT);
  }
  return base;
}
