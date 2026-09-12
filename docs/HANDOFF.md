# Current handoff · 2026-09-12

## User intent and latest correction

The requested harness is **AI development/maintenance infrastructure**: durable docs, reusable skill, agent role prompts and regression gates so another AI can safely continue. The in-app clock lab is supporting tooling only. Implementation has resumed after the planning stage. Old requests to prioritize planning no longer block implementation; computer-use automation has not been resumed.

## Current implementation

- Private GitHub remote: https://github.com/sp-daewoon/FitIn (origin).
- Expo SDK 57 / React Native / TypeScript, iPhone first, web build target. Node 22.13+ required.
- Common engine: 10-second setup, no warmup, automatic progression, explicit next/skip/extend/pause, forty-minute cap, no forced filler, explicit performance records.
- Guarded app/watch/headphone command envelope; isolated virtual input lab. **No actual watch/headphone control connection.**
- Image-led React UI, draft anatomical atlas, machine and target muscles prioritized over timer. Generic optional starter selection, plan editing/saving/reset, split preference and basic cycle progression.
- Catalog expanded to 18 exercises: 7 machines, 5 barbells, 6 dumbbells. New exercise dictionary offers equipment filters, name/muscle search and a large detail guide. All additions work with existing replacement/starter controls. Existing IDs, default routines and storage schema are unchanged. A second original draft atlas supplies the nine new images; see [generation prompt](../assets/exercises/freeweights-prompt.md).
- Version-2 local data and validation; v1 remains untouched and is not silently migrated.
- Added “내 루틴”: four program styles, all session presets before applying, actual last record and next two conditional visits. Shared cycle/plan resolver prevents preview drift. Program application resets starters/saved plan explicitly; new manually saved plans choose fixed repetition. Existing version-2 records remain compatible. Active-session preview uses actual phase order/durations.
- Exercise guides offer six external video references (five Shorts, one regular video) plus Korean search for all exercises. External navigation pauses via the shared engine; no auto-resume. Publisher references checked, but YouTube playback and technique remain unverified; see [sources](CONTENT_SOURCES.md).
- Apple Health requested and planned: settings truthfully shows disconnected/preparing. [Native HealthKit contract](architecture/HEALTH.md) specifies optional confirmed workout export, pause timeline/schema prerequisite, permission handling, retry/deduplication and future Watch heart rate. No actual HealthKit code/permission/data access yet.
- Foreground speech/beep adapters and rescheduled background notifications; physical behavior unverified.
- Primary AI harness: AGENTS.md, canonical product/architecture, requirement map, project skill, portable implementer/reviewer/handoff role instructions, thin Claude/Copilot entrypoints, CI checks and readiness gate.

## Validation evidence

- `npm run check`: TypeScript, 38 engine/codec/catalog/planning/AI-harness tests, and harness reference/requirement validation passed on 2026-09-12 with Node 22. New planning cases cover every program's time cap, saved-plan isolation, lower-day starter handling, completion-based cycle progression and encoded video search fallback.
- `npm run build:web`: Expo exported the actual React app (338 modules, local beep and both atlas assets) successfully. Formatting and diff whitespace checks passed. Local development server remains at http://localhost:8081.
- Skill Creator `quick_validate.py`: project skill valid (run with PyYAML through uv).
- `npm run release:check`: expected nonzero result for seven unverified/draft readiness checks and draft anatomy. This is an intentional release block, not a passing release result.
- Initial publication CI passed (run 34681594247); the catalog update's remote CI must be checked separately after push.
- No computer-use visual QA, no native Xcode build, no physical phone/AirPods/Watch tests. Do not infer those from a successful bundle.
- Generated anatomy remains draft. In particular review grip, leg-curl roller geometry, cell boundaries and target muscles before release.
- Self-review found no additional code regression in the catalog diff. The generated freeweight atlas was visually inspected as a source image; runtime phone layouts and anatomical accuracy are not verified. New static images need qualified bar-path, grip, shoulder and bench/safety review, then full-motion guidance.

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
