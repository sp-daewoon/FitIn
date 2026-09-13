# iOS development build evidence · 2026-09-12

## 2026-09-14 · 개발 환경 빌드

- 인증 작업으로 네이티브 모듈 다섯 개(`expo-secure-store`, `expo-crypto`, `expo-apple-authentication`, `expo-web-browser`, `expo-linking`)가 추가됐으나 네이티브 프로젝트가 재생성되지 않아 앱이 시작 즉시 `Cannot find native module 'ExpoSecureStore'`로 죽고 흰 화면만 나왔다. `expo prebuild --clean`과 `pod install`로 해결했다.
- 개발 환경은 이제 별도 앱이다. 번들 ID `com.fitin.app.dev`, 표시 이름 FitIn Dev, URL scheme `fitin-dev`, 워크스페이스 `ios/FitInDev.xcworkspace`. 운영용 `com.fitin.app`과 한 기기에 공존한다. 기기에 남아 있는 예전 `com.spdaewoon.fitin` 앱은 별개이며 수동으로 지워야 한다.
- `xcodebuild ... -configuration Release -sdk iphonesimulator ... CODE_SIGNING_ALLOWED=NO build`: BUILD SUCCEEDED. 2.4MB JS 번들이 포함됐고 세 네이티브 모듈이 바이너리에 존재함을 확인했다.
- iPhone 17 Pro 시뮬레이터에 설치·실행. 로그인 화면이 정상 렌더링되고 프로세스가 유지됐다. Apple·Google 버튼은 비활성으로 표시되는데, 해당 제공자가 백엔드에 설정되지 않았기 때문이며 의도된 동작이다.
- **실제 로그인은 아직 한 번도 성공하지 않았다.** 제공자 설정이 콘솔에서 끝나야 검증할 수 있다. 실기기, 오디오, 워치, 백그라운드 동작은 여전히 미검증이다.


- Xcode 26.4.1 (17E202), iOS SDK 26.4, iOS simulator runtime 26.4.1; CocoaPods 1.17.0, Node 22.
- `xcodebuild ... -configuration Release -sdk iphonesimulator ... CODE_SIGNING_ALLOWED=NO build`: BUILD SUCCEEDED. Installed and launched `com.spdaewoon.fitin` on iPhone 17 Pro simulator; the initial image-led home screen rendered without an error overlay. Full interaction QA is not claimed.
- `xcodebuild ... -configuration Release -sdk iphoneos ... DEVELOPMENT_TEAM=<local team> CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build`: BUILD SUCCEEDED with the existing personal Apple Development identity, after removing the unused APNs entitlement. Version 0.0.1, build 1. Secrets and profiles are not committed.
- `codesign --verify --deep --strict .expo/ios-device-build/Build/Products/Release-iphoneos/FitIn.app`: succeeded.
- Embedded JS/assets provide standalone execution, without a development server. Build outputs are ignored `.expo/ios-build` and `.expo/ios-device-build` directories. Reproduce through [build instructions](architecture/IOS_BUILD.md).
- Physical install was attempted through `devicectl device install app`, but failed with CoreDevice error 1011: the iPhone 16 Pro was offline/unavailable. This is not a successful device installation. Connect/trust/unlock the phone and enable Developer Mode to continue.
- This evidence verifies native compilation/signing and initial simulator launch only. It does not verify production readiness, all screens, local reminder delivery, music ducking, AirPods controls, WatchConnectivity, HealthKit or physical storage recovery.
