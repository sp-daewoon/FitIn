# Current handoff · 2026-09-12

## User intent and latest correction

The requested harness is **AI development/maintenance infrastructure**: durable docs, reusable skill, agent role prompts and regression gates so another AI can safely continue. The in-app clock lab is supporting tooling only. Implementation has resumed after the planning stage. Old requests to prioritize planning no longer block implementation; computer-use automation has not been resumed.

## Current implementation

- Private GitHub remote: https://github.com/sp-daewoon/FitIn (origin).
- Expo SDK 57 / React Native / TypeScript, iPhone first, web build target. Node 22.13+ required.
- Common engine: 10-second setup, no warmup, automatic progression, explicit next/skip/extend/pause, forty-minute cap, no forced filler, explicit performance records.
- Guarded app/watch/headphone command envelope; isolated virtual input lab. **No actual watch/headphone control connection.**
- Image-led React UI, draft anatomical atlas, machine and target muscles prioritized over timer. Generic optional starter selection, plan editing/saving/reset, split preference and basic cycle progression.
- Version-2 local data and validation; v1 remains untouched and is not silently migrated.
- Foreground speech/beep adapters and rescheduled background notifications; physical behavior unverified.
- Primary AI harness: AGENTS.md, canonical product/architecture, requirement map, project skill, portable implementer/reviewer/handoff role instructions, thin Claude/Copilot entrypoints, CI checks and readiness gate.

## Validation evidence

- `npm run check`: TypeScript, 30 engine/codec/AI-harness tests, and harness reference/requirement validation passed on 2026-09-12 with Node 22.
- `npm run build:web`: Expo exported the actual React app (332 modules, local beep and atlas assets) successfully.
- Skill Creator `quick_validate.py`: project skill valid (run with PyYAML through uv).
- `npm run release:check`: expected nonzero result for seven unverified/draft readiness checks and draft anatomy. This is an intentional release block, not a passing release result.
- CI is configured; its remote execution result must be checked separately after push.
- No computer-use visual QA, no native Xcode build, no physical phone/AirPods/Watch tests. Do not infer those from a successful bundle.
- Generated anatomy remains draft. In particular review grip, leg-curl roller geometry, cell boundaries and target muscles before release.

## Next concrete work

1. Review final React phone/desktop rendering when UI automation is authorized; improve assets and motion content after qualified review. The historical HTML is not the release design.
2. Implement and test actual recovery/volume-aware recommendation and fatigue/pain check-in. Current simple cycling and starter fallback are not that recommender.
3. Add structured repetition/weight/perceived-effort records; current explicit set count is limited.
4. Implement iOS/Watch native integration after full Xcode is available; use the common command protocol and platform acceptance matrix.
5. Resolve storage export/migration/recovery UX and device wall-clock jumps. Do not delete v1 data to simplify this work.

## Working rules for the next AI

Start with AGENTS.md and the maintenance skill, inspect actual git status, route changes to requirement IDs, test a concrete behavior, review the diff and update this handoff. Do not mark draft/untested native features complete or remove gates to ship. Role files are portable instructions, not evidence that another agent ran. GitHub branch protection has not been configured.

## Repository publication

GitHub rejected the first push because the original local author email was private. Email protection remains enabled. Pre-publication history is preserved on the local-only `local/pre-publication` branch; the published main uses the account noreply email and a clean initial snapshot. Do not push the local backup branch.
