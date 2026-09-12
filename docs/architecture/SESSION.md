# Session architecture and invariants

## Ownership

`src/workout.ts` is the platform-independent owner of planning, phase positions, command acceptance and history semantics. `src/useWorkout.ts` coordinates UI state, persistence and platform effects. `App.tsx` renders and issues commands; it must not implement an alternative timer. `src/Harness.tsx` is an isolated in-memory virtual session for developer inputs, not the AI harness itself.

## Clock

Phases have stable IDs (`index:machine:work:set`, `index:machine:rest:set`, move and prepare; legacy IDs are preserved). `elapsedAt = persisted elapsed + nonnegative wall-clock delta since anchor`, unless paused, bounded by `sessionLimit`: new sessions carry `timeLimit: null` (no cap); migrated v2/v3 sessions carry 2400. `position` resolves the phase from durations and terminates at either end of timeline or cap. UI ticks update display only. Snapshot anchors survive restart.

`next`: truncate the current duration to elapsed-in-phase; confirm only work phases. `extend`: append up to 30 seconds to current phase without crossing the active cap. `pause/resume`: snapshot elapsed and re-anchor. No filler is appended after early completion.

Known limitation: device wall-clock changes can affect progress; backward deltas are clamped, but the implementation does not yet reconcile arbitrary clock changes across restart. Native monotonic/background reconciliation is a future explicit task, not something tests currently prove.

## Command contract

Command: `{ id, sessionId, phaseId, revision, source, type, at }`.

- Source is app/watch/headphones/harness; source never determines alternate progression semantics.
- Session mismatch, outdated phase/revision, repeated ID, or invalid time is rejected.
- Every accepted mutation increments revision. A bounded list retains recent IDs; revision prevents old IDs becoming valid after eviction.
- A late message must be timestamped at receipt by the authoritative adapter; do not trust remote device clocks to replay a command into a past phase.
- Watch reconnect strategy: request current snapshot, discard stale UI commands, and retry with new explicit user input. No queued blind “next” replay.
- Reordering is restricted to unstarted exercise blocks and retains stable IDs/settings. Reordering invalidates old revisions.

## History and planning

`finish` clears the active session idempotently and records routine/budget/stopped reason, active elapsed, explicit confirmed count and performed exercise IDs. Auto progression alone cannot prove exercise or advance the current simple cycle. No final physiology-aware recommender exists yet.

Starter substitution prefers same pattern, then same target area, then an available slot. This heuristic can change balance; show the replacement, never call it biomechanically optimal. Skill/reviewer changes must evaluate this contract when adding personalized planning.

## Persistence

`src/codec.ts`: validate unknown JSON before use. `src/storage.ts`: AsyncStorage key `fitin.v4`, explicitly reading/migrating v3 then v2 when v4 is absent, serialized writes, no parse-error reset. Load failure leaves app in read failure state and avoids writes. Save failure exposes retry. Old `fitin.v1` is retained separately and reported to the user; migration of old active sessions is intentionally not automatic.

For a schema change: introduce an explicit version path; define fixtures; preserve original data on failure; test paused/extended/early-completed sessions and stale command delivery after reload. Do not simply rename fields and bump the version.

## Effects and validation scope

Announcements occur on phase changes, beeps on working-set seconds 5..1. Foreground speech is separate from scheduled background notifications. Manual changes cancel/reschedule notifications. Unit tests cover engine and codec; a web export only verifies bundling. Actual speaker, headphone, interrupt, locked-screen and native lifecycle behavior require the platform acceptance matrix.
