# FitIn product contract

Current behavior follows the user's latest request in [routine expansion](releases/routine-expansion.md). Historical release notes and the [HTML prototype](prototype.html) are not current product requirements.

## Core service

Offline gym coaching, iPhone first, React Native/TypeScript shared with web and Android. The current app has no login/backend dependency. The user authorized optional Supabase accounts and private routine storage on 2026-09-13; see [the preparation plan](architecture/SUPABASE.md). Guest workouts and durable local records remain supported; unreadable originals must never be overwritten. Machine-led full-body remains the first suggestion. Personal dumbbell preferences are optional, not universal defaults.

Check-in happens after warmup. Say “운동을 시작하겠습니다”, allow exactly 10 seconds, then announce the actual exercise and set ordinal. No warmup or extra first-machine transition. Automatic progression coexists with set completion, rest/transition skip, +30 seconds, pause and resume. Working-set seconds 5..1 beep. A work window is an editable estimate, not an instruction to rush or proof of performed exercise.

New sessions run the entire plan without a 40-minute cap, including finishers. Migrated sessions preserve their original cap. Generated plans target 25 minutes of planned work windows, excluding rest: five movements × five sets × 60 seconds. With 90-second rests and equipment transitions, total is 59:10. This is the user's requested planning target, not a minimum effective dose or a universal beginner prescription. Users can reduce volume, save shorter plans, finish early or extend. Never add filler, compress rest or silently discard movements.

## Personalization and scheduling

“내 루틴” owns seven program choices: machine full-body A/B, upper/lower, PPL, fixed full-body, mixed freeweight full-body A/B, torso/limbs, and chest-back/shoulder-arms/legs. Cards show today, next visit and the visit after. Dates are examples only. Follow the next cycle entry only after routine completion with at least one explicitly confirmed set. This simple cycle is not a load/recovery-aware recommendation engine.

Difficulty selection is hidden until meaningful progression is implemented. Existing beginner/intermediate/advanced values remain readable but do not change equipment. Future recommendations need technique, load, repetitions, fatigue and recovery, not just a label.

“내 루틴” stores persistent templates per routine; “오늘의 운동” edits a copy. Only explicit save updates future visits. Switching program preserves templates, starter choices and history. Legacy fixed saved plans retain their behavior and are labeled. `resolvePlan` supplies previews and today's plan. New recommendations never mutate an active snapshot.

Templates permit 1–12 movements and 1–5 sets per movement. Global rest defaults to 90 seconds; exercise-specific rest overrides stay labeled. Work windows range 20–180 seconds. Work, rest, setup/transitions and total are reported separately. Users can add, remove and reorder movements and append multiple finishers; only explicit finishers may duplicate a movement. Every occurrence has distinct phase IDs. Starter preferences substitute/reorder main movements and never displace finishers. Heavy deadlifts at the end are a user choice, not a claimed optimal recommendation.

PPL keeps chest/shoulder/triceps, back/rear shoulder/biceps and legs/core coverage. Extra details expose movement purpose, repetition starting ranges, alternatives and weekly examples. These are editable examples awaiting content review; no guarantee of complete recovery or individualized effectiveness. Consistent major-muscle-group training and gradual progression are supported by [ACSM 2026](https://acsm.org/resistance-training-guidelines-update-2026/), which does not validate FitIn's exact set count or duration.

## Exercise guidance and platforms

English is the default presentation language; settings can select Korean for UI, exercise guidance, speech and reminders. Stored exercise IDs and session progression are language independent. During sets, reserve space for changing headings/status/button labels so Korean line wrapping does not shift the exercise image or controls. Image frames cannot shrink with text content. Layout verification covers both languages, independently of physical iPhone verification.

The 22-entry catalog contains nine machines/cables, five barbells, seven dumbbells and one bodyweight movement. Stable exercise IDs and atlas slots must survive expansion. Slots 0–17 use two 3×3 atlases; slots 18–21 use a 2×2 atlas. The dictionary offers equipment/name/muscle filters. Phone UI prioritizes recognizable equipment, body position and target muscles, then exercise/set and controls, with a smaller timer.

Artwork remains draft pending qualified anatomy/equipment review. Static images do not demonstrate full motion. Reference screenshots are not licensed shipping assets. External video references and clearly labeled YouTube search pause the active session before leaving, with manual resume on return. See [content sources](CONTENT_SOURCES.md); a source check is not playback or technique verification.

Watch design uses exercise imagery beneath high-contrast exercise/set/time and controls. The current phone-rendered Watch preview is explicitly disconnected. Real watchOS connectivity still needs a native target and shared session/phase/revision-guarded commands. Web/simulator tests cannot verify Watch, AirPods or external music ducking. See [platform boundaries](architecture/PLATFORMS.md).

Apple Health remains optional planned integration; no health data is accessed. Follow [HealthKit prerequisites](architecture/HEALTH.md) before claiming connected/exported state.

## Records and AI maintenance

Backgrounding the app or turning off the screen keeps the session clock running: the process is alive and the user is still in the gym with the phone in a pocket. A cold start after the process died is different, because nothing was measuring that gap. The session pauses, the gap is excluded from workout time, and the user is asked whether the session really was running, for example on a watch. The app does not guess: it states what it knows, defaults to the conservative answer, and neither answer adds or removes a confirmed set. Once a Watch client exists it keeps its own heartbeat, so a watch-driven session is not treated as abandoned.

The routine page shows one card per visit in the cycle, capped at three: a two-visit split has 오늘 and 다음 방문 and no 다다음 방문, a one-visit split has only 오늘. Do not pad the list with a visit the cycle does not contain.

Program styles are fixed product examples with one exception. `custom` is the user's own cycle: they choose how many visits it has, up to three, and what each visit is, and the routine builder owns each visit's contents. Nothing populates it automatically, and switching program styles preserves saved templates.

A movement may appear more than once in a plan when the user adds the repeat deliberately, through an explicit "이미 넣은 운동도 다시 추가" choice in the add-exercise control. Each occurrence gets its own phases and its own set records. Generated plans never produce a repeat, which is asserted by test rather than by validation. There is no separate "finisher" concept: adding an exercise and moving it to the end is the same action.

Editor steps are asymmetric on purpose: work duration moves in 5-second steps because a few seconds per set changes the whole session total, while rest moves in 15-second steps.

Workout records belong to the user and can be deleted one at a time or all at once. Deletion is confirmed first, says it cannot be undone, and never touches a running session or saved routines. The next routine is recomputed from the records that remain, so removing the latest visit can move the cycle back a step; the app does not rewrite history to keep the order looking continuous.

Explicit set completion, automatic time passage, user stop and legacy budget cutoff are distinct. `fitin.v4` migrates v2/v3 in memory while preserving original keys, paused sessions, phase IDs and custom rest/templates. v1 remains separately preserved. See [session architecture](architecture/SESSION.md).

The primary harness is AI maintenance: AGENTS.md, skills, role instructions, canonical docs, regression tests and release gates. The in-app interaction lab is only a supporting surface. See [current handoff](HANDOFF.md) for measured validation and remaining work. Never equate successful builds with physiological review or real-device acceptance.
