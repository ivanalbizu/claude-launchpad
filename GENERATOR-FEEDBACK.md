# Feedback al generador de proyectos `.claude`

Notas tras usar el `.claude/` base recién generado para arrancar **real-state** (Vite + Lit + Vitest). Pensado para trasladar al repo del generador.

## TL;DR

El `.claude/settings.json` base tenía **denegaciones absolutas** sobre operaciones que el bootstrap inicial necesita (`pnpm install`, `pnpm add`). Eso bloqueó el primer `pnpm install` sin posibilidad de prompt al usuario, y obligó a editar `settings.json` en caliente. Recomendación principal: **reservar `deny` solo para acciones que nunca son aceptables; el resto, dejarlas implícitas (prompt) o explícitas en `allow`**.

---

## Qué pasó en la sesión

1. Tras crear `package.json`, lancé `pnpm install`. Fue rechazado por la regla `Bash(pnpm install:*)` en el `deny`.
2. Intenté ofrecer al usuario añadir una regla `allow` puntual. **No funciona**: en Claude Code, las reglas de `deny` siempre prevalecen sobre `allow`. No hay forma de "saltarse" un deny salvo editar el fichero.
3. La única vía viable fue quitar las entradas de install del `deny`. Eso dejó el repo permanentemente más permisivo de lo que probablemente el generador pretendía.

Tiempo perdido: ~3 turnos de aclaración con el usuario + edición manual del settings.

## Causa raíz: malentendido del modelo de permisos

El modelo real de Claude Code es:

| Lista        | Comportamiento                                                                  |
| ------------ | ------------------------------------------------------------------------------- |
| `allow`      | Se ejecuta sin preguntar.                                                       |
| _no listado_ | **Pregunta al usuario** (prompt interactivo). Éste es el caso por defecto sano. |
| `deny`       | Se rechaza inmediatamente, **sin prompt y sin posibilidad de override**.        |

Conclusión: `deny` no es "operación arriesgada que requiere doble confirmación". Es **"jamás, bajo ninguna circunstancia"**. Cualquier operación que tenga un caso de uso legítimo no debería estar en `deny` — debería estar simplemente _no listada_ para que el usuario decida en el momento.

Las reglas de install (`pnpm install`, `pnpm add`, `npm install`) violan ese principio: hay casos de uso totalmente legítimos (bootstrap, añadir dependencia con justificación aprobada por el usuario en CLAUDE.md). Denegarlas obliga a editar `settings.json` cada vez.

## Recomendaciones para el generador

### 1. Quitar del `deny` por defecto

```diff
  "deny": [
    "Bash(rm -rf:*)",
    "Bash(git reset --hard:*)",
    "Bash(git branch -D:*)",
    "Bash(git branch -d:*)",
    "Bash(git push --force:*)",
    "Bash(git push -f:*)",
    "Bash(sudo:*)",
    "Bash(pnpm publish:*)",
    "Bash(npm publish:*)",
-   "Bash(pnpm add:*)",
-   "Bash(pnpm install:*)",
-   "Bash(npm install:*)"
  ]
```

La política _"no instalar dependencias sin justificar coste de bundle"_ se mantiene en `CLAUDE.md` como guía conceptual — Claude leerá esa restricción y pedirá aprobación antes de instalar. Eso es lo que se quiere: prompt + justificación, no muro técnico.

### 2. Mantener en `deny` solo lo verdaderamente irreversible / catastrófico

Las que ya están bien:

- `rm -rf:*` — destructivo y casi siempre evitable.
- `git reset --hard:*`, `git branch -D:*`, `git push --force:*`/-f — pérdida de trabajo o reescritura de historia compartida.
- `sudo:*` — escalada de privilegios fuera del proyecto.
- `pnpm publish:*` / `npm publish:*` — publicación pública irreversible.

Criterio: **¿hay algún escenario en el que un usuario sensato querría que Claude haga esto sin interrumpirle ni preguntarle más?** Si la respuesta es "sí" para algún caso (aunque sea raro), no va en `deny`.

### 3. Ampliar el `allow` con scripts habituales del proyecto

El allow actual está bien encaminado pero le faltan piezas que aparecen en cuanto el proyecto crece:

```jsonc
"allow": [
  // Lectura de estado (ya estaban)
  "Bash(git status)",
  "Bash(git diff:*)",
  "Bash(git log:*)",
  "Bash(git show:*)",
  "Bash(git branch)",
  "Bash(git branch -v)",
  "Bash(git branch --list:*)",
  "Bash(git remote -v)",

  // Scripts del proyecto: incluir TODOS los del package.json
  "Bash(pnpm dev)",
  "Bash(pnpm build)",
  "Bash(pnpm preview)",        // añadido
  "Bash(pnpm test:*)",
  "Bash(pnpm test:run)",       // útil cuando vitest run es habitual
  "Bash(pnpm lint)",
  "Bash(pnpm format)",
  "Bash(pnpm typecheck)",      // añadido
  "Bash(npm test:*)",
  "Bash(npm run:*)",

  // Utilidades read-only / inocuas que Claude usa constantemente
  "Bash(node --version)",
  "Bash(pnpm --version)",
  "Bash(npx --version)",
  "Bash(ls:*)",
  "Bash(cat:*)",               // Claude prefiere Read tool pero a veces cae a cat
  "Bash(mkdir -p:*)",          // necesario para scaffolding por tipos
]
```

### 4. Documentar el modelo de permisos en el `CLAUDE.md` generado

Añadir una sección breve para que **Claude y el usuario** entiendan cómo funciona el `.claude/settings.json` sin sorpresas:

> ## Permisos
>
> - `allow`: se ejecuta sin preguntar.
> - `deny`: rechazado sin prompt, no se puede sortear sin editar el fichero.
> - No listado: pregunta al usuario en el momento.
>
> Para añadir/instalar dependencias nuevas, Claude debe pedir aprobación explícita (ver _Restricciones_) y justificar el coste de bundle. No se deniega técnicamente porque hay casos legítimos.

### 5. (Opcional) `settings.local.json` para bootstrap

Si el generador realmente quiere ser estricto en steady-state, puede generar **dos ficheros**:

- `settings.json` — committed, restrictivo.
- `settings.local.json` — gitignored, más permisivo, pensado para el primer bootstrap. El usuario lo borra cuando el proyecto está montado.

Más complejo y probablemente innecesario. La opción 1+2+3+4 cubre el 95% de los casos.

## Otros detalles menores observados

- El `CLAUDE.md` repite la restricción de install dos veces (lista de restricciones + apartado de dependencias). Consolidar a una sola mención.
- El `package.json` no se genera — el usuario tiene que pedirlo. Considerar generar también `package.json` mínimo + `tsconfig.json` + entrypoints para que el _primer_ `pnpm install` ya tenga algo que instalar. Si el alcance del generador es solo `.claude/`, dejarlo claro en su propio README.

### Falso positivo: skills y comandos sí se cargan

En una versión anterior de este doc reporté que las skills/comandos declaradas en `CLAUDE.md` "no se cargaron en la sesión". **Era incorrecto**:

- `code-reviewer`, `planner`, `test-writer` aparecen como agentes disponibles.
- `/review`, `/plan`, `/test`, `/security-review` aparecen como slash commands.
- `codemod` y `commit-batch` están marcadas como `manual` en `CLAUDE.md`. Las skills manuales **no se autoanuncian** en la lista de "available skills" de Claude Code: solo se cargan cuando el usuario las invoca explícitamente. Eso es comportamiento correcto del runtime, no bug del generador.

Lección: no confundir "skill no anunciada en la lista de disponibles" con "skill no cargada". Si el doc del generador puede aclarar este matiz al usuario final, mejor.

## Resumen de cambio recomendado en el `settings.json` base

```json
{
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git show:*)",
      "Bash(git branch)",
      "Bash(git branch -v)",
      "Bash(git branch --list:*)",
      "Bash(git remote -v)",
      "Bash(pnpm dev)",
      "Bash(pnpm build)",
      "Bash(pnpm preview)",
      "Bash(pnpm test:*)",
      "Bash(pnpm lint)",
      "Bash(pnpm format)",
      "Bash(pnpm typecheck)",
      "Bash(npm test:*)",
      "Bash(npm run:*)",
      "Bash(node --version)",
      "Bash(pnpm --version)",
      "Bash(ls:*)",
      "Bash(mkdir -p:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(git reset --hard:*)",
      "Bash(git branch -D:*)",
      "Bash(git branch -d:*)",
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(sudo:*)",
      "Bash(pnpm publish:*)",
      "Bash(npm publish:*)"
    ]
  }
}
```

Con este set, el bootstrap inicial funciona sin fricción y la política de "no instalar sin justificar" sigue vigente como guía conceptual leída desde `CLAUDE.md`.
