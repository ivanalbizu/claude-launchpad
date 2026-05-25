---
description: Scaffold a new wizard step in src/components/wizard/
argument-hint: <slug-corto> (p.ej. "deployment", "linting")
---

Crea un nuevo paso del wizard de generación de `CLAUDE.md` en `src/components/wizard/`. El slug dado es: **$ARGUMENTS**

### Convenciones

- Tag: `cd-step-<slug>`
- Fichero: `src/components/wizard/step-<slug>.ts`
- Clase: `CdStep<PascalCase>`

### Referencias

- **Selección única (radio)**: [step-project-type.ts](src/components/wizard/step-project-type.ts) — patrón con `ProjectTypeChangeEvent` y un único valor seleccionado.
- **Multi-select (checkboxes agrupados)**: [step-stack.ts](src/components/wizard/step-stack.ts) — patrón con `readonly string[]` y `toggle()`.
- **Campos de texto / mixto**: [step-description.ts](src/components/wizard/step-description.ts).
- **Padre** que orquesta el wizard: [project-wizard.ts](src/components/wizard/project-wizard.ts) — ahí es donde se añadirá el nuevo step.

### Reglas que **DEBES** respetar

1. **Componente controlado**: nada de estado interno con `@state()`. El estado vive en el padre. Recibe el valor seleccionado por `@property({ attribute: false })` y emite un `CustomEvent` cuando cambia.
2. Tipa el evento: `export type Step<Slug>ChangeEvent = CustomEvent<TuTipoDeDetail>;`
3. Dispatch con `bubbles: true, composed: true` y `satisfies Step<Slug>ChangeEvent`.
4. Estilos copiados/adaptados de los steps existentes para coherencia visual (uso de `--cd-color-accent`, `--cd-space-*`, `--cd-radius-md`, hover/focus/checked iguales).
5. Declarar el tag en `HTMLElementTagNameMap` y el evento en `HTMLElementEventMap`.
6. Si el step depende de un catálogo, **primero** crea ese catálogo en [src/data/](src/data/) (usa `/new-catalog` o créalo a mano).

### Pasos

1. Pregunta al usuario brevemente:
   - ¿Selección única, múltiple, o input de texto?
   - ¿Qué catálogo de [src/data/](src/data/) usa? ¿Hay que crearlo?
   - ¿Cómo se llama el campo correspondiente en [src/data/wizard-state.ts](src/data/wizard-state.ts)?

2. Crea el fichero `step-<slug>.ts` siguiendo el patrón más cercano (radio / checkbox / texto).

3. Indícale al usuario **qué cambios manuales** debe hacer (no los hagas sin confirmación):
   - Añadir el campo nuevo a `WizardState` en [src/data/wizard-state.ts](src/data/wizard-state.ts).
   - Incluir el nuevo step en el acordeón de [project-wizard.ts](src/components/wizard/project-wizard.ts) (registrar el listener del evento + render).
   - Integrar el nuevo dato en [md-generator.service.ts](src/services/md-generator.service.ts) para que aparezca en el `CLAUDE.md` exportado.

4. Recuerda al usuario verificar con `pnpm lint && pnpm build`.
