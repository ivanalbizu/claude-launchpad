---
description: Scaffold a new Lit UI component in src/components/ui/
argument-hint: <kebab-name> (sin prefijo cd-)
---

Crea un Lit component reutilizable en `src/components/ui/` siguiendo el patrón del repo. El nombre dado es: **$ARGUMENTS**

Convierte el nombre a kebab-case y úsalo así:

- Tag: `cd-<nombre>` (prefijo `cd-` obligatorio, ver [CLAUDE.md](CLAUDE.md))
- Fichero: `src/components/ui/<nombre>.ts`
- Clase: `Cd<PascalCase>`

### Referencia de estilo

Usa [src/components/ui/token-counter.ts](src/components/ui/token-counter.ts) como base mínima. Para algo con más estado/eventos, mira [src/components/wizard/step-project-type.ts](src/components/wizard/step-project-type.ts).

### Reglas que **DEBES** respetar

1. `@customElement('cd-<nombre>')` y prefijo `cd-` siempre.
2. Estilos con `css` tagged template **dentro** del componente. Usa solo CSS vars de [src/styles/tokens.css](src/styles/tokens.css) — nunca colores ni medidas hardcodeadas.
3. Imports con el alias `@/` (no rutas relativas largas como `../../`).
4. `import { LitElement, html, css, type TemplateResult } from 'lit';` y `import { customElement, property } from 'lit/decorators.js';`.
5. Tipa `render()` con `: TemplateResult`.
6. Declara la clase en `HTMLElementTagNameMap` al final del fichero.
7. Si dispara eventos, expórtalos como `export type CdXxxEvent = CustomEvent<Detail>` y decláralos en `HTMLElementEventMap`. Dispátchalos con `bubbles: true, composed: true`.
8. Props con `@property({ attribute: false })` si son objetos/arrays; con `{ type: String/Number/Boolean }` si son primitivos.

### Pasos

1. Pregunta brevemente al usuario si el componente:
   - Tiene estado propio o es controlado (state-up).
   - Dispara algún evento, y con qué payload.
   - Recibe props, cuáles.

   Si la respuesta es obvia por el nombre, salta esta pregunta y propón un diseño.

2. Crea el fichero con la estructura completa (clase, estilos, render, declare global).

3. **No** lo importes en otros sitios automáticamente — confirma primero dónde se va a usar.

4. Al terminar, recuerda al usuario: `pnpm lint && pnpm build` para verificar.
