# iOS development build evidence · 2026-09-12

- Xcode 26.4.1 (17E202), iOS SDK 26.4, iOS simulator runtime 26.4.1; CocoaPods 1.17.0, Node 22.
- `xcodebuild ... -configuration Release -sdk iphonesimulator ... CODE_SIGNING_ALLOWED=NO build`: BUILD SUCCEEDED. Installed and launched `com.spdaewoon.fitin` on iPhone 17 Pro simulator; the initial image-led home screen rendered without an error overlay. Full interaction QA is not claimed.
- `xcodebuild ... -configuration Release -sdk iphoneos ... DEVELOPMENT_TEAM=<local team> CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build`: BUILD SUCCEEDED with the existing personal Apple Development identity, after removing the unused APNs entitlement. Version 0.0.1, build 1. Secrets and profiles are not committed.
- `codesign --verify --deep --strict .expo/ios-device-build/Build/Products/Release-iphoneos/FitIn.app`: succeeded.
- Embedded JS/assets provide standalone execution, without a development server. Build outputs are ignored `.expo/ios-build` and `.expo/ios-device-build` directories. Reproduce through [build instructions](architecture/IOS_BUILD.md).
- Physical install was attempted through `devicectl device install app`, but failed with CoreDevice error 1011: the iPhone 16 Pro was offline/unavailable. This is not a successful device installation. Connect/trust/unlock the phone and enable Developer Mode to continue.
- This evidence verifies native compilation/signing and initial simulator launch only. It does not verify production readiness, all screens, local reminder delivery, music ducking, AirPods controls, WatchConnectivity, HealthKit or physical storage recovery.
