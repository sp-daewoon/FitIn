---
name: fitin-maintenance
description: Develop, fix, or review FitIn while preserving workout progression, local records, product boundaries, and truthful platform verification. Use for changes in this repository, including another AI resuming maintenance; not for unrelated fitness advice or other projects.
---

# FitIn maintenance

Repository root is three directories above this file's folder. Read [AGENTS.md](../../../AGENTS.md), [current handoff](../../../docs/HANDOFF.md), and [product contract](../../../docs/PRODUCT.md) first. User instructions can supersede old decisions; do not turn an individual exercise preference into a service-wide rule.

## Route the change

- **Time/progression/remote commands:** read [session architecture](../../../docs/architecture/SESSION.md). Change `src/workout.ts`, then exercise explicit next, late delivery, duplicate commands, pause/relaunch and both unlimited new sessions and the migrated 40-minute boundary. UI/Watch must call this engine.
- **Persistence:** read that architecture's storage section. Preserve unreadable originals, use a versioned key and explicit migration. Test decode and state roundtrip; never clear storage on parse failure.
- **Exercise selection/UI:** read [product contract](../../../docs/PRODUCT.md). Keep the machine default, optional generic starter selection, target-muscle imagery and small timer. Show time/selection consequences. Generation does not make imagery anatomically verified.
- **Locale/session layout:** Korean and English must preserve image/control geometry through prepare, work, rest and explicit next. Run `npm run test:layout -- <local-export-url>` after a web export for phase-layout changes. Keep exercise/routine IDs independent of translated labels.
- **Accounts/cloud routines:** read [Supabase plan](../../../docs/architecture/SUPABASE.md). Optional accounts are authorized; keep guest workouts offline, isolate caches by account, preserve local originals and use revision conflicts instead of blind overwrites. Run `npm run test:rls` for policy changes; mocked Auth in isolated Postgres does not verify real providers or Supabase deployment.
- **Catalog expansion (FIT-013):** preserve existing exercise IDs and atlas slots. Update the catalog metadata, image manifest and static atlas sources together. Run `tests/catalog.test.ts` through the normal check gate: new selections must round-trip in local data, preserve legacy timing and validate new plans and map to the correct image. Do not change default routines just because the catalog grows.
- **Audio/native/Watch:** read [platform boundaries](../../../docs/architecture/PLATFORMS.md). Simulator, mocked input and web evidence cannot certify AirPods, background audio or watch connectivity.
- **Programs/videos/Health:** use `routineCycle` and `resolvePlan` for previews as well as today's plan. Future visits are conditional, not dated prescriptions. Follow [content sources](../../../docs/CONTENT_SOURCES.md) for external references and [HealthKit plan](../../../docs/architecture/HEALTH.md) for native health work. Never convert source-page checks to playback verification or planned HealthKit support to connected status.
- **PPL guidance (FIT-017):** preserve its push/pull/legs role coverage and the current duration policy; alternatives substitute rather than accumulate. Weekly modes are examples, not persisted scheduling. Run `tests/ppl.test.ts`; changing presets must not mutate active snapshots or saved overrides. The third atlas is 2×2 rather than 3×3, so update manifest and renderer together when expanding it.
- **Routine builder (FIT-018):** read [the implementation brief](../../../docs/releases/post-0.0.1-routine-builder.md) before changing plan storage. Keep the persistent goal template separate from today's copy; explicit finishers may duplicate a movement, default plans may not. Global rest and per-exercise work duration must show timing consequences. New sessions run the entire template, with no time cap; migrated sessions keep their original cap. Read [current expansion contract](../../../docs/releases/routine-expansion.md). This feature is implemented.
- **Exercise art (FIT-009/FIT-013):** use [the exercise art skill](../fitin-exercise-art/SKILL.md). Never clip an atlas on an even grid; the generator does not keep figures inside equal cells. Measure with `scripts/measure-atlas.mjs` and let `npm run check` confirm it.
- **Review only:** follow [reviewer role](../../roles/reviewer.md). Report actionable regressions and missing evidence; do not silently implement fixes.

## Make the change reviewable

1. Identify affected `FIT-*` requirements in [requirements.json](../../../docs/requirements.json), relevant callers, and the smallest observable before/after behavior.
2. For bug fixes, reproduce the failure with a test before changing the shared path. For new behavior, test meaningful boundaries rather than copying implementation expressions.
3. Implement in the owning module. Do not rewrite unrelated code or change product scope just to simplify a patch.
4. Run `npm run check`; run `npm run build:web` for screen/native/dependency changes. Record actual outputs and limitations. Native acceptance uses the manual matrix, not a mocked pass.
5. Update the canonical requirement/decision when behavior changed and [HANDOFF.md](../../../docs/HANDOFF.md) with evidence and unfinished work. Review against the product contract before committing.

If a tool/SDK is unavailable, finish independent local work and report the concrete missing validation. Do not request extra permission for already-authorized routine changes. Do not mark a release ready while `npm run release:check` fails.
