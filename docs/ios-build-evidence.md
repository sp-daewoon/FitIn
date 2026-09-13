# iOS development build evidence · 2026-09-12

## 2026-09-14 · 서울 프로젝트 연결과 서명 함정

- 개발용 Supabase 프로젝트를 서울 리전으로 다시 만들고 마이그레이션 세 개를 적용했다. 리전은 생성 후 변경할 수 없다.
- **Xcode로 만든 앱은 백엔드 주소가 비어 있었다.** Xcode가 빌드 단계에서 `app.config.js`를 자체 환경으로 재실행하는데 프로젝트 환경변수가 없기 때문이다. 마지막으로 해석된 환경을 파일로 남겨 같은 환경 이름일 때만 되읽도록 고쳤다. 환경변수 없이 빌드한 결과물이 서울 프로젝트 주소와 공개 키를 담고 있음을 확인했다.
- **시뮬레이터 빌드에 `CODE_SIGNING_ALLOWED=NO`를 쓰면 안 된다.** 엔타이틀먼트가 없는 앱이 나와 키체인 접근이 거부되고, 로그인 화면에 요청 실패 메시지가 뜬다. 백엔드 문제로 보이지만 서명 문제다. 서명을 켜고 다시 빌드하니 에러가 사라지고 Supabase에서 200 응답을 받았다. 실기기 빌드는 정상 서명되므로 해당 없다.
- 실기기 Debug 빌드 성공. 번들 ID `com.spong.fitin.dev`, 팀 XBFPQ273B5, 프로비저닝 프로파일 포함, Apple 로그인 엔타이틀먼트 없음. 개인 팀 서명을 위한 의도된 절충이다.
- **실제 로그인은 아직 한 번도 성공하지 않았다.** 인증 제공자가 하나도 켜져 있지 않다. 실기기 설치, 오디오, 워치, 백그라운드 동작은 여전히 미검증이다.


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
