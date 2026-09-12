---
name: fitin-maintenance
description: Develop, fix, or review FitIn while preserving workout progression, local records, product boundaries, and truthful platform verification. Use for changes in this repository, including another AI resuming maintenance; not for unrelated fitness advice or other projects.
---

# FitIn maintenance

Repository root is three directories above this file's folder. Read [AGENTS.md](../../../AGENTS.md), [current handoff](../../../docs/HANDOFF.md), and [product contract](../../../docs/PRODUCT.md) first. User instructions can supersede old decisions; do not turn an individual exercise preference into a service-wide rule.

## Route the change

- **Time/progression/remote commands:** read [session architecture](../../../docs/architecture/SESSION.md). Change `src/workout.ts`, then exercise explicit next, late delivery, duplicate commands, pause/relaunch and the 40-minute boundary. UI/Watch must call this engine.
- **Persistence:** read that architecture's storage section. Preserve unreadable originals, use a versioned key and explicit migration. Test decode and state roundtrip; never clear storage on parse failure.
- **Exercise selection/UI:** read [product contract](../../../docs/PRODUCT.md). Keep the machine default, optional generic starter selection, target-muscle imagery and small timer. Show time/selection consequences. Generation does not make imagery anatomically verified.
- **Catalog expansion (FIT-013):** preserve existing exercise IDs and atlas slots. Update the catalog metadata, image manifest and static atlas sources together. Run `tests/catalog.test.ts` through the normal check gate: new selections must round-trip in local data, fit the time cap and map to the correct image. Do not change default routines just because the catalog grows.
- **Audio/native/Watch:** read [platform boundaries](../../../docs/architecture/PLATFORMS.md). Simulator, mocked input and web evidence cannot certify AirPods, background audio or watch connectivity.
- **Programs/videos/Health:** use `routineCycle` and `resolvePlan` for previews as well as today's plan. Future visits are conditional, not dated prescriptions. Follow [content sources](../../../docs/CONTENT_SOURCES.md) for external references and [HealthKit plan](../../../docs/architecture/HEALTH.md) for native health work. Never convert source-page checks to playback verification or planned HealthKit support to connected status.
- **PPL guidance (FIT-017):** preserve its push/pull/legs role coverage and 40-minute cap; alternatives substitute rather than accumulate. Weekly modes are examples, not persisted scheduling. Run `tests/ppl.test.ts`; changing presets must not mutate active snapshots or saved overrides. The third atlas is 2×2 rather than 3×3, so update manifest and renderer together when expanding it.
- **Review only:** follow [reviewer role](../../roles/reviewer.md). Report actionable regressions and missing evidence; do not silently implement fixes.

## Make the change reviewable

1. Identify affected `FIT-*` requirements in [requirements.json](../../../docs/requirements.json), relevant callers, and the smallest observable before/after behavior.
2. For bug fixes, reproduce the failure with a test before changing the shared path. For new behavior, test meaningful boundaries rather than copying implementation expressions.
3. Implement in the owning module. Do not rewrite unrelated code or change product scope just to simplify a patch.
4. Run `npm run check`; run `npm run build:web` for screen/native/dependency changes. Record actual outputs and limitations. Native acceptance uses the manual matrix, not a mocked pass.
5. Update the canonical requirement/decision when behavior changed and [HANDOFF.md](../../../docs/HANDOFF.md) with evidence and unfinished work. Review against the product contract before committing.

If a tool/SDK is unavailable, finish independent local work and report the concrete missing validation. Do not request extra permission for already-authorized routine changes. Do not mark a release ready while `npm run release:check` fails.
