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

#### 1. Package Lock File Management

```bash
# ✅ CORRECT: Always commit package-lock.json
git add package-lock.json
git commit -m "chore: update package-lock.json"

# ❌ INCORRECT: Never ignore package-lock.json in enterprise
echo "package-lock.json" >> .gitignore  # DON'T DO THIS
```

#### 2. Dependency Installation

```bash
# ✅ Production installations (CI/CD, production servers)
npm ci

# ✅ Development with new dependencies
npm install

# ✅ Update package-lock after package.json changes
npm install --package-lock-only
```

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
