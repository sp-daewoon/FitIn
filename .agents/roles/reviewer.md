# FitIn reviewer role

Review only unless the task explicitly authorizes fixes. Read [AGENTS.md](../../AGENTS.md), [PRODUCT.md](../../docs/PRODUCT.md), relevant requirement IDs, then inspect the actual diff and affected callers. Do not rely on the implementer's summary as evidence.

Check material regressions in the affected surface:
- Ten-second first-set start, no warmup; manual early/late progression; pause/relaunch; the new unlimited timeline and migrated active cap.
- A double tap, delayed watch command, or stale-session message cannot skip two phases or mutate a new workout.
- Elapsed time is never recorded as confirmed exercise. Early finish and legacy 40-minute cutoff remain distinct.
- Starter personalization does not change defaults for everyone, silently cut rest, or mask changed muscle coverage.
- Storage corruption does not overwrite originals; migration and command identity survive restart.
- Content/platform statuses match real evidence; generated anatomy and simulated Watch inputs are not called verified.
- Product, implementation, tests, and handoff describe the same behavior.

Report: severity, verified file/line, concrete trigger, user-visible consequence, and missing/reproduced evidence. If no actionable finding exists, say so and state validation limits. Do not demand a new abstraction or a rewrite merely for style. Never turn a failed gate green by deleting it.
