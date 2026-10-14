# Taskboard Gitea Tea

## Request

> Add a Gitea tracker to Taskboard through the installed tea CLI. Support explicitly scoped tea login and owner/repo, list and live issue/comment details, issue creation with labels assignees milestones due date when available, native open/closed and status/* label Kanban transitions, CLI and UI configuration, append-only database upgrades, meaningful tests and live verification. Work in this fresh isolated checkout and user-authorized feat/taskboard-gitea-tea branch. Create a draft PR only in our GitHub fork aotd1/bb-plugins and install a separate local pilot plugin identity. Do not create upstream issues or PRs until seven days of actual pilot use have elapsed.

## Goal

Browse and manage the user's self-hosted Gitea issues in Taskboard using tea's existing authenticated login, with repository isolation and no second token store.

## Acceptance Criteria

- [ ] [AC-1] Select Gitea for a BB project with explicit tea login and host-qualified owner/repo; reject mismatched login host, repository or issue locators before writes.
- [ ] [AC-2] List paginated issues excluding pull requests and fetch live descriptions/comments without exposing credentials.
- [ ] [AC-3] Create a reviewed issue with supported labels, assignees, milestone and due date; report ambiguous write outcomes without automatically retrying creation.
- [ ] [AC-4] Move issues through native Open/Closed and existing status/* labels, preserving unrelated labels; terminal moves close and nonterminal moves reopen.
- [ ] [AC-5] Existing Taskboard 0.3.4 and current-main storage upgrade using appended migrations without editing recorded statements or losing existing data.
- [ ] [AC-6] CLI configuration, refresh, list, show, transitions and move work for Gitea; other source contracts continue to validate.
- [ ] [AC-UI-1] [UI] Gitea appears in Manage, creation and board details, and the pilot UI is visibly operable at desktop and narrow panel sizes.
- [ ] [AC-7] Build/check receipts and live Gitea smoke evidence are retained. A separate pilot plugin is installed and a draft PR is published only in aotd1/bb-plugins.

## Scope

Taskboard source adapter, schemas, server wiring, project configuration storage, UI, CLI, source tests, documentation and local pilot installation. Existing isolated checkout and feat/taskboard-gitea-tea branch are authorized by the user.

## Non-goals

Jira Data Center support, direct token extraction, new automation behavior, upstream issue/PR publication before seven days of pilot use, marketplace publication or merging the PR. Do not modify the user's existing Gitea issues during verification; use a dedicated test repository.

## Risks

tea version/output differences, expired login, cross-host credential misuse, paginated resources, partial status writes, duplicate issues after transport failure, strict database CHECK constraints, unrelated unreleased upstream behavior, and local plugin identity collisions.

## Verification

Focused adapter and integration tests, migration upgrades with real SQLite, Taskboard typecheck/build/metadata validation, full repository checks, browser screenshots of Gitea Manage and board flow, and a live smoke against Gitea 1.27.3 via tea 0.16.0. Record pre-existing upstream check failures separately. Inspect the committed diff with fresh context before publishing the fork draft PR.

## Capability Deltas

Create one or more files under deltas/<capability>.md using ADDED, MODIFIED, or
REMOVED Requirements sections, named Requirement blocks, and concrete Scenario
examples. These merge into living specifications
after verification and review.
