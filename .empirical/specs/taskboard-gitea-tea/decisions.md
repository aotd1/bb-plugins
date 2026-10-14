# Accepted implementation decisions

- The user approved the researched plan and requested execution. Use the fresh isolated checkout and feat/taskboard-gitea-tea branch; an additional worktree would add no isolation here.
- Keep this as one source integration: schema, storage, adapter and UI must ship together for a usable Gitea source. Verification and documentation are part of the same change.
- tea 0.16.0 is installed, login aotd-git targets https://git.aotd.ru and live GET /version confirms Gitea 1.27.3. tea api supports JSON through stdin, so tokens need not be read by Taskboard.
- Use existing status/* labels and native Open/Closed states, matching GitLab's board vocabulary while avoiding implicit creation of new workflow labels.
- Add fields with empty defaults and append migrations; do not alter any migration already recorded by 0.3.4 or main.
- Install a distinct local pilot identity to avoid removing the existing managed Taskboard installation. Pilot identity adjustments are excluded from the upstream patch.
- GitHub publication is authorized only for a draft PR in aotd1/bb-plugins at this stage; upstream issue/PR follow seven days of actual use.

## D-001: Authenticated tea transport and isolated pilot

Status: Accepted

### Evidence

tea 0.16.0 exposes api with explicit login and stdin JSON support; the configured login successfully reads Gitea 1.27.3. Taskboard's adapter contract already supports issue list/detail/create/status operations.

### Options

Use tea api, read a tea token and call HTTP directly, or add a new token form. Install over the existing plugin or use a separate pilot identity.

### Chosen approach

Use explicitly scoped tea api without token extraction and install a separate pilot staging build. Keep all source, schema, migration, UI and CLI changes together in the approved feature branch.

### Trade-offs and risks

Subprocess calls require tea at runtime and bounded output. A separate pilot starts with empty settings. Current main has unreleased workflow features which need regression checks.

### Verification

Inject the CLI runner for paginated, mismatched-host, partial-write and uncertain-creation cases; verify storage migration with SQLite, build/typecheck, live test issues and browser screenshots.
