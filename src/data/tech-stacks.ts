export type TechCategory =
  | 'language'
  | 'runtime'
  | 'frontend-framework'
  | 'backend-framework'
  | 'build-tool'
  | 'styling'
  | 'orm'
  | 'database';

export interface TechItem {
  readonly id: string;
  readonly label: string;
  readonly category: TechCategory;
}

export const TECH_CATEGORIES: ReadonlyArray<{ id: TechCategory; label: string }> = [
  { id: 'language', label: 'Lenguaje' },
  { id: 'runtime', label: 'Runtime' },
  { id: 'frontend-framework', label: 'Framework frontend' },
  { id: 'backend-framework', label: 'Framework backend' },
  { id: 'build-tool', label: 'Build tool' },
  { id: 'styling', label: 'Estilos' },
  { id: 'orm', label: 'ORM' },
  { id: 'database', label: 'Base de datos' },
];

export const TECH_STACKS: readonly TechItem[] = [
  // Lenguajes
  { id: 'typescript', label: 'TypeScript', category: 'language' },
  { id: 'javascript', label: 'JavaScript', category: 'language' },
  { id: 'python', label: 'Python', category: 'language' },
  { id: 'rust', label: 'Rust', category: 'language' },
  { id: 'go', label: 'Go', category: 'language' },

  // Runtimes
  { id: 'node', label: 'Node.js', category: 'runtime' },
  { id: 'deno', label: 'Deno', category: 'runtime' },
  { id: 'bun', label: 'Bun', category: 'runtime' },

  // Frameworks frontend
  { id: 'react', label: 'React', category: 'frontend-framework' },
  { id: 'vue', label: 'Vue', category: 'frontend-framework' },
  { id: 'svelte', label: 'Svelte', category: 'frontend-framework' },
  { id: 'solid', label: 'Solid', category: 'frontend-framework' },
  { id: 'lit', label: 'Lit', category: 'frontend-framework' },
  { id: 'angular', label: 'Angular', category: 'frontend-framework' },
  { id: 'astro', label: 'Astro', category: 'frontend-framework' },
  { id: 'nextjs', label: 'Next.js', category: 'frontend-framework' },

  // Frameworks backend
  { id: 'express', label: 'Express', category: 'backend-framework' },
  { id: 'fastify', label: 'Fastify', category: 'backend-framework' },
  { id: 'hono', label: 'Hono', category: 'backend-framework' },
  { id: 'nestjs', label: 'NestJS', category: 'backend-framework' },
  { id: 'fastapi', label: 'FastAPI', category: 'backend-framework' },

  // Build tools
  { id: 'vite', label: 'Vite', category: 'build-tool' },
  { id: 'webpack', label: 'Webpack', category: 'build-tool' },
  { id: 'esbuild', label: 'esbuild', category: 'build-tool' },
  { id: 'rollup', label: 'Rollup', category: 'build-tool' },
  { id: 'tsup', label: 'tsup', category: 'build-tool' },

  // Estilos
  { id: 'tailwind', label: 'Tailwind CSS', category: 'styling' },
  { id: 'css-modules', label: 'CSS Modules', category: 'styling' },
  { id: 'styled-components', label: 'styled-components', category: 'styling' },
  { id: 'vanilla-extract', label: 'vanilla-extract', category: 'styling' },
  { id: 'css-vars', label: 'CSS variables (vanilla)', category: 'styling' },

  // ORMs
  { id: 'prisma', label: 'Prisma', category: 'orm' },
  { id: 'drizzle', label: 'Drizzle', category: 'orm' },
  { id: 'typeorm', label: 'TypeORM', category: 'orm' },
  { id: 'sequelize', label: 'Sequelize', category: 'orm' },
  { id: 'dexie', label: 'Dexie (IndexedDB)', category: 'orm' },

  // Bases de datos
  { id: 'postgresql', label: 'PostgreSQL', category: 'database' },
  { id: 'mysql', label: 'MySQL', category: 'database' },
  { id: 'sqlite', label: 'SQLite', category: 'database' },
  { id: 'mongodb', label: 'MongoDB', category: 'database' },
  { id: 'redis', label: 'Redis', category: 'database' },
];
