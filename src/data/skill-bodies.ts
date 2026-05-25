import type { SkillTemplateId } from './skill-templates.ts';

export interface SkillBody {
  readonly frontmatterDescription: string;
  readonly body: string;
}

/**
 * Heavy content for skills — loaded on demand via dynamic import.
 * Do NOT import this file statically; use `await import('@/data/skill-bodies.ts')`.
 */
export const SKILL_BODIES: Readonly<Record<SkillTemplateId, SkillBody>> = {
  'changelog-update': {
    frontmatterDescription:
      'Actualiza el CHANGELOG.md del proyecto a partir de los commits desde el último tag, ' +
      'agrupados por tipo (feat/fix/perf/refactor/docs/chore). Triggers: "actualiza el changelog", ' +
      '"añade las novedades al CHANGELOG", "qué ha cambiado desde el último release".',
    body: `# Actualizar CHANGELOG

Actualiza el \`CHANGELOG.md\` con los cambios desde el último release.

## Pasos

1. Detecta el último tag: \`git describe --tags --abbrev=0\` (si no hay tags, usa el primer commit).
2. Lista los commits desde ese tag: \`git log <tag>..HEAD --pretty=format:'%h %s'\`.
3. Agrupa por convenio (conventional commits si se usa, si no por palabras clave):
   - **Added** — feat, add
   - **Changed** — change, update, refactor
   - **Fixed** — fix, bug
   - **Deprecated** — deprecate
   - **Removed** — remove, delete
   - **Security** — security, cve
4. Si el CHANGELOG sigue [Keep a Changelog](https://keepachangelog.com/), respeta su formato exacto.
5. Añade una nueva entrada bajo la próxima versión propuesta (o bajo \`[Unreleased]\` si no hay
   versión decidida).

## Reglas

- No inventes cambios. Si un commit es ambiguo, déjalo bajo "Changed" o pregunta.
- Squashes y merges se agrupan por su PR si está en el mensaje.
- No reescribas entradas anteriores del CHANGELOG.
`,
  },
  'release-prep': {
    frontmatterDescription:
      'Prepara un release del proyecto: decide el bump (semver), actualiza el changelog y crea el ' +
      'commit + tag local. NO publica ni hace push. Triggers: "prepara la release", "vamos a sacar ' +
      'versión nueva", "bump de versión".',
    body: `# Preparar release

Prepara un release local. **NO publica, no hace push.**

Tipo de bump: $ARGUMENTS

## Pasos

1. Verifica el estado del repo: \`git status\` debe estar limpio. Si no lo está, para y avisa.
2. Lee el manifest del proyecto para conocer la versión actual:
   - JS/TS → \`package.json\`
   - Python → \`pyproject.toml\` o \`setup.cfg\`
   - Rust → \`Cargo.toml\`
   - Go → \`go.mod\` (sin versión interna) → usa tag de git
3. Si \`$ARGUMENTS\` está vacío, analiza los commits desde el último tag y propón un bump
   (patch/minor/major) según los tipos de cambios. Espera confirmación.
4. Actualiza la versión en el manifest y en el lockfile si aplica.
5. Si hay \`CHANGELOG.md\`, mueve el contenido de \`[Unreleased]\` a la nueva versión con la fecha.
6. Crea un commit \`chore(release): vX.Y.Z\` y el tag local \`vX.Y.Z\`.
7. Muestra el plan de comandos para publicar (\`git push --follow-tags\`, \`pnpm publish\`, etc.),
   pero **no los ejecutes**.

## Reglas

- Versión vista en el manifest manda sobre el último tag si discrepan: avisa pero usa el manifest.
- No tocar lockfiles a mano más allá del bump de versión del propio paquete.
`,
  },
  'commit-batch': {
    frontmatterDescription:
      'Analiza los cambios staged (y unstaged si conviene) y los divide en una serie de commits ' +
      'coherentes, cada uno con un mensaje claro. Útil cuando tienes un working tree desordenado ' +
      'antes de abrir PR. Triggers: "divide esto en commits", "separa estos cambios en commits ' +
      'lógicos", "commit batch".',
    body: `# Commit batch

Toma los cambios pendientes y los divide en una serie de commits coherentes.

## Pasos

1. Inspecciona el estado actual: \`git status\` y \`git diff\` (staged + unstaged).
2. Agrupa los hunks por **propósito**, no por fichero. Ejemplo de grupos: "refactor del módulo X",
   "nueva feature Y", "fix del bug Z", "tests añadidos", "docs actualizados".
3. Para cada grupo, propón un mensaje siguiendo el estilo del repo (mira \`git log --oneline -20\`
   para detectarlo). Si el repo usa conventional commits, respétalo.
4. Presenta el plan: lista de commits propuestos con su descripción y los ficheros/hunks que
   incluiría cada uno. **Espera confirmación.**
5. Tras OK: usa \`git reset\` para limpiar el staging y va commit a commit con \`git add -p\` o
   \`git add <fichero>\` según el grano necesario.

## Reglas

- Cada commit debe **compilar y pasar tests** por sí solo si el repo es bisectable.
- No mezcles cambios funcionales con reformateos masivos: separa en commits distintos.
- Si dudas sobre cómo agrupar, pregunta antes de empezar a commitear.
- No hagas push automáticamente.
`,
  },
  codemod: {
    frontmatterDescription:
      'Aplica un cambio repetitivo a través del codebase: renombrar APIs, migrar patrones, ' +
      'actualizar imports, etc. Trabaja en plan dry-run antes de tocar nada. Triggers: ' +
      '"renombra X a Y en todo el repo", "migra estos imports", "codemod", "transformación masiva".',
    body: `# Codemod

Aplica esta transformación a todo el codebase: $ARGUMENTS

## Pasos

1. Si la descripción es ambigua, **pregunta** antes de tocar nada (qué ficheros entran, qué casos
   límite considerar, qué hacer con tests).
2. **Dry-run primero.** Usa \`Grep\` para listar todas las ocurrencias afectadas. Cuenta cuántos
   ficheros y cuántas líneas se van a tocar.
3. Presenta el plan: muestra 2-3 ejemplos del cambio (antes/después) y el total de afectados.
   **Espera confirmación.**
4. Aplica el cambio fichero a fichero. Para cada uno:
   - Lee el fichero completo.
   - Aplica la transformación.
   - Verifica que el código sigue siendo válido (al menos sintácticamente).
5. Tras aplicar, ejecuta el type-check y los tests del proyecto. Si rompen, **no commitees** —
   investiga la regresión.
6. Si todo verde, propón un mensaje de commit explicando la transformación y deja el commit
   listo (sin push).

## Reglas

- No tocar \`node_modules/\`, \`dist/\`, \`build/\`, \`vendor/\`, \`.git/\`, lockfiles, ni binarios.
- Si la transformación toca docs, tests y código fuente, considera commits separados.
- Si encuentras casos donde el patrón aplica pero el contexto pide excepción, **párate y pregunta**
  en vez de inventar la solución.
`,
  },
  'api-snapshot': {
    frontmatterDescription:
      'Extrae la API pública de un módulo (exports, firmas, tipos) y produce un documento conciso ' +
      'que sirva como referencia. Útil para introducción rápida de un paquete. Triggers: ' +
      '"documenta la API pública de X", "snapshot de la API de Y", "qué exporta este módulo".',
    body: `# API snapshot

Extrae la API pública de: $ARGUMENTS

## Pasos

1. Si la ruta no se especifica o es ambigua, pregunta antes de empezar.
2. Identifica el entry point del módulo (\`index.ts\`, \`__init__.py\`, \`lib.rs\`, etc.) o el campo
   correspondiente del manifest (\`main\`/\`exports\` de \`package.json\`).
3. Lista todos los símbolos exportados públicamente:
   - Funciones (firma + tipos de parámetros y return).
   - Clases (constructor + métodos públicos).
   - Types / interfaces.
   - Constantes y enums.
4. Para cada uno, extrae la docstring/JSDoc si existe. Si no, infiere el propósito en una línea
   desde el código.

## Formato de salida

Markdown estructurado:

\`\`\`md
# API: <nombre del módulo>

> <propósito en 1-2 frases>

## Funciones
- \`name(arg: T): Result\` — descripción breve.

## Clases
- \`ClassName\` — descripción.
  - \`.method(arg)\` — descripción.

## Tipos
- \`TypeName\` — descripción.
\`\`\`

Sé conciso. No incluyas implementación, solo signatures. No documentes símbolos que el código marca
como privados (\`_foo\`, \`/** @internal */\`, etc.).
`,
  },
};
