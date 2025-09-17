# Package Management Enterprise Guidelines

## Overview

This document outlines the enterprise-level best practices for package management in the `todo.app.be` project, focusing on consistent dependency management, security, and reproducible builds across development teams and environments.

## Package Lock Strategy

### Current Setup ✅

- **Package Manager**: npm v11.6.0
- **Node.js Version**: v20.17.0
- **Lockfile Format**: package-lock.json (lockfileVersion 3)
- **Git Tracking**: ✅ Committed to repository

### Enterprise Best Practices

#### 1. Node.js & npm Version Enforcement

**🔒 LOCKED ENGINES** - Enterprise-grade version consistency:

```json
{
  "engines": {
    "node": ">=20.8.0",
    "npm": ">=10.0.0"
  }
}
```

**🚨 Enforcement Strategy:**

```bash
# ✅ Verify versions match requirements
node --version  # Must be >= 20.8.0
npm --version   # Must be >= 10.0.0

# ✅ Enable strict engine checking (recommended for CI/CD)
npm config set engine-strict true

# ✅ Team onboarding check
npm run env:check  # Custom script to validate environment
```

**📋 Why Engine Locking Matters:**

- **Security**: Older Node.js versions have known vulnerabilities
- **Features**: Modern npm features (lockfile v3, workspaces)
- **Performance**: Significant improvements in Node 20+
- **Team Consistency**: Eliminates "works on my machine" issues

#### 2. Package Lock File Management

```bash
# ✅ CORRECT: Always commit package-lock.json
git add package-lock.json
git commit -m "chore: update package-lock.json"

# ❌ INCORRECT: Never ignore package-lock.json in enterprise
echo "package-lock.json" >> .gitignore  # DON'T DO THIS
```

#### 3. Dependency Installation

**🚨 CRITICAL ENTERPRISE RULE: When to use `npm ci` vs `npm install`**

```bash
# ✅ REQUIRED: Production installations (CI/CD, production servers)
npm ci
# 📋 Why: Installs exact versions from package-lock.json
# 📋 Use case: Docker builds, deployment servers, CI pipelines

# ✅ REQUIRED: Fresh development setup
npm ci
# 📋 Why: Ensures identical dependency tree as team
# 📋 Use case: New team member, fresh git clone

# ✅ REQUIRED: After git pull with package-lock.json changes
npm ci
# 📋 Why: Synchronizes with updated dependencies
# 📋 Use case: Someone else updated dependencies

# ✅ Development with NEW dependencies only
npm install
# 📋 Why: Updates package-lock.json with new dependencies
# 📋 Use case: Adding new packages to project

# ✅ Update package-lock after manual package.json changes
npm install --package-lock-only
# 📋 Why: Regenerates lock file without installing
# 📋 Use case: Version bump, dependency version changes
```

**🎯 Enterprise Decision Matrix:**

| Scenario              | Command       | Reason                                      |
| --------------------- | ------------- | ------------------------------------------- |
| 🚀 CI/CD Pipeline     | `npm ci`      | **MANDATORY** - Exact reproducible builds   |
| 🐳 Docker Build       | `npm ci`      | **MANDATORY** - Consistent container images |
| 🔄 After `git pull`   | `npm ci`      | **RECOMMENDED** - Sync with team changes    |
| 👨‍💻 Fresh dev setup    | `npm ci`      | **RECOMMENDED** - Start with team state     |
| ➕ Adding new package | `npm install` | **REQUIRED** - Updates lock file            |
| 🔄 Development work   | `npm ci`      | **PREFERRED** - Consistent environment      |

#### 3. Security and Audit

```bash
# Regular security audits
npm audit

# Fix vulnerabilities automatically (use with caution)
npm audit fix

# Generate security report
npm audit --json > security-report.json
```

## Enterprise Workflows

### Development Team Workflow

1. **Pull latest changes**: Always pull before installing dependencies
2. **Clean install**: Use `npm ci` for consistent builds
3. **Add new dependencies**: Use exact versions for production dependencies
4. **Update lock file**: Commit package-lock.json with dependency changes

### CI/CD Pipeline Integration

```yaml
# Example CI workflow
- name: Install dependencies
  run: npm ci --prefer-offline --no-audit

- name: Verify lock file
  run: npm ls --depth=0
```

### Version Management Integration

Our automated release system automatically handles:

- ✅ **Package.json version updates**
- ✅ **Package-lock.json synchronization**
- ✅ **Git tagging with version consistency**
- ✅ **Backup and rollback mechanisms**

### 🚀 Release Automation Behavior

**🔒 Security Requirements (NEW):**

- ✅ **Branch Protection**: Only `main`/`master` branches allowed
- ✅ **Clean Working Directory**: No uncommitted changes
- ✅ **Remote Synchronization**: Must be up-to-date with origin
- ✅ **Coverage Thresholds**: Tests must meet quality standards

| **Commit Type**    | **Action**        | **Version Bump** | **Security Checks** |
| ------------------ | ----------------- | ---------------- | ------------------- |
| `feat:`            | ✅ Auto-release   | `minor`          | ✅ All checks       |
| `fix:`             | ✅ Auto-release   | `patch`          | ✅ All checks       |
| `BREAKING CHANGE:` | ✅ Auto-release   | `major`          | ✅ All checks       |
| `chore:`, `docs:`  | ❓ Manual confirm | `patch`          | ✅ All checks       |

**Available Release Commands:**

```bash
# Automatic release (analyzes commits + security checks)
npm run release:auto

# Force release (bypasses safety checks - USE WITH CAUTION)
npm run release:auto -- --force

# Specific version bumps
npm run release:major
npm run release:minor
npm run release:patch

# Dry run mode (preview only)
npm run release:auto -- --dry-run
```

**Safety & Security Features:**

```bash
# ✅ Multi-layer protection system
git push origin main  # Triggers pre-push hook with security checks

# ✅ Coverage enforcement
npm run test:coverage:check  # Now enforces thresholds (was bypassed)

# ✅ Code quality analysis
npm run analyze:cognitive    # Cognitive complexity analysis
npm run analyze:complexity   # Cyclomatic complexity analysis
```

**Environment Detection:**

- **CI/CD**: Always auto-release without prompts
- **Local Dev**: Auto-release only for semantic commits (`feat:`, `fix:`, `BREAKING CHANGE:`)

## Dependency Categories

### Production Dependencies

```json
{
  "dependencies": {
    "@nestjs/core": "^11.0.1", // Framework dependencies
    "pg": "^8.16.3", // Database drivers
    "joi": "^17.13.3" // Runtime validation
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^22.8.7", // Type definitions
    "jest": "^29.7.0", // Testing framework
    "eslint": "^9.15.0" // Code quality tools
  }
}
```

### Peer Dependencies

- Use for optional integrations
- Document requirements clearly
- Avoid in core application dependencies

## Security Guidelines

### 1. Vulnerability Management

```bash
# Weekly security check
npm audit

# Monitor high-severity vulnerabilities
npm audit --audit-level high
```

### 2. Dependency Sources

- ✅ Use official npm registry
- ✅ Verify package authenticity
- ❌ Avoid packages with few downloads/maintainers
- ❌ Don't use packages with security warnings

### 3. Version Pinning Strategy

```json
{
  "dependencies": {
    "critical-package": "1.2.3", // Exact version for critical deps
    "stable-package": "^2.1.0", // Caret for stable packages
    "dev-tool": "~3.4.5" // Tilde for development tools
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Version Mismatch

```bash
# Symptoms: package.json and package-lock.json versions differ
# Solution:
npm install --package-lock-only
git add package-lock.json
git commit -m "fix: sync package-lock.json with package.json"
```

#### 2. Corrupted Lock File

```bash
# Nuclear option (use with caution)
rm -rf node_modules package-lock.json
npm install
```

#### 3. Dependency Conflicts

```bash
# Check for conflicts
npm ls

# Resolve with specific versions
npm install package@specific-version
```

### Enterprise Debugging

```bash
# Detailed dependency tree
npm ls --depth=3

# Check for outdated packages
npm outdated

# Verify package integrity
npm audit signatures
```

## Integration with Release System

Our automated release system includes package lock management:

1. **Pre-release validation**: Ensures package-lock.json is synchronized
2. **Version bumping**: Updates both package.json and package-lock.json
3. **Backup system**: Creates backups before dependency changes
4. **Rollback capability**: Restores previous state on failure

## Monitoring and Maintenance

### Weekly Tasks

- [ ] Run `npm audit` for security vulnerabilities
- [ ] Check `npm outdated` for dependency updates
- [ ] Review new dependency additions in PRs

### Monthly Tasks

- [ ] Update minor versions of dependencies
- [ ] Review and update development dependencies
- [ ] Audit package-lock.json size and complexity

### Quarterly Tasks

- [ ] Major dependency updates planning
- [ ] Security policy review
- [ ] Package management strategy assessment

## Tools and Scripts

### Custom NPM Scripts

```json
{
  "scripts": {
    "deps:check": "npm outdated",
    "deps:audit": "npm audit --audit-level moderate",
    "deps:clean": "rm -rf node_modules package-lock.json && npm install",
    "deps:verify": "npm ls --depth=0"
  }
}
```

### Git Hooks Integration

Our Husky setup includes:

- **Pre-commit**: Verify package-lock.json consistency
- **Post-merge**: Automatic npm install if package-lock.json changed

## Compliance and Governance

### Enterprise Standards

- ✅ All dependencies must be reviewed before addition
- ✅ Security vulnerabilities must be addressed within 48 hours
- ✅ Package-lock.json must always be committed
- ✅ Major updates require team approval

### Documentation Requirements

- Document all major dependency decisions
- Maintain changelog for dependency updates
- Review and approve dependency licenses

---

## Quick Reference

| Command                           | Purpose               | When to Use                      |
| --------------------------------- | --------------------- | -------------------------------- |
| `npm ci`                          | Clean install         | CI/CD, production deployment     |
| `npm install`                     | Install with updates  | Development, adding dependencies |
| `npm install --package-lock-only` | Update lock file only | After manual package.json edits  |
| `npm audit`                       | Security check        | Weekly maintenance               |
| `npm outdated`                    | Check for updates     | Monthly review                   |

For questions or issues with package management, refer to the development team lead or create an issue in the project repository.

## Environment Validation

### Automated Environment Checks

Use our environment validation script to ensure enterprise compliance:

```bash
# Complete environment check
npm run env:check

# Quick validation (minimal output)
npm run env:validate

# CI/CD compatible format
npm run env:check:ci
```

The validation checks:

- **Node.js & npm versions**: Compliance with `engines` requirements
- **Package-lock.json**: Presence, version consistency, lockfile format
- **Git Hooks**: Husky configuration for commit validation
- **Security**: High-risk vulnerabilities in dependencies

### Enforcement Matrix

| Component         | Minimum Version | Recommended | Auto-Check   |
| ----------------- | --------------- | ----------- | ------------ |
| Node.js           | 20.8.0          | 20.17.0+    | ✅ env:check |
| npm               | 10.0.0          | 11.0.0+     | ✅ env:check |
| package-lock.json | v3 format       | v3 format   | ✅ env:check |
| Git Hooks         | Husky 9.0+      | Husky 9.0+  | ✅ env:check |

### Pre-commit Integration

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run env:check:ci || exit 1
npm run lint:check || exit 1
npm run test:coverage:check || exit 1
```

### CI/CD Environment Validation

```yaml
# .github/workflows/ci.yml
jobs:
  environment-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - name: Validate Environment
        run: npm run env:check:ci
```

### Developer Setup Script

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "🚀 Setting up development environment..."

# Check Node/npm versions
npm run env:check

# Install dependencies
npm ci

# Setup Git hooks
npm run prepare

# Run initial validation
npm run quality

echo "✅ Development environment ready!"
```
