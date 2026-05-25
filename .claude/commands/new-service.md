---
description: Scaffold a new service in src/services/
argument-hint: <nombre> (sin sufijo .service)
---

Crea un servicio nuevo en `src/services/<nombre>.service.ts` siguiendo las convenciones del repo. El nombre dado es: **$ARGUMENTS**

### Convenciones

- Fichero: `src/services/<nombre>.service.ts`
- **Funciones puras exportadas**. Sin clases, sin singletons, sin estado mutable a nivel de módulo (salvo constantes).
- Si toca `localStorage`: constante `const STORAGE_KEY = 'claude-dashboard:<scope>';` y manejo defensivo con try/catch.
- Tipos de entrada/salida importados desde [src/data/](src/data/).

### Referencias

- **Servicio con persistencia + CRUD + backup/restore**: [prompts.service.ts](src/services/prompts.service.ts) — patrón completo (loadAll, saveAll, validación con type guards, backup JSON con versión).
- **Servicio sencillo con `localStorage`**: [theme.service.ts](src/services/theme.service.ts) — load/save/apply.
- **Servicio puro sin persistencia**: [tokenizer.service.ts](src/services/tokenizer.service.ts) y [md-generator.service.ts](src/services/md-generator.service.ts).
- **Validación de JSON entrante con type guards**: ver `isPrompt` y `parseAndValidate` en [prompts.service.ts](src/services/prompts.service.ts).

### Reglas que **DEBES** respetar

1. Nada de `class`, `new`, ni estado mutable. Funciones puras.
2. Para `localStorage`: clave con prefijo `claude-dashboard:`. Nunca claves sueltas. Fallback a valor por defecto si el JSON está corrupto.
3. Para JSON externo (import/export): type guards explícitos (`function isFoo(v: unknown): v is Foo`). No confíes en el shape.
4. Imports con alias `@/` (p.ej. `import type { Foo } from '@/data/foo.ts';`).
5. Devuelve `null` o resultados explícitos en operaciones que pueden fallar; no lances excepciones salvo en validación de input de usuario (sigue el patrón de `parseAndValidate`).

### Pasos

1. Pregunta al usuario brevemente:
   - ¿Persiste algo en `localStorage`? Si sí, ¿con qué `scope`?
   - ¿Qué tipo/interfaz maneja? ¿Existe en [src/data/](src/data/)?
   - ¿Operaciones que expone? (CRUD, transformación pura, backup, etc.)

2. Crea el fichero adaptando el patrón más cercano (CRUD persistente, simple persistente, puro).

3. **No** registres el servicio en componentes automáticamente — el usuario decidirá dónde se llama.

4. Recuerda al usuario: `pnpm lint && pnpm build` antes de cerrar.
