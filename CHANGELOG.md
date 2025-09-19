## 1.6.0 (2025-09-19)

- feat(core): implement strong typing across codebase 4fa0839

## 1.5.0 (2025-09-19)

- chore(release): prepare release v1.5.0 b9c6901
- feat(core): standardize error messages to UPPERCASE_ENGLISH_WITH_UNDERSCORES format c715d63

## 1.5.0 (2025-09-19)

- feat(core): standardize error messages to UPPERCASE_ENGLISH_WITH_UNDERSCORES format c715d63

## 1.4.0 (2025-09-19)

- chore(release): prepare release v1.4.0 726afb6
- feat: implement generic service architecture with TypeORM integration 520d002

### BREAKING CHANGE

- Introduces new generic architecture pattern for scalable entity management

## 1.4.0 (2025-09-19)

- feat: implement generic service architecture with TypeORM integration 520d002

### BREAKING CHANGE

- Introduces new generic architecture pattern for scalable entity management

## 1.3.0 (2025-09-19)

- chore: remove test file and install missing conventional-changelog-cli 993b658
- chore(release): prepare release v1.3.0 1ccaed8
- feat: add more test content for release automation ca43c94
- feat: test automatic release system bbf1a2a

## 1.3.0 (2025-09-19)

- chore: remove test file and install missing conventional-changelog-cli 993b658
- feat: add more test content for release automation ca43c94
- feat: test automatic release system bbf1a2a

## 1.2.0 (2025-09-19)

- chore(release): prepare release v1.2.0 354e385
- feat(release): implement complete workflow system dbd906f
- fix(core): optimize pre-push hook and improve release automation cd94773

## 1.2.0 (2025-09-19)

- feat(release): implement complete workflow system ([dbd906f](https://github-privato/awesomecit/todo/commit/dbd906f))
- fix(core): optimize pre-push hook and improve release automation ([cd94773](https://github-privato/awesomecit/todo/commit/cd94773))

## 1.0.0 (2025-09-19)

- chore: updated copilot-instructions ([08336e3](https://github-privato/awesomecit/todo/commit/08336e3))
- chore(release): bump version to 1.0.0 ([0716442](https://github-privato/awesomecit/todo/commit/0716442))
- docs: add comprehensive merge workflow guide ([4108c2f](https://github-privato/awesomecit/todo/commit/4108c2f))
- docs: move emergency bypass commands to README ([a000176](https://github-privato/awesomecit/todo/commit/a000176))
- docs: update documentation ([c04466b](https://github-privato/awesomecit/todo/commit/c04466b))
- docs: update TODO list and package management documentation ([f8ef850](https://github-privato/awesomecit/todo/commit/f8ef850))
- docs: updated ([e381de7](https://github-privato/awesomecit/todo/commit/e381de7))
- docs: updated documentation with learning/labs section ([fc6de31](https://github-privato/awesomecit/todo/commit/fc6de31))
- docs: updated documentatios ([67b7e92](https://github-privato/awesomecit/todo/commit/67b7e92))
- docs: updated project TODO list ([e0e4691](https://github-privato/awesomecit/todo/commit/e0e4691))
- docs(release): add comprehensive unified release system documentation ([e0250dc](https://github-privato/awesomecit/todo/commit/e0250dc))
- feat: add comprehensive database integration testing suite ([f68df9c](https://github-privato/awesomecit/todo/commit/f68df9c))
- feat(divisions): implement TDD-based divisions management system (task 1.1.1) ([135b597](https://github-privato/awesomecit/todo/commit/135b597))
- feat(release): add version consistency validation ([b050221](https://github-privato/awesomecit/todo/commit/b050221))
- feat(release): align all release scripts to auto-release system ([b341060](https://github-privato/awesomecit/todo/commit/b341060))
- feat(security): enhance release system with comprehensive safety checks ([8a9fd2f](https://github-privato/awesomecit/todo/commit/8a9fd2f))
- feat(tests): Complete comprehensive test coverage ([410c2cc](https://github-privato/awesomecit/todo/commit/410c2cc))
- fix: prevent pre-push hook from running on branch deletion ([99c1bbb](https://github-privato/awesomecit/todo/commit/99c1bbb))
- fix(config): adjust branches threshold to match jest calculation ([ddc963d](https://github-privato/awesomecit/todo/commit/ddc963d))
- fix(release): handle 'auto' release type parameter correctly ([47d535d](https://github-privato/awesomecit/todo/commit/47d535d))
- test: missing transform response test ([2243307](https://github-privato/awesomecit/todo/commit/2243307))

### BREAKING CHANGE

- Coverage thresholds now actively enforced - may break existing CI/CD if coverage is below thresholds
- Introduces new dual identification system for entities (uuid + code)

Implements complete TDD Red-Green-Refactor cycle:

- RED: Comprehensive test suite created first (divisions.controller.spec.ts)
- GREEN: Minimal implementation to make all tests pass
- Tests: 29 tests covering CRUD, validation, error handling, business logic

Files added/modified:

- Base entity architecture: base.entity.ts, master-base.entity.ts
- Division module: divisions.controller.ts, divisions.service.ts, divisions.module.ts
- Entity: division.entity.ts with hierarchical relationships
- DTOs: create/update/query DTOs with comprehensive validation
- Tests: Full TDD test suite with Given-When-Then pattern
- Utils: timezone-manager, case-converter, division-manager services
- Config: Enhanced Copilot instructions for TDD enforcement

* Pre-push hook behavior now differentiates between
  code pushes and branch management operations
* Release process now validates version consistency by default
* release scripts now use auto-release system instead of standard-version

## 1.2.0 (2025-09-19)

- feat(release): implement complete workflow system ([dbd906f](https://github-privato/awesomecit/todo/commit/dbd906f))
- fix(core): optimize pre-push hook and improve release automation ([cd94773](https://github-privato/awesomecit/todo/commit/cd94773))

## 1.0.0 (2025-09-19)

- chore: updated copilot-instructions ([08336e3](https://github-privato/awesomecit/todo/commit/08336e3))
- chore(release): bump version to 1.0.0 ([0716442](https://github-privato/awesomecit/todo/commit/0716442))
- docs: add comprehensive merge workflow guide ([4108c2f](https://github-privato/awesomecit/todo/commit/4108c2f))
- docs: move emergency bypass commands to README ([a000176](https://github-privato/awesomecit/todo/commit/a000176))
- docs: update documentation ([c04466b](https://github-privato/awesomecit/todo/commit/c04466b))
- docs: update TODO list and package management documentation ([f8ef850](https://github-privato/awesomecit/todo/commit/f8ef850))
- docs: updated ([e381de7](https://github-privato/awesomecit/todo/commit/e381de7))
- docs: updated documentation with learning/labs section ([fc6de31](https://github-privato/awesomecit/todo/commit/fc6de31))
- docs: updated documentatios ([67b7e92](https://github-privato/awesomecit/todo/commit/67b7e92))
- docs: updated project TODO list ([e0e4691](https://github-privato/awesomecit/todo/commit/e0e4691))
- docs(release): add comprehensive unified release system documentation ([e0250dc](https://github-privato/awesomecit/todo/commit/e0250dc))
- feat: add comprehensive database integration testing suite ([f68df9c](https://github-privato/awesomecit/todo/commit/f68df9c))
- feat(divisions): implement TDD-based divisions management system (task 1.1.1) ([135b597](https://github-privato/awesomecit/todo/commit/135b597))
- feat(release): add version consistency validation ([b050221](https://github-privato/awesomecit/todo/commit/b050221))
- feat(release): align all release scripts to auto-release system ([b341060](https://github-privato/awesomecit/todo/commit/b341060))
- feat(security): enhance release system with comprehensive safety checks ([8a9fd2f](https://github-privato/awesomecit/todo/commit/8a9fd2f))
- feat(tests): Complete comprehensive test coverage ([410c2cc](https://github-privato/awesomecit/todo/commit/410c2cc))
- fix: prevent pre-push hook from running on branch deletion ([99c1bbb](https://github-privato/awesomecit/todo/commit/99c1bbb))
- fix(config): adjust branches threshold to match jest calculation ([ddc963d](https://github-privato/awesomecit/todo/commit/ddc963d))
- fix(release): handle 'auto' release type parameter correctly ([47d535d](https://github-privato/awesomecit/todo/commit/47d535d))
- test: missing transform response test ([2243307](https://github-privato/awesomecit/todo/commit/2243307))

### BREAKING CHANGE

- Coverage thresholds now actively enforced - may break existing CI/CD if coverage is below thresholds
- Introduces new dual identification system for entities (uuid + code)

Implements complete TDD Red-Green-Refactor cycle:

- RED: Comprehensive test suite created first (divisions.controller.spec.ts)
- GREEN: Minimal implementation to make all tests pass
- Tests: 29 tests covering CRUD, validation, error handling, business logic

Files added/modified:

- Base entity architecture: base.entity.ts, master-base.entity.ts
- Division module: divisions.controller.ts, divisions.service.ts, divisions.module.ts
- Entity: division.entity.ts with hierarchical relationships
- DTOs: create/update/query DTOs with comprehensive validation
- Tests: Full TDD test suite with Given-When-Then pattern
- Utils: timezone-manager, case-converter, division-manager services
- Config: Enhanced Copilot instructions for TDD enforcement

* Pre-push hook behavior now differentiates between
  code pushes and branch management operations
* Release process now validates version consistency by default
* release scripts now use auto-release system instead of standard-version

## <small>0.7.1 (2025-09-17)</small>

- fix: clean up working directory after failed release ([073a502](https://github-privato/awesomecit/todo/commit/073a502))
- fix: prevent infinite loop in pre-push hook and optimize release logic ([6d09bff](https://github-privato/awesomecit/todo/commit/6d09bff))

## 0.7.0 (2025-09-17)

- chore(release): bump version to 0.7.0 ([0ee6ac6](https://github-privato/awesomecit/todo/commit/0ee6ac6))
- feat: add intelligent auto-release for semantic commits ([4c879e2](https://github-privato/awesomecit/todo/commit/4c879e2))

## 0.5.0 (2025-09-17)

- fix: fixed error in json parsig for release-analyzer ([2796d9a](https://github-privato/awesomecit/todo/commit/2796d9a))
- fix(ci): remove deprecated Husky directives ([cd94244](https://github-privato/awesomecit/todo/commit/cd94244))
- docs: add comprehensive development guides and update project requirements ([ed5174e](https://github-privato/awesomecit/todo/commit/ed5174e))
- docs: add initial release notes structure ([39f2535](https://github-privato/awesomecit/todo/commit/39f2535))
- docs: basic project documentation integration ([62a7fcc](https://github-privato/awesomecit/todo/commit/62a7fcc))
- docs: integrated copilot project documentation ([c378c6c](https://github-privato/awesomecit/todo/commit/c378c6c))
- docs: integrated full documentation changer and new resources ([5c4cc0f](https://github-privato/awesomecit/todo/commit/5c4cc0f))
- feat(release): implement pre-push release hook and auto-release script ([4738920](https://github-privato/awesomecit/todo/commit/4738920))
- feat(release): implement semantic release analyzer and version calculator ([6d37965](https://github-privato/awesomecit/todo/commit/6d37965))
- feat(test): implement comprehensive TDD workflow with coverage enforcement ([54a6d5d](https://github-privato/awesomecit/todo/commit/54a6d5d))
- build: add automated release notes generation script ([4ff0de2](https://github-privato/awesomecit/todo/commit/4ff0de2))
- build: add comprehensive development and release automation scripts ([68011d8](https://github-privato/awesomecit/todo/commit/68011d8))
- build: enhance code quality with stricter ESLint rules and comprehensive Prettier config ([a1eb306](https://github-privato/awesomecit/todo/commit/a1eb306))
- build(release): enhance commitlint config and add semantic release scripts ([2962bfd](https://github-privato/awesomecit/todo/commit/2962bfd))
- refactor: improve code quality and clean code compliance ([e6896f5](https://github-privato/awesomecit/todo/commit/e6896f5))
- Initial commit ([77c8cd3](https://github-privato/awesomecit/todo/commit/77c8cd3))
