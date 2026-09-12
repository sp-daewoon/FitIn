# FitIn product contract · v0.2

Status: implementation has resumed. The user clarified that **the primary harness is an AI maintenance harness: docs, skills, agent roles, and executable checks**. The in-app interaction lab is only one supporting test surface.

## Core service

Machine-led beginner gym coaching, within a 40-minute active session, iPhone first. React Native/TypeScript core supports Android and web; Apple Watch needs a native companion. No login, backend or account dependency. Store records durably on the device, not in disposable cache.

The old [HTML prototype](prototype.html) is historical exploration, not the release UI or the current requirements source. Latest requirements are this file and [requirements.json](requirements.json).

## Check-in and progression

User warms up before checking in. Say “운동을 시작하겠습니다”, allow **10 seconds**, then announce “체스트 프레스, 첫 번째 세트를 시작하겠습니다” (actual exercise/ordinal). No app warmup block and no extra first-machine move block.

Default progression remains automatic. At any time during a set the user can confirm completion; during rest they can start the next set; during a transition they can confirm ready. `+30초 더` extends the current window. Pause stops phase and active-session time. Final five seconds of working sets emit one beep per second. A set's target window is not an instruction to rush repetitions.

Current implementation decision: 40 minutes is an active-time cap, not mandatory filler. Earlier completion is allowed. Extra time shifts subsequent phases; if the timeline exceeds 40 minutes, show the impact, stop at the cap and leave unperformed sets unconfirmed. Do not silently compress rest or force a long cooldown to consume saved time. Further adaptive replanning needs an explicit product change.

Base full-body example: 10-second setup + 15 × 60-second work windows + 10 × 90-second rests + 4 × 60-second transitions = 34:10 planned, 5:50 contingency inside 40:00. Cleanup/moving is included between machines; final cleanup can occur after the routine ends. These are initial editable product defaults, not a validated universal prescription.

## Personalization and scheduling

Difficulty (beginner/intermediate/advanced) and split (full body, upper/lower, push/pull/legs, fixed) are independent. Machine-led defaults do not change because one person starts with dumbbells.

Generic optional starter selection includes dumbbell shoulder press and reverse-grip dumbbell row. Display replacements and time/muscle consequences; substitute/reorder rather than blindly append. Allow order, exercise, sets, rest, today's override, saved defaults, and reset. No automatic injury or recovery diagnosis.

Implemented scheduler: follow the next routine in the selected cycle after a routine ends with at least one explicitly confirmed set. This is intentionally **not yet the final physiology-aware recommender**. Target scheduler must use actual per-muscle volume, indirect loading, elapsed recovery, user fatigue/pain and available equipment; do not just alternate names and claim recovery-aware scheduling. Same-day heavy repeats and long gaps need deliberate handling. Advanced progression is not shorter rest by default.

## Phone and companion experience

The “내 루틴” page connects actual previous records, today's current plan and the next two conditional visits. It offers four selectable program styles with every session's exercises, sets, rests, rationale and duration before application. Future visits are not assigned dates: no fabricated yesterday activity or mandatory tomorrow workout. They assume completion with explicit performance, matching the existing cycle. Applying a program clears prior starters/saved overrides after explaining that consequence; history remains. Saving a hand-edited plan now explicitly chooses fixed repetition. Legacy saved plans retain their old behavior and are labeled in previews. The shared `resolvePlan` supplies both today and future plans.

Exercise guides expose external video references when available and a clearly labeled Korean YouTube search for every movement. Opening links pauses an active session; returning requires manual resume. Reference publication is checked, but playback and technique review are not. See [content sources](CONTENT_SOURCES.md).

Apple Health is an authorized future iOS feature: optional workout export first, Watch heart rate later. Settings shows “준비 중 · 현재 미연결”; no health data is accessed. Follow the [HealthKit contract](architecture/HEALTH.md) before native implementation.

Exercise catalog: 22 entries (9 machines/cables, 5 barbells, 7 dumbbells, 1 bodyweight). Added cable triceps pushdown, cable face pull, dumbbell Romanian deadlift and crunch to fill PPL roles explicitly requested by the user. All are available through existing starter/replacement controls. Beginner full-body defaults, saved plans and live session snapshots remain unchanged.

The exercise dictionary supports equipment filters, name/muscle search and opening the large image/setup guide. Each exercise has equipment, body region, primary/secondary muscles, movement pattern and an explicit atlas cell. Keep original IDs stable for local records. Two 3×3 atlases occupy slots 0–17; one 2×2 atlas occupies 18–21. Test catalog/manifest correspondence and update runtime clipping when adding another atlas. One-arm row uses both sides within a set; the user may extend the time window. Static draft images do not demonstrate the full motion.

## Guided PPL defaults

The user explicitly requested richer PPL recommendations on 2026-09-12. Push now uses chest press, dumbbell shoulder press, pec deck, lateral raise and cable triceps pushdown. Pull uses lat pulldown, seated row, cable face pull and dumbbell curl. Legs uses leg press, dumbbell Romanian deadlift, leg curl, leg extension and crunch. Each has 3 sets, 60-second work windows and 90-second rests; with setup and transitions their planned durations are 34:10, 27:10 and 34:10. Do not pad Pull or silently compress rest to make every day 40 minutes.

The planner now leads with selection guidance, shows each day's target roles, time budget, repetition starting ranges and alternative exercises (substitutes, not additions). Repetition ranges are catalog coaching text, not a stored repetition target or performance record. General starting guidance uses 8–12 repetitions for compound movements, 12–15 for accessories, and a controllable load leaving roughly 2–3 repetitions in reserve. The work timer is an estimate and users retain early completion/extension/pause controls. This is a product starting example awaiting content review, not an optimized prescription for all users.

PPL schedule examples show Monday/Wednesday/Friday, six days plus Sunday rest, and a rolling three-on/one-off pattern. These are view-only examples, not persisted attendance preferences, appointments or automatic rest-day enforcement. Explain that three-day PPL exposes each group once per week, six days are not automatically better, and rest days cannot guarantee complete recovery. Beginner/irregular visitors continue to see full-body as the first suggestion. A/B continues across weeks; the calendar is one example week, not a cycle reset.

Phone hierarchy: large recognizable machine + body position + highlighted primary muscles; exercise name and current set; one clear coaching cue; next/extend/pause; smaller time display. Artwork supports understanding; generated imagery must remain a clearly marked draft until anatomy/equipment review. Use original or properly licensed content; user reference images are visual references, not automatically licensed assets to ship.

Watch hierarchy: current exercise/set, compact time, next, extend, pause. All device commands carry session identity, expected phase and revision; the phone engine is the intended authority. Actual Watch connectivity is not implemented yet.

AirPods input is conditional on Apple media-session constraints. Receiving next/play events while another app owns music is not guaranteed. Do not claim music-friendly universal headphone controls. See [platform boundaries](architecture/PLATFORMS.md).

## Records and truthfulness

Explicitly completed sets, automatic phase passage, budget cutoff and user stop are distinct. Local schema is versioned. Unreadable data is preserved, not reset to empty and overwritten. v1 draft data stays under its original key; v2 does not silently migrate old warmup-era active sessions.

## Evidence versus decisions

- [ACSM 2026](https://acsm.org/resistance-training-guidelines-update-2026/) supports regular major-muscle-group training and gradual progression; it does not validate FitIn's exact schedule.
- [Mayo Clinic](https://www.mayoclinic.org/healthy-lifestyle/fitness/basics/strength-training/hlv-20049447) advises against training the same muscle group on consecutive days.
- [Reference short](https://www.youtube.com/shorts/gid8N53_Tq0) illustrates the requested motion/muscle visualization format, not a copied content license.

For latest actual implementation and outstanding work read [HANDOFF.md](HANDOFF.md).
