# Review corrections — 2026-10-14

- Status changes delete only obsolete workflow labels and add the selected one.
  Concurrent additions/removals of ordinary labels survive. HTTP 204 label
  deletion succeeds; failed writes report partial outcomes without retrying.
- Native issue state determines whether terminal workflow labels apply. An
  externally reopened issue with a retained done/canceled label is actionable
  as Open, and only Open is marked as its current transition.
- All paginated resources continue until an empty page, including servers that
  cap results below the requested page size. The 200-page safety bound remains.
- Shared RPC contracts use type-only SDK imports and `as const satisfies`.
  Runtime schemas and exact SDK devDependency are preserved; frontend builds
  no longer need the omitted development SDK package.

## Validation

- Node 24.21.0 Taskboard check: 228 tests, typecheck, SDK pin check, build and
  build-metadata validation passed. Six new tests cover the review findings.
- Full workspace run: 629 test executions; only two host-monitor process tests
  failed with sandbox `spawn EPERM`. The entire host-monitor check was rerun
  outside the sandbox: 161 tests and its type/build checks passed.
- The trailing dockside check (skipped by the failed chained root command)
  ran separately: 222 test executions passed. Thus all workspace checks have
  successful results, with the sandbox exception explicitly accounted for.
- Standalone source copy outside the workspace: `npm install --omit=dev
  --omit=optional --ignore-scripts`, followed by the running BB's plugin build,
  succeeded with no SDK package installed in that copy.
- Active local Taskboard rebuilt and reloaded, status running. Real dedicated
  pilot issue: Done → externally reopen while retaining status/done → Open →
  in-progress. Correct categories and current transition confirmed; ordinary
  pilot label retained; initial state restored. Refresh returned all 3 issues.
- Upstream main fetched; feature branch was current with no merge conflicts.

Earlier desktop/mobile UI and migration receipts remain historical evidence.
This correction iteration does not claim a new independent review or a
completed seven-day pilot. Upstream publication remains deferred.
