export type TestType = 'unit' | 'integration' | 'component' | 'e2e';

export interface TestingFramework {
  readonly id: string;
  readonly label: string;
  readonly testType: TestType;
}

export interface TestStrategy {
  readonly id: TestType;
  readonly label: string;
  readonly description: string;
}

export const TEST_STRATEGIES: readonly TestStrategy[] = [
  {
    id: 'unit',
    label: 'Unit tests',
    description: 'Pruebas de funciones puras y unidades aisladas.',
  },
  {
    id: 'integration',
    label: 'Integration tests',
    description: 'Pruebas que combinan varios módulos (DB real, HTTP...).',
  },
  {
    id: 'component',
    label: 'Component tests',
    description: 'Pruebas de componentes UI montados en aislamiento.',
  },
  {
    id: 'e2e',
    label: 'End-to-end tests',
    description: 'Pruebas que recorren la aplicación completa desde el navegador.',
  },
];

export const TESTING_FRAMEWORKS: readonly TestingFramework[] = [
  { id: 'vitest', label: 'Vitest', testType: 'unit' },
  { id: 'jest', label: 'Jest', testType: 'unit' },
  { id: 'mocha', label: 'Mocha', testType: 'unit' },
  { id: 'node-test', label: 'node:test', testType: 'unit' },
  { id: 'supertest', label: 'Supertest', testType: 'integration' },
  { id: 'testcontainers', label: 'Testcontainers', testType: 'integration' },
  { id: 'testing-library', label: 'Testing Library', testType: 'component' },
  { id: 'web-test-runner', label: '@web/test-runner', testType: 'component' },
  { id: 'storybook', label: 'Storybook', testType: 'component' },
  { id: 'playwright', label: 'Playwright', testType: 'e2e' },
  { id: 'cypress', label: 'Cypress', testType: 'e2e' },
];

export interface CoverageTarget {
  readonly id: string;
  readonly label: string;
  readonly minPercent: number;
}

export const COVERAGE_TARGETS: readonly CoverageTarget[] = [
  { id: 'none', label: 'Sin objetivo de cobertura', minPercent: 0 },
  { id: 'low', label: 'Mínimo (50%)', minPercent: 50 },
  { id: 'standard', label: 'Estándar (70%)', minPercent: 70 },
  { id: 'strict', label: 'Estricto (85%)', minPercent: 85 },
  { id: 'paranoid', label: 'Paranoide (95%)', minPercent: 95 },
];
