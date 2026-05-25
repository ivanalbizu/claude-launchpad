import type { WizardState } from './wizard-state.ts';

export interface StarterPack {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly state: Partial<WizardState>;
}

export const STARTER_PACKS: readonly StarterPack[] = [
  {
    id: 'lit-vite-ts',
    name: 'Lit + Vite + TypeScript',
    description: 'SPA cliente con Web Components, sin VDOM, bundle pequeño.',
    state: {
      projectType: 'web-app',
      techStack: ['typescript', 'node', 'lit', 'vite', 'css-vars'],
      conventions: {
        'code-style': 'prettier-eslint',
        naming: 'kebab-case-files',
        'folder-structure': 'type-based',
        'git-workflow': 'github-flow',
      },
      testing: {
        frameworks: ['vitest'],
        strategies: ['unit', 'component'],
        coverage: 'standard',
      },
      description: 'SPA cliente construida con Web Components (Lit).',
      commands: [
        { cmd: 'pnpm dev', description: 'Dev server con HMR' },
        { cmd: 'pnpm build', description: 'Build de producción' },
        { cmd: 'pnpm test', description: 'Tests unitarios con Vitest' },
        { cmd: 'pnpm lint', description: 'ESLint sobre `src/`' },
        { cmd: 'pnpm format', description: 'Formateo con Prettier' },
        { cmd: 'tsc --noEmit', description: 'Type-check sin emitir' },
      ],
      restrictions: [
        '- No introducir otros frameworks UI (React, Vue, Svelte). Solo Lit.',
        '- No instalar dependencias nuevas sin justificar coste de bundle.',
        '- No commitear con lint o build en rojo.',
      ].join('\n'),
      commandTemplates: ['review', 'plan', 'test', 'security-review'],
      agentTemplates: ['code-reviewer', 'planner', 'test-writer'],
      skillTemplates: ['codemod', 'commit-batch'],
    },
  },
  {
    id: 'nextjs-app-router',
    name: 'Next.js App Router',
    description: 'Aplicación full-stack con App Router, TypeScript y Tailwind.',
    state: {
      projectType: 'web-app',
      techStack: ['typescript', 'node', 'nextjs', 'react', 'tailwind'],
      conventions: {
        'code-style': 'prettier-eslint',
        naming: 'camel-case',
        'folder-structure': 'feature-based',
        'git-workflow': 'github-flow',
      },
      testing: {
        frameworks: ['vitest', 'playwright'],
        strategies: ['unit', 'e2e'],
        coverage: 'low',
      },
      description: 'Aplicación full-stack con Next.js App Router.',
      commands: [
        { cmd: 'pnpm dev', description: 'Dev server (Turbopack)' },
        { cmd: 'pnpm build', description: 'Build de producción' },
        { cmd: 'pnpm start', description: 'Servir el build en local' },
        { cmd: 'pnpm test', description: 'Tests unitarios con Vitest' },
        { cmd: 'pnpm test:e2e', description: 'Tests E2E con Playwright' },
        { cmd: 'pnpm lint', description: 'next lint' },
      ],
      restrictions: [
        '- Server Components por defecto; usar `"use client"` solo si es necesario (state, efectos, event handlers).',
        '- No mezclar fetching client-side + server-side para los mismos datos.',
        '- No instalar dependencias sin preguntar.',
      ].join('\n'),
      commandTemplates: ['review', 'plan', 'test', 'refactor', 'security-review'],
      agentTemplates: ['code-reviewer', 'planner', 'test-writer', 'debugger'],
      skillTemplates: ['codemod', 'commit-batch'],
    },
  },
  {
    id: 'nestjs-postgres',
    name: 'NestJS + Postgres + Prisma',
    description: 'API REST con NestJS, Prisma y PostgreSQL.',
    state: {
      projectType: 'api-rest',
      techStack: ['typescript', 'node', 'nestjs', 'prisma', 'postgresql'],
      conventions: {
        'code-style': 'prettier-eslint',
        naming: 'camel-case',
        'folder-structure': 'hexagonal',
        'git-workflow': 'github-flow',
      },
      testing: {
        frameworks: ['jest', 'supertest'],
        strategies: ['unit', 'integration'],
        coverage: 'standard',
      },
      description: 'API REST con NestJS, Prisma y PostgreSQL.',
      commands: [
        { cmd: 'pnpm start:dev', description: 'Dev server con watch mode' },
        { cmd: 'pnpm build', description: 'Build de producción' },
        { cmd: 'pnpm test', description: 'Tests unitarios con Jest' },
        { cmd: 'pnpm test:e2e', description: 'Tests E2E (Supertest)' },
        { cmd: 'pnpm lint', description: 'ESLint sobre `src/`' },
        { cmd: 'pnpm prisma migrate dev', description: 'Aplicar migraciones en dev' },
      ],
      restrictions: [
        '- Inyección de dependencias siempre por constructor; usar `@Inject()` solo si no hay alternativa.',
        '- No exponer entidades de Prisma directamente en endpoints. Pasar por DTOs.',
        '- Migraciones de schema solo con `prisma migrate`. Nunca tocar la DB de producción a mano.',
        '- No commitear con tests en rojo.',
      ].join('\n'),
      commandTemplates: ['review', 'plan', 'test', 'security-review'],
      agentTemplates: ['code-reviewer', 'planner', 'test-writer', 'dependency-auditor'],
      skillTemplates: ['api-snapshot', 'commit-batch'],
    },
  },
  {
    id: 'fastapi-python',
    name: 'FastAPI + Python',
    description: 'API REST con FastAPI, Pydantic y PostgreSQL.',
    state: {
      projectType: 'api-rest',
      techStack: ['python', 'fastapi', 'postgresql'],
      conventions: {
        'code-style': 'custom',
        naming: 'snake-case',
        'folder-structure': 'hexagonal',
        'git-workflow': 'github-flow',
      },
      testing: {
        frameworks: [],
        strategies: ['unit', 'integration'],
        coverage: 'standard',
      },
      description: 'API REST con FastAPI y PostgreSQL.',
      commands: [
        { cmd: 'uvicorn app.main:app --reload', description: 'Dev server con autoreload' },
        { cmd: 'pytest', description: 'Tests' },
        { cmd: 'ruff check .', description: 'Linter' },
        { cmd: 'ruff format .', description: 'Formateo' },
        { cmd: 'mypy .', description: 'Type-check estricto' },
      ],
      restrictions: [
        '- Todo input/output a través de Pydantic models. Sin dicts crudos en endpoints.',
        '- Handlers `async`; no mezclar IO síncrono dentro de funciones async.',
        '- No commits sin `pytest` verde y `ruff check` limpio.',
      ].join('\n'),
      commandTemplates: ['review', 'plan', 'test', 'security-review'],
      agentTemplates: ['code-reviewer', 'planner', 'test-writer', 'debugger'],
      skillTemplates: ['api-snapshot', 'commit-batch'],
    },
  },
  {
    id: 'cli-node',
    name: 'CLI Node + TypeScript',
    description: 'Herramienta de línea de comandos publicable como binario npm.',
    state: {
      projectType: 'cli-tool',
      techStack: ['typescript', 'node', 'tsup'],
      conventions: {
        'code-style': 'prettier-eslint',
        naming: 'camel-case',
        'folder-structure': 'flat',
        'git-workflow': 'github-flow',
      },
      testing: {
        frameworks: ['vitest'],
        strategies: ['unit'],
        coverage: 'low',
      },
      description: 'CLI publicable como binario npm.',
      commands: [
        { cmd: 'pnpm dev', description: 'Ejecutar el CLI en modo desarrollo' },
        { cmd: 'pnpm build', description: 'Build con tsup (esm + cjs + dts)' },
        { cmd: 'pnpm test', description: 'Tests unitarios con Vitest' },
        { cmd: 'pnpm lint', description: 'ESLint sobre `src/`' },
      ],
      restrictions: [
        '- Sin dependencias pesadas en `dependencies` — todo lo grande va en `devDependencies` y se bundlea.',
        '- Flags y argumentos siempre con `--help` documentado.',
        '- No publicar a npm sin pasar `pnpm test` y `pnpm build`.',
      ].join('\n'),
      commandTemplates: ['review', 'plan', 'test', 'doc'],
      agentTemplates: ['code-reviewer', 'planner', 'doc-writer'],
      skillTemplates: ['changelog-update', 'release-prep'],
    },
  },
];
