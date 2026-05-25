# Claude Launchpad

SPA cliente (Lit 3 + TS + Vite) para gestionar prompts y generar `CLAUDE.md` / `.claude/`. Sin backend, sin estado global mutable fuera de `localStorage`.

Descripción completa del producto, fases y disparadores de migración: [README.md](README.md).

## Stack

- Lit 3, TypeScript, Vite, pnpm.
- `marked` + `DOMPurify` para preview de Markdown.
- `JSZip` (dynamic import, lazy) para empaquetar `.claude/`.
- `localStorage` con wrappers tipados por servicio. **No Dexie todavía** — migrar solo si se cumplen los disparadores del README.

## Convenciones

**Componentes** (`src/components/`)
- Web Components con `@customElement('cd-...')`, prefijo **`cd-`** siempre.
- Un componente por fichero, mismo nombre que el tag (`cd-step-foo` → `step-foo.ts`).
- Estilos dentro del componente con `css` tagged template, usando las CSS vars de [src/styles/tokens.css](src/styles/tokens.css) (`--cd-color-*`, `--cd-space-*`, `--cd-radius-*`, `--cd-font-size-*`). **Nunca** colores/medidas hardcodeadas.
- Imports con alias `@/` (configurado en [vite.config.ts](vite.config.ts) y [tsconfig.json](tsconfig.json)).
- Declarar tipos en `HTMLElementTagNameMap` y, si dispara eventos, en `HTMLElementEventMap`.
- **Componentes controlados**: el estado vive en el padre. Los hijos reciben `@property({ attribute: false })` y emiten `CustomEvent` con `bubbles: true, composed: true`.
- Tipar los eventos con `CustomEvent<Detail>` exportado, p.ej. `export type FooChangeEvent = CustomEvent<FooId>;`.

**Servicios** (`src/services/*.service.ts`)
- Funciones puras exportadas, sin clases ni singletons.
- Si tocan `localStorage`, mantener una constante `STORAGE_KEY = 'claude-dashboard:<scope>'`.
- Manejar JSON corrupto con try/catch + fallback a valor por defecto (ver [prompts.service.ts](src/services/prompts.service.ts) como referencia).

**Catálogos** (`src/data/`)
- Ficheros `.ts` con `export type FooId = '...' | '...'`, `export interface Foo { ... }`, `export const FOOS: readonly Foo[] = [...]`.
- Re-export desde [src/data/index.ts](src/data/index.ts).
- Los `readonly` no son negociables — los catálogos son inmutables en runtime.

**Tests**: Vitest configurado pero aún sin specs. Cuando escribas uno, `*.spec.ts` junto al fichero a testear.

## Comandos

- `pnpm dev` — dev server (http://localhost:5173)
- `pnpm build` — `tsc && vite build`
- `pnpm test` — Vitest
- `pnpm lint` — ESLint sobre `src/`
- `pnpm format` — Prettier

## Slash commands del repo

En [.claude/commands/](.claude/commands/):
- `/new-component <nombre>` — Lit component nuevo en `src/components/ui/`.
- `/new-wizard-step <slug>` — paso del wizard en `src/components/wizard/` (controlled, con evento).
- `/new-service <nombre>` — servicio en `src/services/`.
- `/new-catalog <nombre>` — catálogo estático en `src/data/`.

## Restricciones

- No introducir frameworks UI adicionales (React, Vue, Svelte...). Solo Lit.
- No añadir Dexie / IndexedDB sin disparador documentado en el README. `localStorage` con wrapper basta.
- No usar `FileSaver.js`, `axios`, ni similares cuando hay equivalente nativo (`Blob` + `<a download>`, `fetch`).
- No commitear con `pnpm lint` o `pnpm build` en rojo.
- No instalar dependencias nuevas sin preguntar. Justificar el coste de bundle.
- No tocar `pnpm-lock.yaml` a mano.
- Persistencia con prefijo `claude-dashboard:` en `localStorage`. Nunca claves sueltas.
