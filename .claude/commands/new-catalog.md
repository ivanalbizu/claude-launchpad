---
description: Scaffold a new static catalog in src/data/
argument-hint: <nombre-singular> (p.ej. "deployment-target", "linter")
---

Crea un catálogo estático en `src/data/<nombre>.ts` siguiendo las convenciones del repo. El nombre dado es: **$ARGUMENTS**

### Convenciones

- Fichero: `src/data/<nombre-en-kebab>.ts` (en plural si el contenido es una lista de elementos, p.ej. `project-types.ts`, `tech-stacks.ts`).
- Exporta **tres** cosas:
  1. `export type FooId = 'a' | 'b' | 'c';` — union de literales para autocompletado y exhaustividad.
  2. `export interface Foo { readonly id: FooId; readonly label: string; readonly description?: string; ... }` — todas las props `readonly`.
  3. `export const FOOS: readonly Foo[] = [ ... ];` — el array, también `readonly`.

### Referencias

- **Catálogo plano**: [project-types.ts](src/data/project-types.ts) — patrón mínimo (id + label + description).
- **Catálogo agrupado por categoría**: [tech-stacks.ts](src/data/tech-stacks.ts) — incluye además un array de categorías exportado por separado.
- **Barrel**: [src/data/index.ts](src/data/index.ts) — todos los catálogos se re-exportan aquí.

### Reglas que **DEBES** respetar

1. **`readonly` en todo**: tipos, propiedades, arrays. Los catálogos son inmutables en runtime.
2. Una vez creado, **añade el re-export** en [src/data/index.ts](src/data/index.ts).
3. Los textos en castellano (descripciones de UI), coherentes con el resto.
4. **No** dupliques ids dentro del array.
5. Si el catálogo se agrupa por categoría, define también el array de categorías como `export const FOO_CATEGORIES: readonly { id: FooCategory; label: string }[] = [...]` (sigue [tech-stacks.ts](src/data/tech-stacks.ts)).

### Pasos

1. Pregunta al usuario brevemente:
   - ¿Qué propiedades tiene cada entrada además de `id` y `label`?
   - ¿Está agrupado por categoría?
   - Dame los items iniciales (id + label), o propónlos basándote en el nombre.

2. Crea el fichero y **añade el re-export** en [src/data/index.ts](src/data/index.ts).

3. Si el catálogo es para un nuevo step del wizard:
   - Sugiere usar `/new-wizard-step <slug>` a continuación.
   - Recuerda al usuario actualizar `WizardState` en [src/data/wizard-state.ts](src/data/wizard-state.ts) y el generador en [md-generator.service.ts](src/services/md-generator.service.ts).

4. Recuerda al usuario verificar con `pnpm lint && pnpm build`.
