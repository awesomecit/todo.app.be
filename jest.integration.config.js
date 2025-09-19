// jest.integration.config.js
module.exports = {
  displayName: 'Integration Tests',
  testEnvironment: 'node',

  // CRITICO: Forza l'esecuzione sequenziale per evitare conflitti con database
  maxWorkers: 1,

  // Timeout generosi per operazioni database e container
  testTimeout: 60000,

  // Rileva handle aperti (connessioni database non chiuse)
  detectOpenHandles: true,
  forceExit: true,

  // Pattern dei file di test di integrazione
  testMatch: [
    '<rootDir>/test/**/*.integration.spec.ts',
    '<rootDir>/src/**/*.integration.spec.ts',
  ],

  // Moduli da trasformare con TypeScript
  preset: 'ts-jest',

  // Setup files per test integration
  setupFilesAfterEnv: ['<rootDir>/test/setup.integration.ts'],

  // Global setup e teardown per database container
  globalSetup: '<rootDir>/test/globalSetup.integration.ts',
  globalTeardown: '<rootDir>/test/globalTeardown.integration.ts',

  // Mapping dei moduli per import relativi
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },

  // Coverage per test integration
  collectCoverage: false, // Disabilitato per performance durante development

  // Ignora i moduli node_modules tranne testcontainers
  transformIgnorePatterns: ['node_modules/(?!(testcontainers)/)'],

  // Environment variables per test
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
};
