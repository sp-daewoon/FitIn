# Platform boundary and acceptance matrix

| Surface | Implemented foundation | Required evidence before claiming support |
|---|---|---|
| React web | UI, common engine, browser speech through expo-speech, local storage | Render/click testing at phone and desktop widths; actual Korean speech and 5..1 beep timing |
| iPhone foreground | Expo Speech, Audio duckOthers for beeps, haptics | Physical phone + AirPods + Apple Music/Spotify: cue does not stop music, level recovers, silent mode handled |
| iPhone background/lock | Phase notifications scheduled/replaced | Physical lock/pause/resume/force-close tests; notification sound is not guaranteed continuous spoken coaching |
| Android | Shared JS core, notification channel and speech/audio calls | Physical audio focus, interruption and background tests |
| Apple Watch | Shared command schema and input simulator | Actual SwiftUI target, WatchConnectivity adapter, single authority, reachability/duplicate/reconnect tests |
| AirPods controls | Shared command source schema only | Native eligible Now Playing session, device events and music ownership conflict validation |
| Apple Health | Planned data/permission contract and truthful disconnected settings | Native HealthKit capability, optional authorization, confirmed workout export, retry/deduplication and device evidence; see [HealthKit plan](HEALTH.md) |

## Authoritative constraints

[Apple MPRemoteCommandCenter](https://developer.apple.com/documentation/mediaplayer/mpremotecommandcenter) routes external player actions to an eligible Now Playing app. A headphone control is not a general-purpose button subscription independent of the music player. Do not take audio focus with silent playback simply to fake workout control while claiming another music app remains unaffected.

[Expo Speech](https://docs.expo.dev/versions/latest/sdk/speech/) supports iOS `useApplicationAudioSession: false` so speech session mixing/ducking can be system-managed. [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/) offers `duckOthers`; it is not an API for prescribing another app's exact fade curve. Web speech quality and voices depend on the browser/device. iOS silent-mode behavior and audio interruptions need device evidence.

Current environment has Command Line Tools, not full Xcode. No native build, Watch connection or physical AirPods verification has been performed. Computer-use automation remains paused per the user's earlier request; source checks and terminal builds do not imply visual QA.

## Manual acceptance protocol

Record device/OS, build revision, sound settings, connected music app, steps and observed outcome. Store evidence references in `docs/release-readiness.json` when completed. Never change a result to verified without evidence.

1. Start after warmup: spoken start → 10 seconds → correct exercise and first set.
2. Music playing: voice and 5..1 beeps are audible; no permanent ducking or unintended music pause.
3. Finish a set early, skip rest, extend by 30s, pause for 2 minutes; next phase/remaining time match engine.
4. Lock, return, kill and reopen; position correct and no duplicate cues/records.
5. Headphones disconnect, phone call, audio interruption; no runaway session/audio ownership.
6. Watch app+phone simultaneous next; delayed/replayed commands; reconnect after phase transition; only one state transition.
7. At 40 minutes stop; do not mark remaining sets performed. Local save failure retains recoverable state.
