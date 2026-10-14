# Implementation plan

1. Add Gitea source/config schemas with backward-compatible defaults; implement a bounded, explicit-login tea runner and scoped issue adapter.
2. Append SQLite source/config migrations and wire defaults, project revisions, adapter selection, creation metadata and CLI flags.
3. Expose Gitea in Manage and source glyph/name controls; document prerequisites, workflow and limitations.
4. Add adapter/scoping/write-failure and migration regressions, run Taskboard checks and full workspace checks, and repair only feature-caused failures.
5. Create a dedicated Gitea pilot repository, exercise live issue creation/list/detail/status operations and retain evidence.
6. Build/install a separate pilot staging copy, verify CLI and human UI with screenshots, review the committed patch with fresh context and publish a draft PR in the fork.
7. Record the pilot start date and seven-day review window; upstream publication remains deferred until actual usage evidence is available.

## Affected tests

- plugins/taskboard/test/sources-gitea.test.ts
- plugins/taskboard/test/gitea-integration.test.ts
- plugins/taskboard/test/contract.test.ts
- plugins/taskboard/test/app-ui.test.ts
- plugins/taskboard/test/filter-presets-backend.test.ts
- plugins/taskboard/test/create-metadata.test.ts
- plugins/taskboard/test/distribution.test.ts

## Validation

Run adapter and source integration fixtures, real SQLite migration preservation tests, Taskboard typecheck/build/metadata checks, full workspace checks, live Gitea test-repository smoke and desktop/narrow-panel browser verification. Record commands, outputs, screenshots and source revision accurately; do not claim unexecuted checks.
