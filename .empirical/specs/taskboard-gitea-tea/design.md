# Gitea source design

Implement WorkSourceAdapter in sources/gitea.ts. A project stores a tea login name and a host-qualified repository (host/owner/repo). Resolve the configured login URL from tea's public login-list JSON, never from its token-bearing configuration file. Reject a repository host or issue locator outside that exact destination. Use an access-checked absolute tea binary, argv execFile and bounded time/output; send JSON write bodies through stdin. All authenticated transport remains tea api with an explicit --login argument.

List pages until exhausted with a bounded page cap. Parse Gitea responses at the boundary, exclude pull_request entries and fetch issue comments separately. Native issue state and repository status/* labels drive workflow choices. Status writes replace only workflow labels, preserve other label IDs, and reconcile with live details. A partial write is reported and read back; creation is never automatically retried after an uncertain result. Existing label options determine available workflow stages; ordinary unlabeled issues retain Open/Closed choices.

Extend schemas, project view and mutation defaults, RPCs, server source adapters, Create issue destination metadata, CLI flags, Manage UI and source glyph. Persist gitea_login and gitea_project_ref through appended migrations which rebuild constrained tables and restore indexes, preserving prior statement bytes. New schema fields default empty for compatibility with existing callers and fixtures.

The source branch preserves normal Taskboard identity. A local staging copy outside Git gets a pilot-only manifest/CLI/channel identity and independent SQLite storage. Validate its source rewrite and build before installation. Use the current main base for the upstream-ready patch, so new unpublished behavior remains a pilot risk.

Test with an injected tea runner and real SQLite migrations. Live smoke uses a dedicated owned Gitea test repository; do not mutate existing repositories. Browser evidence verifies settings and board/create flows. Publish a draft PR in the user's fork only; keep the seven-day upstream publication boundary explicit.
