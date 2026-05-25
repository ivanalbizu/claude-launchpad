export type ClaudeModelAlias = 'opus' | 'sonnet' | 'haiku';

export interface CommandTemplate {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly content: string;
  readonly argumentHint?: string;
  readonly model?: ClaudeModelAlias;
  readonly allowedTools?: readonly string[];
}

const READ_ONLY_TOOLS: readonly string[] = [
  'Bash(git status)',
  'Bash(git diff:*)',
  'Bash(git log:*)',
  'Bash(git show:*)',
  'Read',
  'Grep',
  'Glob',
];

export const COMMAND_TEMPLATES: readonly CommandTemplate[] = [
  {
    id: 'review',
    label: '/review',
    description: 'Revisa los cambios pendientes en el branch actual sin modificar código.',
    allowedTools: READ_ONLY_TOOLS,
    content: `Revisa los cambios pendientes en el branch actual.

1. Ejecuta \`git status\` y \`git diff\` para ver qué ha cambiado.
2. Analiza los cambios buscando:
   - Bugs evidentes.
   - Patrones inconsistentes con el resto del repo.
   - Falta de tests.
   - Manejo de errores ausente o débil.
   - Problemas de seguridad (SQL injection, XSS, etc.).
   - Naming poco claro.
3. Resume tus hallazgos agrupados por severidad: crítico / importante / sugerencia.

No modifiques nada todavía. Solo informa.
`,
  },
  {
    id: 'plan',
    label: '/plan',
    description: 'Produce un plan detallado antes de implementar una tarea.',
    argumentHint: 'tarea o feature',
    model: 'opus',
    content: `Antes de implementar, produce un plan detallado.

Tarea: $ARGUMENTS

Tu plan debe incluir:
1. Qué ficheros se van a tocar (con rutas concretas).
2. Qué se va a añadir/modificar/eliminar en cada uno.
3. Decisiones de diseño no obvias y sus tradeoffs.
4. Riesgos o casos límite a considerar.
5. Orden sugerido de ejecución.

No escribas código todavía. Espera mi confirmación antes de implementar.
`,
  },
  {
    id: 'test',
    label: '/test',
    description: 'Escribe tests para un módulo/función indicado.',
    argumentHint: 'módulo o función',
    content: `Escribe tests para: $ARGUMENTS

Reglas:
- Usa el framework de tests configurado en este proyecto.
- Cubre el happy path + 2-3 edge cases relevantes.
- Tests independientes (sin estado compartido).
- Nombres descriptivos.
- Si no existe el módulo, pídeme la ruta antes de empezar.

Después de escribirlos, ejecuta el test runner y arregla los que fallen.
`,
  },
  {
    id: 'refactor',
    label: '/refactor',
    description: 'Refactoriza código manteniendo el comportamiento exacto.',
    argumentHint: 'fichero, función o pegado',
    content: `Refactoriza el siguiente código manteniendo el comportamiento exacto: $ARGUMENTS

Objetivos:
- Reducir complejidad ciclomática.
- Mejorar la legibilidad de los nombres.
- Eliminar duplicación si la hay.
- No introducir nuevas dependencias.

Verifica que los tests existentes pasan después del refactor.
`,
  },
  {
    id: 'debug',
    label: '/debug',
    description: 'Ayuda a diagnosticar un problema antes de tocar código.',
    argumentHint: 'descripción del problema',
    content: `Ayúdame a diagnosticar este problema: $ARGUMENTS

Proceso:
1. Hazme preguntas si falta información (logs, reproducción, contexto).
2. Identifica 2-3 hipótesis ordenadas por probabilidad.
3. Propón un experimento mínimo para descartar cada una.
4. Cuando tengamos la causa raíz, propón el fix.

No modifiques código hasta confirmar la hipótesis.
`,
  },
  {
    id: 'doc',
    label: '/doc',
    description: 'Genera documentación concisa para una API o módulo.',
    argumentHint: 'API o módulo',
    content: `Genera documentación para: $ARGUMENTS

Incluye:
- Propósito (1-2 frases).
- API pública con tipos.
- Ejemplo de uso típico.
- Notas sobre comportamiento no obvio (efectos secundarios, errores, async).

Formato markdown. Sé conciso, evita boilerplate.
`,
  },
  {
    id: 'security-review',
    label: '/security-review',
    description: 'Audita los cambios pendientes con enfoque de seguridad.',
    model: 'opus',
    allowedTools: READ_ONLY_TOOLS,
    content: `Audita los cambios pendientes con enfoque de seguridad.

1. Ejecuta \`git diff\` para ver qué ha cambiado.
2. Busca específicamente:
   - Inyecciones (SQL, XSS, command injection).
   - Validación de input ausente.
   - Secretos en código (API keys, tokens).
   - Permisos demasiado amplios.
   - Autenticación / autorización rota.
   - Uso de dependencias con vulnerabilidades conocidas.
3. Reporta hallazgos con: severidad, fichero:línea, exploit, mitigación.

No modifiques código. Solo informa.
`,
  },
];
