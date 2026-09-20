# 소셜 로그인 콘솔 설정

Google과 Apple 로그인을 동작시키기 위해 콘솔에서 해야 하는 작업이다. 코드로 대신할 수 없는 부분만 다룬다. 정책과 결정 근거는 [계정·동기화·환경 분리 결정](../releases/accounts-and-environments.md), 데이터 설계는 [Supabase 설계](SUPABASE.md)를 본다.

환경마다 처음부터 다시 해야 한다. 개발과 운영은 **별도 Supabase 프로젝트, 별도 앱 식별자, 별도 OAuth 클라이언트**를 쓴다.

## 먼저 정해둘 것

- **앱 식별자.** 운영용은 스토어 제출 후 영원히 바뀌지 않는다. 개발용은 여기에 `.dev`를 붙인다.
- **Supabase 프로젝트 리전.** 생성 후 변경할 수 없다. 한국 사용자 대상이면 서울로 만든다.
- 프로젝트 주소와 publishable key는 `.env.<환경>.local`에 넣는다. 저장소에 커밋하지 않는다.

## Google Cloud

프로젝트를 만든 뒤 화면 위쪽 프로젝트 선택기에서 그 프로젝트가 선택되어 있는지 확인하고 시작한다. 콘솔 메뉴 구조가 자주 바뀌므로 주소로 직접 이동하는 편이 빠르다.

### 1. 앱 정보

`https://console.cloud.google.com/auth/branding`

앱 이름, 사용자 지원 이메일, 개발자 연락처를 채운다. 앱 이름은 구글 로그인 동의 화면에 그대로 노출된다.

### 2. 대상과 테스트 사용자

`https://console.cloud.google.com/auth/audience`

사용자 유형을 **External**로 둔다. 그리고 **테스트 사용자 목록에 로그인해볼 계정을 반드시 추가한다.**

게시 상태가 테스트인 동안에는 여기 등록된 계정만 로그인할 수 있고, 그렇지 않으면 "액세스 차단됨"이 뜬다. 화면에 원인이 나오지 않아 찾는 데 시간이 걸리는 항목이다.

### 3. 웹 애플리케이션 클라이언트

`https://console.cloud.google.com/auth/clients` (구버전 콘솔은 `/apis/credentials`)

애플리케이션 유형을 **웹 애플리케이션**으로 만든다. iOS가 아니다. 브라우저를 거치는 흐름과 토큰 검증에 이 값이 쓰인다.

**승인된 리디렉션 URI**에 Supabase 콜백을 넣는다. 자바스크립트 원본 칸이 아니다.

```
https://<프로젝트-ref>.supabase.co/auth/v1/callback
```

생성 직후 뜨는 **클라이언트 ID와 클라이언트 보안 비밀번호**를 복사해둔다. 보안 비밀번호는 나중에 다시 보기 어렵다.

### 4. iOS 클라이언트

같은 화면에서 애플리케이션 유형 **iOS**로 하나 더 만든다. 네이티브 계정 선택 화면을 쓰려면 필요하다.

- **번들 ID**는 필수이고 해당 환경의 앱 식별자와 정확히 같아야 한다.
- App Store ID와 팀 ID는 선택 항목이며 비워도 된다.
- **iOS 클라이언트는 번들 ID 하나당 하나다.** 개발용과 운영용을 각각 만든다.

클라이언트 ID를 `.env.<환경>.local`의 `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`에 넣는다. 이 값이 있으면 앱이 네이티브 방식으로 동작하고, 없으면 브라우저 방식으로 동작한다.

## Supabase

대시보드 주소는 `https://supabase.com/dashboard/project/<프로젝트-ref>` 아래에 있다.

### 1. 제공자

`/auth/providers`

- **Google을 켜고** 웹 클라이언트 ID와 보안 비밀번호를 넣는다.
- **Client IDs 칸에 웹과 iOS 클라이언트 ID를 쉼표로 이어서** 넣는다. 예전 콘솔의 "Authorized Client IDs"가 이 칸으로 합쳐졌다. 웹 값을 지우고 바꾸는 것이 아니라 덧붙이는 것이다. 브라우저 흐름은 웹 클라이언트를, 네이티브 흐름은 iOS 클라이언트를 수신자로 쓰므로 둘 다 있어야 한다.
- **Skip nonce checks를 Google에만 켠다.** 구글 iOS SDK가 토큰 안에 nonce를 넣는데 사용하는 라이브러리가 그 값을 노출하지 않아, 켜지 않으면 모든 네이티브 로그인이 `Passed nonce and nonce in id_token should either both exist or not`로 실패한다. **Apple에는 켜지 않는다.** 애플은 앱이 nonce를 직접 만들어 넘긴다.
- **Email 제공자를 끈다.** 데이터베이스가 이미 이메일 가입을 거부하지만, 켜둔 채로 두면 사용자가 원인을 알 수 없는 오류를 본다.

### 2. 복귀 주소

`/auth/url-configuration`

Redirect URLs에 앱의 복귀 주소를 추가한다. 개발은 `fitin-dev://auth/callback`, 운영은 `fitin://auth/callback`이다.

**빠뜨리면 구글 로그인은 성공하는데 앱으로 돌아오지 못한다.** 브라우저가 열린 채 멈추거나 취소된 것처럼 보여서 원인을 짐작하기 어렵다.

### 3. 토큰 훅

`/auth/hooks`

**Customize Access Token (JWT) Claims**를 Postgres 함수로 지정하고 `public.fitin_access_token_hook`을 고른다. 마이그레이션이 이미 만들어둔 함수다.

이메일 방식 로그인이면 토큰 발급을 거부하고, 정상이면 어느 제공자로 가입했는지를 토큰에 새긴다. 제공자 설정이 잘못 바뀌어도 한 번 더 막는 장치다.

## Apple

Apple Developer Program 유료 가입이 선행된다. 무료 개인 팀은 Sign in with Apple 기능을 프로비저닝할 수 없어 기기 빌드 자체가 실패한다. 가입 전까지의 우회는 [iOS 빌드 문서](IOS_BUILD.md)를 본다.

가입 후 Apple 제공자를 켜고, iOS는 네이티브 방식을 우선한다. 웹과 Android용으로는 Services ID와 검증된 도메인 설정이 추가로 필요하다.

## 확인

설정이 끝나면 문서만 보고 넘기지 말고 실제로 확인한다.

제공자가 켜졌는지는 설정 조회로 볼 수 있다.

```sh
curl -s "$URL/auth/v1/settings" -H "apikey: $KEY" | python3 -m json.tool
```

로그인 흐름이 뚫렸는지는 인증 요청이 구글로 넘어가는지로 본다. 사용자를 만들지 않는다.

```sh
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  "$URL/auth/v1/authorize?provider=google&redirect_to=fitin-dev%3A%2F%2Fauth%2Fcallback" -H "apikey: $KEY"
```

302와 `accounts.google.com`으로의 이동이 나와야 한다. 리디렉션 주소에 실린 `client_id`가 등록한 웹 클라이언트와 같은지도 함께 본다.

**마지막 확인은 기기에서 직접 한다.** 한 제공자로 가입한 뒤 같은 이메일로 다른 제공자를 시도해 **계정이 합쳐지지 않고 안내가 뜨는지** 본다. 이 앱의 계정 규칙이 실제로 동작하는지는 이것으로만 증명된다. SQL 수준 확인은 인증 동작을 검증한 것이 아니다.

## 운영 환경에서 달라지는 것

- Supabase 프로젝트가 다르므로 콜백 주소, 복귀 주소, 토큰 훅을 그 프로젝트에 다시 설정한다.
- 앱 식별자가 다르므로 iOS 클라이언트를 새로 만든다.
- 구글 앱 게시 상태를 테스트에서 프로덕션으로 올려야 테스트 사용자 목록 밖의 사람이 로그인할 수 있다. 검토가 필요할 수 있으므로 출시 일정에 넣는다.
- 개인정보처리방침 주소가 필요하다. 목록은 [계정·동기화·환경 분리 결정](../releases/accounts-and-environments.md)에 있다.
