export type ConventionCategoryId = 'code-style' | 'naming' | 'folder-structure' | 'git-workflow';

export interface ConventionOption {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
}

export interface ConventionCategory {
  readonly id: ConventionCategoryId;
  readonly label: string;
  readonly options: readonly ConventionOption[];
}

export const CONVENTION_CATEGORIES: readonly ConventionCategory[] = [
  {
    id: 'code-style',
    label: 'Estilo de código',
    options: [
      { id: 'prettier-eslint', label: 'Prettier + ESLint (recomendado)' },
      { id: 'standard', label: 'Standard JS' },
      { id: 'airbnb', label: 'Airbnb' },
      { id: 'google', label: 'Google' },
      { id: 'custom', label: 'Custom (definido en el repo)' },
    ],
  },
  {
    id: 'naming',
    label: 'Naming',
    options: [
      {
        id: 'camel-case',
        label: 'camelCase para variables/funciones, PascalCase para tipos/clases',
      },
      { id: 'kebab-case-files', label: 'kebab-case para ficheros, camelCase para identificadores' },
      { id: 'snake-case', label: 'snake_case (estilo Python/Rust)' },
    ],
  },
  {
    id: 'folder-structure',
    label: 'Estructura de carpetas',
    options: [
      {
        id: 'feature-based',
        label: 'Por feature',
        description: 'Agrupar por funcionalidad (p. ej. `src/features/auth/`).',
      },
      {
        id: 'type-based',
        label: 'Por tipo',
        description: 'Agrupar por tipo de fichero (`components/`, `services/`, `hooks/`...).',
      },
      {
        id: 'hexagonal',
        label: 'Hexagonal / Clean Architecture',
        description: 'Capas: domain, application, infrastructure.',
      },
      {
        id: 'flat',
        label: 'Plana',
        description: 'Pocos niveles, ideal para proyectos pequeños.',
      },
    ],
  },
  {
    id: 'git-workflow',
    label: 'Workflow Git',
    options: [
      { id: 'trunk-based', label: 'Trunk-based development' },
      { id: 'github-flow', label: 'GitHub Flow (feature branches + PR)' },
      { id: 'gitflow', label: 'GitFlow (develop/main + release branches)' },
    ],
  },
];
