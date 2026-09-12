# Routine expansion and first native build · development

The user's latest request supersedes the 40-minute policy in historical 0.0.1/0.0.2 notes and the earlier builder brief. Published tags remain immutable.

- Seven program choices live in “내 루틴”: machine full-body A/B, upper/lower, PPL, fixed full-body, mixed freeweight full-body A/B, torso/limbs, and chest-back/shoulder-arms/legs. Visit order advances through the shared engine only after a routine finish with explicit performance.
- New generated plans use five distinct movements, five sets and editable 60-second work windows: 25 minutes of planned work, plus rest/transitions. These are user-requested product examples, not a minimum effective dose or guaranteed actual lifting time. They are not mandatory for a beginner; users may reduce sets/duration or finish early.
- Legacy difficulty values remain readable but no longer appear as a functional selector. Load, repetitions, technique and recovery matter beyond a difficulty label; individualized progression is still unimplemented.
- Program switching preserves stored templates and starter choices. New defaults never overwrite a custom plan or active snapshot.
- New sessions use `timeLimit: null` and run the whole saved plan including finishers. Old sessions retain `timeLimit: 2400`. Work, rest and total time are displayed separately. No rest compression or silent truncation.
- `fitin.v4` explicitly migrates v2/v3 in memory and preserves original keys. Paused sessions, phase IDs and command deduplication survive migration.
- The image-backed Watch component is a phone-rendered preview using the shared engine, clearly marked as disconnected. It does not establish a native watchOS target or WatchConnectivity.

Validation: `tests/program-upgrade.test.ts` covers long-session pause/reload/completion, legacy paused migration, unchanged equipment across legacy levels and preserved shorter custom goals. `tests/planning.test.ts` covers all seven cycles and work-time/unique-movement constraints. Use normal check and web export gates. Native execution evidence belongs in the current handoff, not in a guessed platform status.
