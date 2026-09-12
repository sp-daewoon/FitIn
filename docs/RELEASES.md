# Release management

[Version ledger](releases/versions.json) is the source of truth for independently tracked source, web, iOS, Android and watchOS versions. [0.0.1 notes](releases/0.0.1.md) describe the first preview baseline.

Use `vX.Y.Z` for a source baseline, `web/vX.Y.Z`, `ios/vX.Y.Z`, `android/vX.Y.Z`, and `watchos/vX.Y.Z` only for the corresponding platform artifact. Never move a published tag. Version bumps for one platform do not imply others shipped. iOS build numbers and Android versionCode must increase per upload; record artifact/build/source commit/distribution evidence in release notes. For a paired Watch app, Apple-required version compatibility must be checked in native configuration even though delivery evidence is tracked separately.

Before a release, inspect the clean diff; run check, format check and web export as applicable. Write scoped release notes with known limitations, update the ledger, commit, tag that commit and publish to the existing private remote. GitHub prereleases can archive an internal preview while native/content gates remain blocked; do not mark them production-ready. Native/public distribution requires actual platform build/device/readiness evidence. Record failed checks rather than changing gates to force a release.

Current Expo shared app.json version is the development fallback. Before independent native releases, generate/override the platform version and build fields from its own ledger entry in native build configuration and verify the resulting binary. No independent native build pipeline exists yet.

After a baseline is tagged, advance only the source/web development version for subsequent web/shared work. Preserve existing native targets and shipped tags. Source rollback does not authorize downgrading or deleting local workout data; codec compatibility must be verified first.
