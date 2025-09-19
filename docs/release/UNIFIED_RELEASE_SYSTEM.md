# Unified Release System Documentation

## Overview

The project now uses a completely unified release system powered by `auto-release.js`. All release scripts in `package.json` have been migrated from `standard-version` to use this new system, providing consistent behavior and advanced validation features.

## Available Release Scripts

### Standard Release Scripts

```bash
# Analyze commits and automatically determine release type
npm run release

# Specific version bumps
npm run release:patch    # Bug fixes (0.0.X)
npm run release:minor    # New features (0.X.0)
npm run release:major    # Breaking changes (X.0.0)
```

### Dry Run Scripts

```bash
# Preview what would happen without making changes
npm run release:dry
npm run release:dry:patch
npm run release:dry:minor
npm run release:dry:major
```

### Force Scripts

```bash
# Override safety checks (use with caution)
npm run release:force
npm run release:force:patch
npm run release:force:minor
npm run release:force:major
```

## System Features

### Automated Version Consistency Validation

The system validates version consistency across:

- `package.json`
- `package-lock.json`
- Git remote tags

If inconsistencies are detected, the release is blocked with detailed error messages.

### Security Checks

Before each release, the system performs:

- ✅ Branch verification (must be on main/master)
- ✅ Working directory cleanliness check
- ✅ Remote synchronization verification
- ✅ Version consistency validation

### Automated Triggering

The system automatically triggers releases during `git push` operations when:

- Pushing to main/master branch
- Commit message contains semantic keywords (`feat:`, `fix:`, `BREAKING CHANGE:`)
- All safety checks pass

## Command Examples

```bash
# Let the system decide the release type based on commits
npm run release

# Force a specific version type
npm run release:minor

# Preview changes without making them
npm run release:dry

# Override safety checks (emergency releases)
npm run release:force:patch
```

## Error Handling

The system provides detailed error messages for common issues:

- **Version Mismatch**: Detailed report of inconsistencies between package.json, package-lock.json, and Git tags
- **Dirty Working Directory**: Lists uncommitted files that need attention
- **Branch Issues**: Guidance on proper branch usage
- **Remote Sync Issues**: Instructions for resolving synchronization problems

## Migration from standard-version

All scripts have been successfully migrated:

| Old Script                            | New Script                       | Functionality            |
| ------------------------------------- | -------------------------------- | ------------------------ |
| `standard-version`                    | `auto-release.js --type="auto"`  | Automatic type detection |
| `standard-version --release-as patch` | `auto-release.js --type="patch"` | Patch release            |
| `standard-version --release-as minor` | `auto-release.js --type="minor"` | Minor release            |
| `standard-version --release-as major` | `auto-release.js --type="major"` | Major release            |
| `standard-version --dry-run`          | `auto-release.js --dry-run`      | Preview mode             |

## Best Practices

1. **Always test with dry-run first**: `npm run release:dry`
2. **Let the system auto-detect**: Use `npm run release` when possible
3. **Keep branches synchronized**: Always pull before releasing
4. **Review changes**: Check CHANGELOG.md after each release
5. **Use force sparingly**: Force scripts bypass safety checks

## Troubleshooting

### Version Consistency Issues

If you see version mismatch errors:

1. Check `package.json` and `package-lock.json` versions
2. Compare with latest Git tags: `git tag --sort=-v:refname | head -5`
3. Run `npm install` to sync package-lock.json if needed
4. For manual fixes, use `npm run release:force` with caution

### Remote Synchronization

If the system reports synchronization issues:

1. Pull latest changes: `git pull`
2. Resolve any conflicts
3. Retry the release

### Emergency Releases

For urgent releases that need to bypass checks:

1. Use force variants: `npm run release:force:patch`
2. Manually verify all changes after release
3. Document the reason in commit/tag messages

## System Architecture

The unified system consists of:

- **auto-release.js**: Core release automation
- **release-analyzer.js**: Commit analysis and type detection
- **version-calculator.js**: Version increment logic
- **Pre-push hooks**: Automated triggering on semantic commits

All scripts share the same validation logic, ensuring consistent behavior across manual and automated releases.
