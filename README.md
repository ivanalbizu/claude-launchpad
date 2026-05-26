# Claude Launchpad

> Launchpad personal para arrancar proyectos con Claude Code: gestión de prompts reutilizables y generación de ficheros `CLAUDE.md` + carpeta `.claude/` para nuevos proyectos desde cero.

100% cliente, sin backend. Tus prompts y configuración viven en tu navegador.

> ℹ️ **Alcance**: el bundle generado es **solo `.claude/`** (`CLAUDE.md` + `settings.json` + `agents/` + `skills/` + `commands/` + `mcpServers`). No genera `package.json`, `tsconfig.json` ni scaffolding del proyecto — para eso usa el starter de tu framework (Vite, create-next-app, etc.) y añade el bundle encima.

---

## ✨ Qué hace

### Generador de `CLAUDE.md` (Fase 1 ✅)

Wizard con 10 secciones plegables en acordeón:

1. **Tipo de proyecto** — Web app, API REST, librería npm, CLI tool, monorepo, móvil, desktop, extensión VS Code.
2. **Stack tecnológico** — Multi-select agrupado por categoría (lenguaje, runtime, framework frontend/backend, build tool, estilos, ORM, base de datos).
3. **Convenciones** — Estilo de código, naming, estructura de carpetas, workflow git.
4. **Testing** — Estrategia (unit/integration/component/e2e), frameworks (Vitest, Jest, Playwright, Cypress...) y objetivo de cobertura.
5. **Funcionalidad y reglas** — Descripción del proyecto, restricciones que Claude NO debe saltarse, **políticas de seguridad sugeridas** (chips que añaden bloques curados: credenciales, ejecución segura, supply chain, prompt injection, CI/CD) y toggle de **permisos endurecidos** que añade reglas `deny` extra al `settings.json`.
6. **Scripts / comandos del proyecto** — Comandos `pnpm dev`, `pnpm build`, etc., con sugerencias automáticas según el stack.
7. **Sub-agentes** — Catálogo de 6 sub-agentes genéricos (`code-reviewer`, `planner`, `debugger`, `test-writer`, `doc-writer`, `dependency-auditor`) que se bundlean como `.claude/agents/*.md`.
8. **Skills** — Catálogo de 5 skills genéricas (`changelog-update`, `release-prep`, `commit-batch`, `codemod`, `api-snapshot`) que se exportan como `.claude/skills/<name>/SKILL.md`. Cada una marca si Claude la puede auto-invocar o requiere invocación explícita.
9. **MCP servers** — Catálogo de 7 servers MCP populares (`filesystem`, `github`, `git`, `puppeteer`, `memory`, `postgres`, `sequential-thinking`) con su config (`command` + `args` + `env` con referencias `${VAR}`) y notas de setup que viajan al `CLAUDE.md`.
10. **Slash commands** — Plantillas curadas (`/review`, `/plan`, `/test`, `/refactor`, `/debug`, `/doc`, `/security-review`) más tus prompts guardados, todos a `.claude/commands/*.md`.

Botones de **Plantillas** (starter packs con configs prefijadas por tipo de proyecto), **Presets** (guardar/cargar/eliminar configuraciones del wizard, persistidas en `localStorage`) y **Reset** en la toolbar superior.

**Preview en vivo** con dos pestañas: `CLAUDE.md` (renderizado con `marked` + saneado con `DOMPurify`) y `settings.json` (JSON formateado). **Descarga** en dos formatos:

- 📄 `CLAUDE.md` plano
- 📦 `claude-bundle.zip` → carpeta `.claude/` completa con `CLAUDE.md` + `settings.json` + `commands/*.md` + `agents/*.md` + `skills/<name>/SKILL.md`

### Gestor de Prompts (Fase 2 ✅)

- CRUD completo (crear / editar / eliminar / duplicar pendiente).
- **Tags** por prompt (separados por comas).
- **Buscador full-text** sobre título y contenido.
- **Filtro por tags** con chips toggleables (AND).
- **Ordenación**: más recientes / más antiguos / alfabético.
- **Copiar al portapapeles** desde la tarjeta.
- **Estimador de tokens** por prompt (heurística `len/4`).
- Persistencia en `localStorage`. Sin pérdida al recargar.

### Exportación avanzada (Fase 4 ✅)

- ✅ Carpeta `.claude/` zip con CLAUDE.md + settings.json
- ✅ Plantillas de slash commands (`.claude/commands/*.md`)
- ✅ Backup/restore de prompts en JSON (merge o reemplazo total)
- ✅ El estado del wizard se persiste entre recargas

### Seguridad y sub-agentes (Fase 5 ✅)

- ✅ Catálogo de **políticas de seguridad** insertables como bloques de restricciones.
- ✅ Toggle de **permisos endurecidos** en `settings.json` (deny extra contra curl/wget/eval, lectura de .env/SSH/AWS, escritura en CI).
- ✅ Catálogo de **6 sub-agentes** exportables a `.claude/agents/*.md` con frontmatter (`name`, `description`, `model`, `tools`) — Claude los delega automáticamente según la descripción.
- ✅ Preview en vivo del `settings.json` además del `CLAUDE.md`.

### Skills (Fase 6 ✅)

- ✅ Catálogo de **5 skills** exportables a `.claude/skills/<name>/SKILL.md` con frontmatter completo (`name`, `description`, `disable-model-invocation`, `argument-hint`, `allowed-tools`).
- ✅ Skills marcadas como **auto** (Claude las invoca según la descripción) o **manual** (`disable-model-invocation: true`).
- ✅ Soporte de `$ARGUMENTS` en el body con pista visible en el UI.

### MCP servers + URL compartible + optimización de bundle (Fase 7 ✅)

- ✅ Catálogo de **7 MCP servers** populares que se inyectan en el bloque `mcpServers` de `settings.json`. Notas de setup (env vars necesarias, gotchas) se documentan en el `CLAUDE.md` generado.
- ✅ **URL compartible**: botón en la toolbar que codifica el `WizardState` completo en el hash (base64url + deflate-raw) y lo copia al portapapeles. Al abrir una URL compartida, el wizard pregunta antes de sobreescribir.
- ✅ **Split metadata/bodies en agentes y skills**: los textos largos de los system prompts viajan en chunks lazy (`agent-bodies.js`, `skill-bodies.js`) que solo se cargan al expandir el preview o al exportar el zip. Initial bundle bajó de ~239 kB a ~226 kB.

---

## 🚀 Empezar

### Requisitos
- Node.js >= 20
- pnpm >= 9 (este repo usa `pnpm-lock.yaml`; ver [CLAUDE.md](CLAUDE.md) para los motivos)

### Instalación

```bash
pnpm install
pnpm dev
# abre http://localhost:5173/
```

### Scripts

| Script | Acción |
|---|---|
| `pnpm dev` | Dev server con HMR |
| `pnpm build` | Build de producción (tsc + vite build) |
| `pnpm preview` | Previsualizar el build |
| `pnpm test` | Tests unitarios con Vitest |
| `pnpm lint` | ESLint sobre `src/` |
| `pnpm format` | Prettier sobre `src/` |

---

## 🧱 Stack técnico

- **[Lit 3](https://lit.dev/)** + TypeScript + **[Vite](https://vitejs.dev/)** — Web Components, sin VDOM, bundle pequeño.
- **[marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify)** — Preview del markdown saneado.
- **[JSZip](https://stuk.github.io/jszip/)** — Empaquetado de la carpeta `.claude/` (cargado con dynamic import, no entra en el bundle inicial).
- **localStorage** con wrapper tipado para los prompts (filosofía "empezar ligero, escalar cuando duela"; migración a Dexie planeada solo si llegamos a los disparadores documentados en [CLAUDE.md](CLAUDE.md#-consideraciones-futuras-cuándo-escalar-qué)).
- **ESLint 10 + Prettier** — flat config, `typescript-eslint` recommended.

**Bundle de producción:**

| Asset | Tamaño | Gzip | Cuándo se carga |
|---|---|---|---|
| `index.js` (inicial) | ~226 kB | ~58 kB | Carga inicial |
| `jszip.js` | ~96 kB | ~28 kB | Al exportar `.claude/` |
| `agent-bodies.js` | ~8 kB | ~3.5 kB | Al abrir "Ver system prompt" o exportar agentes |
| `skill-bodies.js` | ~7 kB | ~3.3 kB | Al abrir "Ver SKILL.md" o exportar skills |
| `index.css` | ~2.0 kB | ~0.8 kB | Carga inicial |

---

## 📁 Estructura del proyecto

```
claude-launchpad/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── prompts/           # Gestor de prompts (Fase 2)
│   │   │   ├── prompts-view.ts        # contenedor (lista + editor + filtros)
│   │   │   ├── prompt-list.ts         # render de cards
│   │   │   ├── prompt-card.ts         # tarjeta individual + copy
│   │   │   └── prompt-editor.ts       # formulario create/edit
│   │   ├── ui/
│   │   │   ├── app-shell.ts           # nav + view switching + toggle de tema
│   │   │   ├── md-preview.ts          # render markdown saneado
│   │   │   └── token-counter.ts       # contador de tokens reusable
│   │   └── wizard/            # Generador CLAUDE.md (Fase 1 + 5)
│   │       ├── project-wizard.ts      # contenedor (acordeón + preview con tabs)
│   │       ├── step-project-type.ts
│   │       ├── step-stack.ts
│   │       ├── step-conventions.ts
│   │       ├── step-testing.ts
│   │       ├── step-description.ts    # restricciones + políticas + hardened toggle
│   │       ├── step-scripts.ts
│   │       ├── step-agents.ts         # catálogo de sub-agentes
│   │       ├── step-skills.ts         # catálogo de skills (.claude/skills/)
│   │       ├── step-mcp.ts            # catálogo de MCP servers (settings.json/mcpServers)
│   │       └── step-commands.ts       # plantillas de slash commands
│   ├── data/                  # Catálogos estáticos + tipos
│   │   ├── project-types.ts
│   │   ├── tech-stacks.ts
│   │   ├── conventions.ts
│   │   ├── testing-strategies.ts
│   │   ├── command-templates.ts       # plantillas /review, /plan, /test, ...
│   │   ├── agent-templates.ts         # 6 sub-agentes (code-reviewer, planner, ...)
│   │   ├── agent-bodies.ts            # system prompts pesados de los agentes (lazy chunk)
│   │   ├── skill-templates.ts         # 5 skills (changelog-update, codemod, ...)
│   │   ├── skill-bodies.ts            # bodies pesados de las skills (lazy chunk)
│   │   ├── mcp-servers.ts             # 7 MCP servers (filesystem, github, postgres, ...)
│   │   ├── security-policies.ts       # bloques curados de "Do NOT" para restricciones
│   │   ├── starter-packs.ts           # configs prefijadas por tipo de proyecto
│   │   ├── script-defaults.ts         # sugerencias de scripts según stack
│   │   ├── wizard-state.ts            # WizardState + estado inicial
│   │   ├── prompt.ts                  # Prompt + PromptInput
│   │   └── index.ts                   # barrel
│   ├── services/              # Lógica pura, sin componentes
│   │   ├── md-generator.service.ts    # WizardState → markdown
│   │   ├── export.service.ts          # WizardState → .claude/ zip + settings.json
│   │   ├── prompts.service.ts         # CRUD + backup/restore JSON
│   │   ├── prompt-to-command.service.ts # Prompt → slash command file
│   │   ├── share-link.service.ts      # encode/decode WizardState en location.hash
│   │   ├── wizard-state.service.ts    # persiste WizardState en localStorage
│   │   ├── theme.service.ts           # tema (auto/claro/oscuro) + persistencia
│   │   ├── presets.service.ts         # CRUD de presets del wizard
│   │   └── tokenizer.service.ts       # estimador de tokens
│   ├── styles/
│   │   ├── tokens.css                 # CSS vars (colores, spacing, radii)
│   │   └── reset.css                  # reset mínimo moderno
│   └── main.ts                # entrypoint
├── index.html
├── vite.config.ts             # alias @/ → src/
├── tsconfig.json
├── eslint.config.js
├── package.json
└── CLAUDE.md                  # guía para Claude Code en este repo
```

Convenciones:
- Componentes en kebab-case con prefijo `cd-` (histórico — fijado en el primer scaffold).
- Estado en el padre, los pasos del wizard y las cards son "controlled components".
- Servicios en `src/services/*.service.ts`, funciones puras siempre que se pueda.

---

## 🗺️ Roadmap

### ✅ Hecho

- [x] **Fase 1 — Generador CLAUDE.md**: wizard de 8 secciones, preview live con tabs, descarga.
- [x] **Fase 2 — Gestor de prompts**: CRUD + tags + buscador + filtros + sort + copy + tokens.
- [x] **Fase 3 — Tokenizer + UX**: componente `<cd-token-counter>` reusable; toggle manual de tema (Auto / Claro / Oscuro) persistido.
- [x] **Fase 4 — Exportación avanzada**: zip `.claude/` (CLAUDE.md + settings.json + commands/*.md), backup/restore JSON de prompts, persistencia del wizard.
- [x] **Fase 5 — Seguridad + sub-agentes**: políticas insertables, permisos endurecidos, catálogo de sub-agentes a `.claude/agents/`, preview dual CLAUDE.md/settings.json.
- [x] **Fase 6 — Skills**: catálogo de 5 skills genéricas exportables a `.claude/skills/<name>/SKILL.md` con frontmatter (auto/manual, `$ARGUMENTS`, allowed-tools).
- [x] **Fase 7 — MCP + share + bundle**: catálogo de 7 MCP servers en `settings.json`, URL compartible con state en hash, split lazy de bodies pesados.

### 🐛 Conocidos / pulir
- [ ] Sin tests aún (Vitest configurado, pero ningún `*.spec.ts` escrito).
- [ ] Sin E2E (planeado con Playwright si los flujos críticos empiezan a romperse en refactors).

### 🔮 Decisiones diferidas

Documentadas en [CLAUDE.md → Consideraciones futuras](CLAUDE.md#-consideraciones-futuras-cuándo-escalar-qué). Resumen:

| Decisión actual | Migrar a | Disparador |
|---|---|---|
| `Math.ceil(len/4)` para tokens | `js-tiktoken` | Cuando la estimación deje de ser útil o se añadan costes en € |
| `localStorage` | Dexie / IndexedDB | > 500 prompts, > 3 MB, o queries full-text complejas |
| Sin router | `@lit-labs/router` | > 4 vistas o necesidad de URLs compartibles |

---

## 📄 Licencia

MIT — uso personal/libre.
