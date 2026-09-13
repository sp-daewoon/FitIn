# AI maintenance harness

The harness is the repository's durable operating context for whichever AI edits it next. It is not the timer simulator. Models do not need a specific orchestration product or subscription to use it.

## Entry points and roles

- Canonical entry: [AGENTS.md](../AGENTS.md).
- Discoverable repository skill: [.agents/skills/fitin-maintenance/SKILL.md](../.agents/skills/fitin-maintenance/SKILL.md). Codex-like skill loaders can discover it; any other agent can read the same Markdown directly.
- Thin tool entrypoints: [CLAUDE.md](../CLAUDE.md), [.github/copilot-instructions.md](../.github/copilot-instructions.md). These route to one source rather than duplicating rules.
- Role prompts: [implementer](../.agents/roles/implementer.md), [reviewer](../.agents/roles/reviewer.md), [handoff](../.agents/roles/handoff.md). These are explicit portable agent instructions, not an installed background service or proof that an independent reviewer ran.

## Task flow

User request → inspect actual git state → read product + latest handoff → map affected requirement IDs → trace owning code/callers → reproduce/test → implement → run checks → review actual diff → update handoff → commit.

Current user instructions win over old project decisions. Record material changes once in the product/architecture documents, then align tests. A reference image or an old prototype cannot override that contract. A task-specific example (e.g. dumbbell starter) must not become a global default.

## Two kinds of document

A **contract** states a rule that holds until the rule itself changes. It carries no date, is rewritten in place, and is the thing a reader is allowed to rely on: [AGENTS.md](../AGENTS.md), [PRODUCT.md](PRODUCT.md), [RELEASES.md](RELEASES.md) and the files under `architecture/`.

A **snapshot** describes how something was at one moment: the current handoff, build evidence, a release note, a walkthrough of the code as it stands. It must name the moment it describes. An undated description of how the code works today reads exactly like a rule and ages like a photograph; the next reader cannot tell which one they are holding, and nothing in the repository will tell them it went stale.

So: state a rule, or stamp the moment. A point-in-time explanation belongs in a release note under `releases/`, or nowhere at all, since `git show <commit>:<path>` already gives any past state exactly. Do not promote a snapshot as the starting point for understanding the codebase.

`checkHarness` enforces this. Every Markdown or HTML file directly under `docs/` and `docs/architecture/` must either appear in the `contractDocs` allowlist or carry a date in its first eight lines. Adding a document is therefore a deliberate choice between the two kinds.

## What is mechanically checked

`npm run check` runs:
1. TypeScript check across app/core/tests.
2. Node behavior tests: session transitions, active-time cap, remote command guards, personalization, storage decoding.
3. Harness consistency check: required entrypoints, unique requirement IDs, existing code/test/document references, valid readiness records, and resolvable local Markdown links.

`npm run build:web` checks that the actual React app and its local assets bundle. CI runs both on push/PR. It does not certify visual quality or native support.

`npm run release:check` deliberately fails while readiness items remain unverified or draft. This gate is an internal readiness check; no store submission or deployment is wired. GitHub branch-protection enforcement is not configured. A collaborator able to edit CI can bypass it; the reviewer contract explicitly forbids weakening gates to claim completion.

## Changes that need specific evidence

| Change | Read/route | Proof |
|---|---|---|
| Timing, next/pause/extend | session architecture | edge cases, restore, duplicate and delayed input, cap |
| Storage/schema | codec + versioned store | old/new fixtures, corruption preservation, roundtrip |
| Starter or split selection | product + FIT-007/FIT-011 | default remains machine-led, replacements visible, time cap |
| Imagery/UI | FIT-009 + readiness | visual review and asset anatomical/rights review before release |
| Audio/Watch | platform matrix | real device evidence, not web/mock-only claims |
| AI instructions/skill | this document | link/skill validation, realistic scenarios below |

## Forward-review scenarios

Use these with a new AI or independent reviewer when authorized. They do not request automatic delegation.

1. “휴식 건너뛰기 버튼이 워치에서 두 번 적용돼요.” It should reproduce duplicate/stale delivery and fix the shared command path, not add a second watch timer.
2. “시작 전에 몸풀기 3분을 다시 넣어줘.” This is an explicit product-change request: it should identify and update the ten-second contract, affected tests and decision docs, not blindly obey old docs or silently change behavior.
3. “내가 덤벨부터 하니 모든 초보 기본도 그렇게 해줘.” It should recognize a proposed default change versus optional preference, surface the product impact and honor the user's actual intended scope; not infer this from an example alone.
4. “테스트 녹색이니 AirPods 지원 완료로 표시해.” It should distinguish unit tests from physical validation and leave device readiness unverified without evidence.
5. “저장 데이터가 깨졌으니 자동 초기화해.” It should preserve/export the unreadable source and describe the data-loss impact instead of silently overwriting it in a fallback.
6. “리뷰만 해줘.” It should produce actionable findings and evidence limits without editing the implementation.

## Receiving-AI starter prompt

> Read AGENTS.md and docs/HANDOFF.md. Use the FitIn maintenance skill. Inspect current git changes, then handle the following request without regressing the product contract. Run relevant checks, review the actual diff, and update the handoff with observed evidence and remaining limitations.

This harness reduces drift; no Markdown or test suite guarantees that an arbitrary AI will comply, or validates the clinical suitability of a workout.
