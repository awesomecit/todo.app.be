# 📋 Release Management - Configuration Guide

Guida completa alla configurazione del sistema di release automatizzato.

## 🎛️ Configurazione Principale

### package.json Scripts

Gli script NPM configurati per il release management:

```json
{
  "scripts": {
    "release:analyze": "node scripts/release-analyzer.js",
    "release:analyze:dry-run": "node scripts/release-analyzer.js --dry-run",
    "release:analyze:json": "node scripts/release-analyzer.js --format=json",
    "release:analyze:save": "node scripts/release-analyzer.js --save",
    "release:auto": "node scripts/auto-release.js",
    "release:auto:dry-run": "node scripts/auto-release.js --dry-run",
    "release:auto:force": "node scripts/auto-release.js --force",
    "release:version": "node scripts/version-calculator.js",
    "release:version:patch": "node scripts/version-calculator.js patch",
    "release:version:minor": "node scripts/version-calculator.js minor",
    "release:version:major": "node scripts/version-calculator.js major"
  }
}
```

### Husky Configuration

Pre-push hook configurazione in `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Detect if we're on a protected branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
protected_branches="main master"

# Check if current branch is protected
for branch in $protected_branches; do
  if [ "$current_branch" = "$branch" ]; then
    echo "🔍 Protected branch detected: $current_branch"
    echo "🚀 Running automated release check..."

    # Run release analysis
    npm run release:auto
    exit_code=$?

    if [ $exit_code -ne 0 ]; then
      echo "❌ Release process failed!"
      exit 1
    fi

    break
  fi
done
```

### CommitLint Configuration

File `commitlint.config.js`:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Formatting, missing semi colons, etc
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvement
        'test', // Adding missing tests
        'chore', // Maintain code, dependencies, build process
        'ci', // CI related changes
        'build', // Build system or external dependencies
        'revert', // Revert a previous commit
      ],
    ],
    'type-case': [2, 'always', 'lowerCase'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lowerCase'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
```

## ⚙️ Scripts Configuration

### Auto-Release Script Settings

File `scripts/auto-release.js` - Configurazioni principali:

```javascript
// Branch protetti per auto-release
const PROTECTED_BRANCHES = ['main', 'master'];

// Configurazione git tag
const TAG_FORMAT = 'v{version}';
const TAG_MESSAGE_TEMPLATE = `Release v{version}

{changelog}`;

// Configurazione backup
const BACKUP_SUFFIX = '.backup-{timestamp}';
const AUTO_CLEANUP_BACKUPS = true;

// Modalità CI/CD
const CI_MODE = process.env.CI === 'true';
const SKIP_INTERACTIVE = CI_MODE;

// File da aggiornare durante release
const FILES_TO_UPDATE = ['package.json', 'package-lock.json', 'CHANGELOG.md'];
```

### Release Analyzer Settings

File `scripts/release-analyzer.js` - Configurazioni:

```javascript
// Pattern conventional commits
const COMMIT_PATTERNS = {
  feat: { level: 'minor', emoji: '✨' },
  fix: { level: 'patch', emoji: '🐛' },
  perf: { level: 'patch', emoji: '⚡' },
  revert: { level: 'patch', emoji: '⏪' },
  docs: { level: 'none', emoji: '📚' },
  style: { level: 'none', emoji: '💄' },
  refactor: { level: 'none', emoji: '♻️' },
  test: { level: 'none', emoji: '🧪' },
  chore: { level: 'none', emoji: '🔧' },
  ci: { level: 'none', emoji: '👷' },
  build: { level: 'none', emoji: '📦' },
};

// Breaking change detection
const BREAKING_PATTERNS = [
  /^BREAKING CHANGE:/,
  /^BREAKING-CHANGE:/,
  /!:\s/,
  /BREAKING:\s/,
];
```

### Version Calculator Settings

File `scripts/version-calculator.js` - Configurazioni:

```javascript
// Semantic versioning format
const VERSION_REGEX =
  /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9\-\.]+))?(?:\+([a-zA-Z0-9\-\.]+))?$/;

// Pre-release settings (future)
const PRERELEASE_IDENTIFIERS = ['alpha', 'beta', 'rc'];
const PRERELEASE_FORMAT = '{version}-{identifier}.{number}';

// Build metadata (future)
const BUILD_METADATA_FORMAT = '{version}+{metadata}';
```

## 🔧 Environment Variables

### Local Development

File `.env`:

```bash
# Release configuration
RELEASE_AUTO_PUSH=true
RELEASE_CREATE_TAGS=true
RELEASE_UPDATE_CHANGELOG=true
RELEASE_RUN_TESTS=true
RELEASE_RUN_BUILD=true

# Git configuration
GIT_USER_NAME="Release Bot"
GIT_USER_EMAIL="release@yourproject.com"

# Debug settings
DEBUG_RELEASE=false
VERBOSE_LOGGING=false

# CI/CD detection
CI=false
```

### Production/CI

```bash
# CI Environment
CI=true
RELEASE_AUTO_PUSH=true
RELEASE_SKIP_INTERACTIVE=true

# GitHub Actions
GITHUB_TOKEN=${secrets.GITHUB_TOKEN}
GITHUB_ACTOR=${github.actor}

# GitLab CI
CI_COMMIT_REF_NAME=${CI_COMMIT_REF_NAME}
GITLAB_USER_NAME="GitLab CI"
GITLAB_USER_EMAIL="ci@gitlab.com"
```

## 📁 Directory Structure

Struttura file di configurazione release:

```
scripts/
├── auto-release.js          # Main release orchestrator
├── release-analyzer.js      # Commit analysis engine
├── version-calculator.js    # Semantic version management
└── config/
    ├── release.config.js    # Centralized configuration
    ├── templates/
    │   ├── tag-message.hbs  # Git tag message template
    │   └── changelog.hbs    # Changelog entry template
    └── hooks/
        ├── pre-release.js   # Pre-release validation
        ├── post-release.js  # Post-release actions
        └── rollback.js      # Rollback procedures

.husky/
├── _/                      # Husky internals
├── commit-msg             # CommitLint validation
└── pre-push              # Release automation trigger

docs/
└── release/
    ├── README.md          # Overview documentation
    ├── QUICKSTART.md      # Quick setup guide
    ├── TROUBLESHOOTING.md # Common issues and solutions
    ├── FAQ.md             # Frequently asked questions
    └── CONFIGURATION.md   # This file
```

## 🎨 Customization Examples

### Custom Commit Types

Aggiungere nuovi tipi di commit:

```javascript
// In commitlint.config.js
'type-enum': [
  2,
  'always',
  [
    // Standard types
    'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore',
    // Custom types
    'security',  // Security improvements
    'deps',      // Dependency updates
    'config',    // Configuration changes
    'deploy'     // Deployment related
  ]
]

// In scripts/release-analyzer.js
const COMMIT_PATTERNS = {
  // ... existing patterns
  security: { level: 'patch', emoji: '🔒' },
  deps: { level: 'none', emoji: '📦' },
  config: { level: 'none', emoji: '⚙️' },
  deploy: { level: 'none', emoji: '🚀' }
};
```

### Custom Changelog Format

Personalizzare il formato changelog:

```javascript
// In scripts/auto-release.js
function generateChangelog(commits, version) {
  const date = new Date().toISOString().split('T')[0];

  // Custom template
  let changelog = `## [${version}] - ${date}\n\n`;

  // Group by type with custom emojis
  const groups = {
    '🚀 New Features': commits.filter(c => c.type === 'feat'),
    '🐛 Bug Fixes': commits.filter(c => c.type === 'fix'),
    '⚡ Performance': commits.filter(c => c.type === 'perf'),
    '🔒 Security': commits.filter(c => c.type === 'security'),
    '📚 Documentation': commits.filter(c => c.type === 'docs'),
  };

  // Generate sections
  Object.entries(groups).forEach(([title, commits]) => {
    if (commits.length > 0) {
      changelog += `### ${title}\n\n`;
      commits.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        changelog += `- ${scope}${commit.description}\n`;
      });
      changelog += '\n';
    }
  });

  return changelog;
}
```

### Custom Pre-Release Hooks

Aggiungere validazioni custom:

```javascript
// scripts/config/hooks/pre-release.js
async function preReleaseValidation() {
  console.log('🔍 Running pre-release validations...');

  // 1. Check code coverage
  const coverage = await checkCodeCoverage();
  if (coverage < 80) {
    throw new Error('Code coverage below 80%');
  }

  // 2. Check security vulnerabilities
  await runSecurityAudit();

  // 3. Check dependencies
  await checkOutdatedDependencies();

  // 4. Custom business logic
  await validateBusinessRules();

  console.log('✅ Pre-release validations passed');
}

module.exports = { preReleaseValidation };
```

## 🔗 Integration Examples

### GitHub Actions Integration

```yaml
# .github/workflows/release.yml
name: Automated Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Build project
        run: npm run build

      - name: Auto release
        run: npm run release:auto
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CI: true
```

### GitLab CI Integration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - release

release:
  stage: release
  image: node:18
  script:
    - npm ci
    - npm run test
    - npm run build
    - npm run release:auto
  only:
    - main
  variables:
    CI: 'true'
    GIT_STRATEGY: clone
    GIT_DEPTH: 0
```

---

📝 **Note**: Questa configurazione supporta il workflow attuale. Per funzionalità avanzate come pre-release, consulta la roadmap nel README principale.
