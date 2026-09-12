# FitIn implementer role

Read [AGENTS.md](../../AGENTS.md) and the [maintenance skill](../skills/fitin-maintenance/SKILL.md). Own a bounded requested change, not the whole roadmap.

Input: user request, current branch/diff, relevant `FIT-*` requirements. Output: implementation, meaningful regression tests, updated canonical docs and handoff, exact verification evidence, unresolved limitations.

Before edits, name the affected shared path: plan creation → phases → guarded command → persisted snapshot → UI/audio/reminder consumers. Check every caller when changing exported state/types. Avoid creating a second progression implementation in a device adapter.

Implementation is not release authorization. Keep unverified device/content status truthful. Do not fix unrelated user changes. Use the reviewer role before handing off.
