# Apple Health integration plan

Status: planned, not connected. No HealthKit reads, writes, permissions or fabricated health values exist in the current web/Expo app. The settings screen reports this truthfully. Native iOS development build, capability, usage descriptions and device verification are required. FitIn remains usable offline without this optional connection.

## First native increment

Offer an explicit optional connection after explaining the data scope. Ask for workout write access to save user-confirmed FitIn strength-training sessions as `traditionalStrengthTraining`. Do not request unrelated health categories. Separately offer heart-rate reading when the Watch companion can supply relevant measurements; do not invent heart rate or energy estimates from the timer. Watch workout ownership and phone/Watch deduplication must be settled before enabling either writer.

Preserve local records regardless of permission denial, cancellation, revocation or save failure. Use a persistent session identifier and HealthKit sync metadata with a retry-safe ledger so repeated delivery cannot create duplicate workouts. Importing all historical workouts and automatic recovery-based programming are separate future scopes.

The current record lacks the full pause timeline and an explicit health-export confirmation. Before native export, introduce a tested, versioned snapshot path preserving start/end, pauses, confirmation and export state. Do not reconstruct a start time as end minus active duration: pauses would be lost. Retain rest and transition periods that belong to the workout; exclude explicitly paused periods. Timed passage with zero confirmed performance must never be silently exported as a performed workout. Do not silently backfill old records that lack the necessary evidence.

## Required device evidence

Test supported/unsupported device, permission denied/partial/revoked, no readable data, retry after failure, duplicate save, paused session, premature stop, zero-confirmation run, 40-minute cutoff and phone/Watch reconnection. A successful authorization request is not proof that read permission was granted; absence of readable data is not zero activity. Show not connected, permission needed, pending save, saved and failed states only from real results.

## Apple sources checked 2026-09-12

- [Authorizing access to health data](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)
- [Traditional strength training](https://developer.apple.com/documentation/healthkit/hkworkoutactivitytype/traditionalstrengthtraining)

This document is the implementation contract for the native increment, not evidence it has been built.
