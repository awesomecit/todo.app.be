// @ts-check
// eslint.config.mjs - Configurazione bilanciata (meno warning, focus su cognitive complexity)

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Files to ignore
  {
    ignores: [
      'eslint.config.mjs',
      'commitlint.config.js',
      'dist/**/*',
      'node_modules/**/*',
      'coverage/**/*',
      'reports/**/*',
      '*.config.js',
      '**/*.spec.ts',
      '**/*.test.ts',
      'test/setup.ts',
      'test/globalSetup.js',
      'test/globalTeardown.js',
      'test/helpers/**/*',
      'jest.integration.config.js',
      'jest.unit.config.js',
      'jest-e2e.config.js',
      'test/jest-integration.json',
      'test/jest-unit.json',
      'test/jest-e2e.json',
      'test/**/*.ts',
      'test/**/*.js',
    ],
  },

  // Base configurations
  ...tseslint.configs.recommended,

  // SonarJS configuration - Focus su cognitive complexity
  {
    plugins: {
      sonarjs,
    },
    rules: {
      // 🧠 COGNITIVE COMPLEXITY - La regola principale!
      'sonarjs/cognitive-complexity': ['warn', 15],

      // 🔄 COMPLEXITY (regole più permissive per legacy code)
      'complexity': ['warn', { max: 15 }], // Aumentato da 10 a 15
      'max-lines-per-function': ['warn', { max: 80 }], // Aumentato da 50 a 80
      'max-params': ['warn', { max: 6 }], // Aumentato da 5 a 6
      'max-depth': ['warn', { max: 5 }], // Aumentato da 4 a 5
      'max-nested-callbacks': ['warn', { max: 4 }], // Aumentato da 3 a 4

      // 🎯 TYPESCRIPT (più permissivo per NestJS)
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/prefer-optional-chain': 'off', // Disabilitato per non essere troppo noisy
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disabilitato per non essere troppo noisy

      // 🏗️ CODE QUALITY (solo essenziali)
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off', // Permesso in NestJS per logging
      'no-debugger': 'error',
      'object-shorthand': 'off', // Disabilitato per non essere troppo noisy
      'prefer-arrow-callback': 'off', // Disabilitato per non essere troppo noisy

      // 🚫 DISABLE per NestJS
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },

  // Language options
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Prettier (ultimo per evitare conflitti)
  eslintPluginPrettierRecommended,
);