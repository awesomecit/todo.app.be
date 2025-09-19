# Test Release Automation

This is a test file to verify that the automated release system works correctly with feat commits.

The system should:

1. Detect this as a semantic commit (feat)
2. Increment the minor version (1.0.0 → 1.1.0)
3. Create appropriate tags
4. Update package.json and package-lock.json
