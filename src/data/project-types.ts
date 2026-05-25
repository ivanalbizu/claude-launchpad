export type ProjectTypeId =
  | 'web-app'
  | 'api-rest'
  | 'npm-library'
  | 'cli-tool'
  | 'monorepo'
  | 'mobile-app'
  | 'desktop-app'
  | 'vscode-extension';

export interface ProjectType {
  readonly id: ProjectTypeId;
  readonly label: string;
  readonly description: string;
}

export const PROJECT_TYPES: readonly ProjectType[] = [
  {
    id: 'web-app',
    label: 'Web app',
    description: 'SPA o aplicación cliente con frontend (Vite, Next.js, Astro...).',
  },
  {
    id: 'api-rest',
    label: 'API REST',
    description: 'Servicio HTTP backend (Express, Fastify, Hono, NestJS...).',
  },
  {
    id: 'npm-library',
    label: 'Librería npm',
    description: 'Paquete publicable a npm con API pública tipada.',
  },
  {
    id: 'cli-tool',
    label: 'Herramienta CLI',
    description: 'Binario de línea de comandos (Commander, oclif, Clipanion...).',
  },
  {
    id: 'monorepo',
    label: 'Monorepo',
    description: 'Repositorio con varios paquetes (pnpm workspaces, Turborepo, Nx...).',
  },
  {
    id: 'mobile-app',
    label: 'App móvil',
    description: 'Aplicación nativa o híbrida (React Native, Expo, Capacitor...).',
  },
  {
    id: 'desktop-app',
    label: 'App de escritorio',
    description: 'Aplicación de escritorio (Electron, Tauri).',
  },
  {
    id: 'vscode-extension',
    label: 'Extensión VS Code',
    description: 'Extensión para Visual Studio Code.',
  },
];
