# Post-0.0.1 implementation brief · persistent routine builder

Status: planned. Do not backport into the immutable `v0.0.1` / `web/v0.0.1` tags. Implement after the current Astra token window is available for the design and migration review.

## User-visible contract

- `내 루틴` is the persistent goal template. It owns exercise membership, order, finishers, global rest default and each exercise's work duration.
- `오늘의 운동` is a copy for today's check-in. It can add, remove, reorder or adjust a movement for one visit. It has an explicit “내 기본 루틴에도 저장” action; no accidental template mutation.
- `다음 방문` and `다다음 방문` are compact previews resolved from the actual saved template and the selected cycle. They are visit-order previews, not dates or appointments.
- Full-body users can add one, two or three finishers at the end (deadlift is a valid example). A finisher is an explicit addition, so duplicate exercises are allowed only in that context.
- Add/remove/reorder is visible inline. Exercise details remain available but are not required for editing.

## Timing contract

- Global rest starts at 90 seconds and applies to every set until the user enables an exercise-specific override.
- Each exercise has editable work duration, starting at 60 seconds. “Exercise time” and “rest/transition time” are shown separately.
- Display planned active time, exercise time, rest time, transition time and remaining/over-cap amount before save and before check-in.
- A goal template may exceed 40 minutes so it faithfully represents the user's target. At check-in, require a choice to run the copy to the 40-minute cap (remaining items explicitly unperformed) or shorten only today's copy. Never silently compress rest or drop finishers.
- Active execution remains capped at 40 minutes. Existing explicit completion, pause, extension and cutoff records remain authoritative.

## Data and migration

Prefer extending the existing `PlanItem` with `work` and an optional rest override, plus a template-level global rest and explicit finisher marker. If the representation cannot distinguish template versus today copy, introduce a new versioned preference field and migrate with fixtures. Preserve unreadable originals and old `fitin.v1`/`fitin.v2` snapshots; never reset storage. Test paused/active sessions created from a template, one-day edits, duplicate finisher IDs, reorder persistence, global-rest propagation, per-exercise work duration and over-cap check-in decisions.

## Acceptance examples

1. Select full-body. Add deadlift, cable face pull and crunch as three finishers. They appear after the main sequence; save. Close and reopen: all three remain in the same order.
2. Change global rest from 90 to 120 seconds. Every exercise preview updates; an explicitly overridden exercise remains distinct and is labeled.
3. Set deadlift to 90 seconds per set. The breakdown changes exercise time without changing another movement's work duration.
4. On today's copy, remove one finisher and shorten rest. The template still shows all three finishers until “기본 루틴에도 저장” is pressed.
5. A 46-minute template can be saved. Check-in shows the over-cap consequence and requires the user to choose cap execution or today-only shortening. No item disappears silently.

## Release note

This brief is not evidence of implementation. The `v0.0.1` release remains the earlier preview baseline. Update [versions.json](versions.json), add scoped tests and a new release note only when the builder is implemented and validated.
