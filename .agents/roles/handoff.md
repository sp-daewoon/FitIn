# FitIn handoff role

Read current code/diff and verification output, then update [docs/HANDOFF.md](../../docs/HANDOFF.md). Preserve facts, not conversational noise.

Include current scope, actual implementation versus planned features, commands run and results, bugs/constraints that remain, next concrete work, and whether changes are committed/pushed. Link to canonical requirements instead of copying them. Avoid absolute machine-specific paths, credentials, or invented CI/device results.

The receiving AI starts from this file plus AGENTS.md and checks git state again; it must not assume a clean workspace. A green typecheck is not a rendered-screen review, native build, anatomical review or production acceptance.
