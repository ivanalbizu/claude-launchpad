export type McpServerId =
  | 'filesystem'
  | 'github'
  | 'git'
  | 'puppeteer'
  | 'memory'
  | 'postgres'
  | 'sequential-thinking';

export interface McpServerConfig {
  readonly command: string;
  readonly args: readonly string[];
  readonly env?: Readonly<Record<string, string>>;
}

export interface McpServer {
  readonly id: McpServerId;
  /** Key emitted under `mcpServers` in settings.json. */
  readonly key: string;
  readonly label: string;
  readonly description: string;
  /** Human-readable setup hint surfaced in CLAUDE.md when the server is selected. */
  readonly setupNote?: string;
  readonly config: McpServerConfig;
}

export const MCP_SERVERS: readonly McpServer[] = [
  {
    id: 'filesystem',
    key: 'filesystem',
    label: 'Filesystem',
    description: 'Acceso a ficheros del proyecto, acotado al directorio que se pase como argumento.',
    setupNote:
      'El argumento `"."` lo limita al directorio actual. Ajusta a una ruta absoluta si quieres exponer otra ubicación. Nunca pongas `/` ni el HOME.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '.'],
    },
  },
  {
    id: 'github',
    key: 'github',
    label: 'GitHub',
    description: 'Operaciones sobre issues, PRs y repos a través de la API de GitHub.',
    setupNote:
      'Exporta `GITHUB_TOKEN` en tu shell con un personal access token (scopes `repo` y `read:org` como mínimo). Sustituye la referencia `${GITHUB_TOKEN}` por la variable que uses.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_TOKEN}',
      },
    },
  },
  {
    id: 'git',
    key: 'git',
    label: 'Git',
    description: 'Operaciones git de bajo nivel (status, diff, log, blame) sin shell.',
    setupNote:
      'No requiere config. El server se ejecuta sobre el repo del directorio actual.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-git'],
    },
  },
  {
    id: 'puppeteer',
    key: 'puppeteer',
    label: 'Puppeteer',
    description: 'Automatización de navegador headless (capturas, navegación, scraping).',
    setupNote:
      'Descarga Chromium en la primera ejecución (~150 MB). Si trabajas en CI, fija `PUPPETEER_EXECUTABLE_PATH` a un Chromium preinstalado.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    },
  },
  {
    id: 'memory',
    key: 'memory',
    label: 'Memory',
    description: 'Memoria persistente entre sesiones basada en knowledge graph local.',
    setupNote:
      'No requiere config. El grafo se guarda en `~/.cache/mcp-memory/`. Útil para mantener notas, decisiones y contexto entre sesiones.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
    },
  },
  {
    id: 'postgres',
    key: 'postgres',
    label: 'PostgreSQL',
    description: 'Consultas de solo lectura contra una base de datos PostgreSQL.',
    setupNote:
      'Exporta `POSTGRES_URL` en tu shell con una connection string. **Usa siempre un rol con permisos de solo lectura** — el server no protege contra DELETEs si tu usuario los puede ejecutar.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', '${POSTGRES_URL}'],
    },
  },
  {
    id: 'sequential-thinking',
    key: 'sequential-thinking',
    label: 'Sequential Thinking',
    description: 'Ayuda al modelo a estructurar razonamientos paso a paso para problemas complejos.',
    setupNote: 'No requiere config. Activa o desactiva según prefieras razonamiento más explícito.',
    config: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    },
  },
];
