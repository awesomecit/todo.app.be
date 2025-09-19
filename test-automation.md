# Release Automation Test

This file is used to test the automated release workflow system.

## Expected Behavior

When a `feat` commit is made, the system should:

1. **Analyze commits** - Detect semantic commits since last tag
2. **Update package files** - Increment version in package.json and package-lock.json
3. **Generate documentation** - Create changelog and release notes
4. **Commit release files** - Commit the updated files with release preparation message
5. **Create and push tag** - Create annotated tag and push to remote

## Test Scenario

This commit will test the minor version increment:

- Current version: 1.0.0
- Expected new version: 1.1.0 (due to feat commit)

## Workflow Steps

The pre-push hook should:

1. Detect the feat commit
2. Trigger the workflow release mode
3. Execute all steps automatically
4. Complete with success

## Validation

After execution, verify:

- [ ] package.json version updated to 1.1.0
- [ ] package-lock.json version updated to 1.1.0
- [ ] CHANGELOG.md contains new entry
- [ ] RELEASE_NOTES.md updated
- [ ] Git tag v1.1.0 created and pushed
- [ ] Release commit created

---

_This test validates the complete automated release workflow integration._
