# Taskboard Gitea Specification

## Purpose

Enable Taskboard to browse and manage explicitly scoped self-hosted Gitea issues through tea while preserving existing storage and credentials.

## Requirements

### Requirement: Gitea through tea

Taskboard SHALL support a project-scoped Gitea source using an explicit tea login and host-qualified repository. It SHALL use tea api for authenticated requests without reading or persisting tokens.

#### Scenario: Read a self-hosted repository

- **WHEN** the project selects a tea login for git.aotd.ru and its owner/repository
- **THEN** paginated issues, live issue detail and comments are available in the list, board, mentions and CLI
- **AND** pull requests are excluded and foreign host/repository locators are rejected.

### Requirement: Gitea issue writes

Taskboard SHALL create reviewed issues with supported native metadata and move issues through native states and status/* label stages while preserving unrelated labels. An ambiguous creation result SHALL NOT be automatically retried.

#### Scenario: Complete and resume work

- **WHEN** a user moves an issue to status/done and then status/in-progress
- **THEN** it closes and reopens respectively
- **AND** unrelated labels remain attached.

### Requirement: Additive storage and pilot boundary

The Gitea source SHALL use only appended database migrations. The local pilot SHALL use a separate plugin identity and the upstream patch SHALL retain Taskboard's existing identity.

#### Scenario: Upgrade and trial

- **WHEN** existing Taskboard data is upgraded and the local pilot is installed
- **THEN** existing settings and issues remain intact
- **AND** upstream publication waits for seven days of actual trial use.
