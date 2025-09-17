module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New features
        'fix', // Bug fixes
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system changes
        'ci', // CI/CD changes
        'chore', // Maintenance tasks
        'revert', // Reverting changes
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'auth',
        'core',
        'config',
        'logger',
        'health',
        'swagger',
        'filters',
        'interceptors',
        'middleware',
        'validators',
        'entities',
        'controllers',
        'services',
        'release',
        'deps',
      ],
    ],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
  },
};
