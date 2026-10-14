# Security consult

- Specialist: security
- Verdict: advisory

## Focused assessment

Reviewed the specification, design and Gitea capability delta for reachable
abuse paths. An untrusted issue locator or repository could otherwise redirect
an authenticated request. The design rejects foreign hosts and repositories,
uses fixed repository-relative endpoints and an explicit tea login, and checks
returned issue URLs. It uses argv execution and stdin JSON rather than shell
interpolation or token extraction. Tracker text remains within the existing
untrusted-context boundary.

No blocking finding in the specified data flow. Keep the existing absolute
executable checks, bounded subprocess output and deliberate environment
forwarding. The local tea login and executable installation remain trusted
host configuration. Partial status writes and uncertain creation are explicit
reliability limitations; automatic creation retries are excluded.

## Verification basis

The acceptance criteria require foreign-scope rejection before writes,
credential-free transport and independent review. Subsequent QA must retain
the host/locator rejection and ambiguous-write test outcomes together with
live creation/status checks. This advisory is a focused design assessment,
not a penetration test or a replacement for those execution results.
