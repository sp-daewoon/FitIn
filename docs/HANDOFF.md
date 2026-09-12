# Current handoff · 2026-09-12

## User intent and latest correction

The requested harness is **AI development/maintenance infrastructure**: durable docs, reusable skill, agent role prompts and regression gates so another AI can safely continue. The in-app clock lab is supporting tooling only. Implementation has resumed after the planning stage. Old requests to prioritize planning no longer block implementation; computer-use automation has not been resumed.

## Current implementation

- Private GitHub remote: https://github.com/sp-daewoon/FitIn (origin).
- Expo SDK 57 / React Native / TypeScript, iPhone first, web build target. Node 22.13+ required.
- Common engine: 10-second setup, no warmup, automatic progression, explicit next/skip/extend/pause, forty-minute cap, no forced filler, explicit performance records.
- Guarded app/watch/headphone command envelope; isolated virtual input lab. **No actual watch/headphone control connection.**
- Image-led React UI, draft anatomical atlas, machine and target muscles prioritized over timer. Generic optional starter selection, plan editing/saving/reset, split preference and basic cycle progression.
- Catalog now has 22 exercises: 9 machines/cables, 5 barbells, 7 dumbbells, 1 bodyweight. Added triceps pushdown, face pull, dumbbell Romanian deadlift and crunch. Old IDs and storage schema remain unchanged. Atlas slots 0–17 retain two 3×3 images; slots 18–21 use a 2×2 draft atlas; see [new prompt](../assets/exercises/ppl-prompt.md). Dictionary includes bodyweight filtering.
- User explicitly requested richer PPL guidance. Updated PPL defaults to five Push exercises (chest/shoulder/triceps), four Pull exercises (back/rear shoulder/biceps), five Legs exercises (front/back legs/core). Durations including setup/rest/moves: 34:10 / 27:10 / 34:10. Full-body/upper/lower defaults, saved overrides and active session phases are unchanged. Do not silently upgrade an existing saved plan; select/apply PPL again for the new default.
- 0.0.1 is now the immutable source/web preview baseline (`v0.0.1`, `web/v0.0.1`); independent iOS/Android/watchOS version entries are tracked in [version ledger](releases/versions.json). Exercise append and multiple finishers are post-0.0.1 work.
- Post-baseline PPL work adds four exercises and a third draft atlas, plus practical weekly guidance: PPL defaults now cover triceps, rear delts, hinge and core. Tests/build passed after the change; the 0.0.1 release itself remains unchanged.
- Routine selection now appears before history/future cards, with an entry-level choice guide, weekly/rolling PPL examples, target roles, rep starting ranges, load cue and substitute suggestions. Schedule modes are view-only examples and are not stored as appointments or frequency preferences. General reps are coaching metadata, not tracked performance. No individual recovery optimization is claimed.
- Version-2 local data and validation; v1 remains untouched and is not silently migrated.
- Added “내 루틴”: four program styles, all session presets before applying, actual last record and next two conditional visits. Shared cycle/plan resolver prevents preview drift. Program application resets starters/saved plan explicitly; new manually saved plans choose fixed repetition. Existing version-2 records remain compatible. Active-session preview uses actual phase order/durations.
- Exercise guides offer six external video references (five Shorts, one regular video) plus Korean search for all exercises. External navigation pauses via the shared engine; no auto-resume. Publisher references checked, but YouTube playback and technique remain unverified; see [sources](CONTENT_SOURCES.md).
- Apple Health requested and planned: settings truthfully shows disconnected/preparing. [Native HealthKit contract](architecture/HEALTH.md) specifies optional confirmed workout export, pause timeline/schema prerequisite, permission handling, retry/deduplication and future Watch heart rate. No actual HealthKit code/permission/data access yet.
- Foreground speech/beep adapters and rescheduled background notifications; physical behavior unverified.
- Primary AI harness: AGENTS.md, canonical product/architecture, requirement map, project skill, portable implementer/reviewer/handoff role instructions, thin Claude/Copilot entrypoints, CI checks and readiness gate.

## Validation evidence

- `npm run check`: TypeScript, 41 engine/codec/catalog/planning/PPL/AI-harness tests, and harness validation passed on 2026-09-12 with Node 22. Added regression coverage for PPL movement roles/time cap, week/rolling rest patterns and legacy two-exercise Pull snapshot preservation. Catalog round-trip and asset mapping tests include the four new exercises.
- `npm run build:web`: Expo exported the actual React app (340 modules, local beep and three atlas assets) successfully. Formatting and diff whitespace checks passed. Local development server at http://localhost:8081 returned HTTP 200.
- Skill Creator `quick_validate.py`: project skill valid (run with PyYAML through uv).
- `npm run release:check`: expected nonzero result for seven unverified/draft readiness checks and draft anatomy. This is an intentional release block, not a passing release result.
- Initial publication CI passed (run 34681594247); the catalog update's remote CI must be checked separately after push.
- No computer-use visual QA, no native Xcode build, no physical phone/AirPods/Watch tests. Do not infer those from a successful bundle.
- Generated anatomy remains draft. In particular review grip, leg-curl roller geometry, cell boundaries and target muscles before release.
- Self-review found no additional code regression in the catalog diff. The generated freeweight atlas was visually inspected as a source image; runtime phone layouts and anatomical accuracy are not verified. New static images need qualified bar-path, grip, shoulder and bench/safety review, then full-motion guidance.
- PPL diff self-review found no additional code regression. New atlas source was inspected but not clinically/anatomically validated. Cable geometry, face-pull motion, hinge and crunch instruction need qualified review. Browser interaction/phone layout and exercise suitability remain unverified; tests/build do not establish these.

## Next concrete work

1. Review final React phone/desktop rendering when UI automation is authorized; improve assets and motion content after qualified review. The historical HTML is not the release design.
2. Implement and test actual recovery/volume-aware recommendation and fatigue/pain check-in. Current simple cycling and starter fallback are not that recommender.
3. Add structured repetition/weight/perceived-effort records; current explicit set count is limited.
4. Implement iOS/Watch native integration after full Xcode is available; use the common command protocol and platform acceptance matrix.
   Include optional Apple Health integration only after the prerequisites in its contract are implemented and verified.
5. Resolve storage export/migration/recovery UX and device wall-clock jumps. Do not delete v1 data to simplify this work.

## Working rules for the next AI

Start with AGENTS.md and the maintenance skill, inspect actual git status, route changes to requirement IDs, test a concrete behavior, review the diff and update this handoff. Do not mark draft/untested native features complete or remove gates to ship. Role files are portable instructions, not evidence that another agent ran. GitHub branch protection has not been configured.

## Repository publication

GitHub rejected the first push because the original local author email was private. Email protection remains enabled. Pre-publication history is preserved on the local-only `local/pre-publication` branch; the published main uses the account noreply email and a clean initial snapshot. Do not push the local backup branch.
