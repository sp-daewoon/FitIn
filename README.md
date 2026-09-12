# FitIn

Offline-first, machine-led gym coaching. React Native + TypeScript; iPhone first. After warming up, check in, prepare for 10 seconds, and follow a session of up to 40 active minutes. Explicit set completion, rest skipping, extra time and pause work through one common engine.

**AI maintainers start at [AGENTS.md](AGENTS.md).** The primary development harness is [docs/AI_HARNESS.md](docs/AI_HARNESS.md): canonical product contracts, a reusable project skill, agent role instructions, behavioral regression tests, CI and truthful release-readiness gates.

## Run

Node 22.13+ (recommended: Node 22 LTS).

```sh
npm ci
npm run web
```

`npm run ios` opens the Expo iOS flow; a native simulator/build requires full Xcode. The bundle identifier is an initial development identifier, not a registered App Store product. No backend or login is required.

## Validate

```sh
npm run check          # types + behavior tests + AI-harness consistency
npm run build:web      # bundle the real React app
npm run format:check   # stable code formatting
npm run release:check  # intentionally blocked while device/content work is unverified
```

Development builds include a virtual-session lab for reproducing next/extend/pause and simulated companion commands. It does not modify actual records or prove a device connection.

## Documentation

- [Current product contract](docs/PRODUCT.md)
- [Current implementation, evidence and next work](docs/HANDOFF.md)
- [Requirement IDs and code/test ownership](docs/requirements.json)
- [Shared state and persistence architecture](docs/architecture/SESSION.md)
- [Native/platform acceptance boundaries](docs/architecture/PLATFORMS.md)
- [Project maintenance skill](.agents/skills/fitin-maintenance/SKILL.md)

The old `docs/prototype.html` is historical planning, **not the release UI or current source of requirements**. `npm run prototype` serves it only for historical comparison.

Draft anatomy assets, recovery-aware recommendations, native audio/lock-screen verification and Watch integration remain unfinished. A green web build does not mean those features are released. Data is stored locally under `fitin.v2`; legacy `fitin.v1` is preserved separately. App deletion can remove device records; export/recovery UX remains future work.

Private repository: [sp-daewoon/FitIn](https://github.com/sp-daewoon/FitIn).
