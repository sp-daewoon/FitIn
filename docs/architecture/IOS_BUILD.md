# Local iOS build and run

Use Node 22+, full Xcode and CocoaPods. Native folders are generated and ignored; `app.json`, `app.config.js`, package lock and the independent [version ledger](../releases/versions.json) are the reproducible inputs. iOS version is 0.0.1 build 1; source/web remain development 0.0.2. Do not retag the historical 0.0.1 source release.

```sh
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
npm ci
FITIN_PLATFORM=ios npx expo prebuild --platform ios --no-install
pod install --project-directory=ios
xcodebuild -workspace ios/FitIn.xcworkspace -scheme FitIn -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath .expo/ios-build CODE_SIGNING_ALLOWED=NO build
xcrun simctl list devices available
# Boot a listed iPhone UDID, then:
xcrun simctl install booted .expo/ios-build/Build/Products/Release-iphonesimulator/FitIn.app
xcrun simctl launch booted com.spdaewoon.fitin
open -a Simulator
```

Run prebuild and CocoaPods sequentially. Prebuild may recreate the native directory; never run it during pod install or a build. The Release configuration embeds JS/assets and does not require Metro. `ios/.xcode.env.local` contains the generated Node executable path; regenerate it via pod install if that runtime disappears.

For a real iPhone: connect by USB, trust this Mac, enable Developer Mode, and make the phone reachable in `xcrun devicectl list devices`. Use `FITIN_PLATFORM=ios npx expo run:ios --device --configuration Release` with an available Apple development signing team/profile. No certificate or provisioning secret belongs in Git. Simulator success does not imply real-device signing, installation, background speech or AirPods acceptance.

The `with-local-notifications` config plugin must precede `expo-notifications`: Expo runs entitlement mods in reverse registration order. It removes the unused APNs entitlement, enabling personal-team signing while retaining local reminders. Inspect the generated entitlements after changing plugins; remote push is not part of this offline app.

watchOS requires its own native companion target and connectivity implementation; the in-app Watch preview is not an installable Watch app. HealthKit is still planned.
