# Local iOS build and run

Use Node 22+, full Xcode and CocoaPods. Native folders are generated and ignored; `app.json`, `app.config.js`, package lock and the independent [version ledger](../releases/versions.json) are the reproducible inputs. iOS version is 0.0.1 build 1; source/web remain development 0.0.2. Do not retag the historical 0.0.1 source release.

```sh
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
npm ci
FITIN_PLATFORM=ios npx expo prebuild --platform ios --no-install
pod install --project-directory=ios
xcodebuild -workspace ios/FitInDev.xcworkspace -scheme FitInDev -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath .expo/ios-build build
xcrun simctl list devices available
# Boot a listed iPhone UDID, then:
xcrun simctl install booted .expo/ios-build/Build/Products/Release-iphonesimulator/FitInDev.app
xcrun simctl launch booted com.spong.fitin.dev
open -a Simulator
```

**시뮬레이터 빌드에 `CODE_SIGNING_ALLOWED=NO`를 쓰지 말 것.** 엔타이틀먼트가 하나도 없는 앱이 나오고, 그러면 키체인 접근이 `ERR_KEY_CHAIN`으로 거부된다. 인증 세션을 보안 저장소에 넣기 때문에 로그인 화면에 "요청을 완료하지 못했어요"가 뜨고, 원인이 백엔드나 제공자 설정처럼 보인다. 실제로는 서명이 없어서 생긴 문제이며 실기기 빌드에는 해당하지 않는다. 서명을 켜고 빌드하면 시뮬레이터에서도 정상 동작한다.

Run prebuild and CocoaPods sequentially. Prebuild may recreate the native directory; never run it during pod install or a build. The Release configuration embeds JS/assets and does not require Metro. `ios/.xcode.env.local` contains the generated Node executable path; regenerate it via pod install if that runtime disappears.

For a real iPhone: connect by USB, trust this Mac, enable Developer Mode, and make the phone reachable in `xcrun devicectl list devices`. Use `FITIN_PLATFORM=ios npx expo run:ios --device --configuration Release` with an available Apple development signing team/profile. No certificate or provisioning secret belongs in Git. Simulator success does not imply real-device signing, installation, background speech or AirPods acceptance.

## 개인 Apple 팀으로 실기기에 올리기

무료 개인 팀은 Sign in with Apple 기능을 프로비저닝할 수 없어 Xcode가 기기 빌드를 거부한다. `npm run prebuild:ios:personal`은 `FITIN_PERSONAL_TEAM=1`로 prebuild를 실행해 해당 엔타이틀먼트를 빼고, 개인 팀 서명이 통과하게 한다. 실행할 때 경고를 출력한다.

그 빌드에서는 **Apple 로그인이 동작하지 않는다.** Google 로그인과 둘러보기는 정상이다. 플래그는 `FITIN_ENV=production`이면 무시되므로 운영 빌드에서 기능이 사라질 수 없다.

`prebuild`는 네이티브 프로젝트를 새로 만들기 때문에 Xcode에서 골라둔 서명 팀이 매번 지워지고, 그대로 빌드하면 "Signing requires a development team"으로 실패한다. `.env.development.local`의 `FITIN_APPLE_TEAM_ID`에 팀 ID를 넣어두면 플러그인이 매 prebuild마다 복원한다. 비밀값은 아니지만 계정을 식별하므로 저장소에 커밋하지 않는다.

이건 임시 우회이지 해결이 아니다. Apple 로그인, TestFlight, App Store 배포는 모두 유료 Apple Developer Program 가입이 필요하다. 가입 후에는 `npm run prebuild:ios`로 다시 생성해 엔타이틀먼트를 되살린다. 시뮬레이터 빌드는 프로비저닝이 필요 없으므로 플래그 없이 그대로 쓸 수 있다.

The `with-local-notifications` config plugin must precede `expo-notifications`: Expo runs entitlement mods in reverse registration order. It removes the unused APNs entitlement, enabling personal-team signing while retaining local reminders. Inspect the generated entitlements after changing plugins; remote push is not part of this offline app.

watchOS requires its own native companion target and connectivity implementation; the in-app Watch preview is not an installable Watch app. HealthKit is still planned.
