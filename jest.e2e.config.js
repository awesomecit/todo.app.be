// jest.e2e.config.js
module.exports = {
  displayName: 'E2E Tests',
  testEnvironment: 'node',

  // CRITICO: Forza l'esecuzione sequenziale per evitare conflitti con database
  maxWorkers: 1,

  // Timeout generosi per operazioni E2E complete
  testTimeout: 30000,

  // Rileva handle aperti
  detectOpenHandles: true,
  forceExit: true,

  // Pattern dei file di test E2E
  testMatch: ['<rootDir>/test/**/*.e2e.spec.ts'],

  // Moduli da trasformare con TypeScript
  preset: 'ts-jest',

  // Setup files per test E2E
  setupFilesAfterEnv: ['<rootDir>/test/setup.integration.ts'],

  // Mapping dei moduli per import relativi
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },

  // Coverage disabilitato per E2E (focus sulla funzionalità)
  collectCoverage: false,

  // Ignora i moduli node_modules tranne testcontainers
  transformIgnorePatterns: ['node_modules/(?!(testcontainers)/)'],

  // Environment variables per test E2E
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
};
