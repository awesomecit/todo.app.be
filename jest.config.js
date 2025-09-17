// jest.config.js

module.exports = {
  displayName: 'Unit Tests',
  testEnvironment: 'node',

  // CRITICO: Forza l'esecuzione sequenziale per evitare conflitti
  maxWorkers: 1,

  // Timeout generosi per operazioni database e container
  testTimeout: 60000,

  // Rileva handle aperti (connessioni database non chiuse)
  detectOpenHandles: true,
  forceExit: true,

  // Pattern dei file di test
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],

  // Moduli da trasformare con TypeScript
  preset: 'ts-jest',

  // Mapping dei moduli per import relativi (corretto nome)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },

  // Coverage configuration
  collectCoverage: false, // Disabilitato per i test per performance
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
    '!src/test/**',
    '!src/**/*.interface.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.dto.ts',
  ],

  // Coverage thresholds - Fase 1: Baseline realistico per adozione graduale TDD
  // TODO: Incrementare progressivamente verso target finale (80/75/80/80)
  coverageThreshold: {
    global: {
      statements: 55, // Target finale: 80% (Attuale: 51%)
      branches: 65, // Target finale: 75% (Attuale: 61%)
      functions: 50, // Target finale: 80% (Attuale: 45%)
      lines: 55, // Target finale: 80% (Attuale: 52%)
    },
    // Soglie specifiche per aree critiche - manteniamo ambiziose
    './src/common/logger/': {
      statements: 60, // Target finale: 90%
      branches: 50, // Target finale: 85%
      functions: 85, // Target finale: 90%
      lines: 60, // Target finale: 90%
    },
    './src/common/filters/': {
      statements: 95, // Già ottima
      branches: 75, // Target finale: 80%
      functions: 100, // Già perfetta
      lines: 95, // Target finale: 85%
    },
    './src/health/': {
      statements: 75, // Target finale: 95%
      branches: 100, // Già perfetta
      functions: 25, // Target finale: 95%
      lines: 70, // Target finale: 95%
    },
  },

  // Coverage reports
  coverageReporters: [
    'text', // Output in console
    'text-summary', // Summary in console
    'html', // HTML report in coverage/
    'lcov', // Per integrazioni CI/CD
    'json-summary', // Per badge e metriche
  ],

  // Directory output per coverage
  coverageDirectory: 'coverage',

  // Ignora i moduli node_modules tranne alcuni specifici se necessario
  transformIgnorePatterns: ['node_modules/(?!(testcontainers)/)'],
};
