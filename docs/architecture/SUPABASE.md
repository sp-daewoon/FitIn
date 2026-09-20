# Supabase 계정과 개인 루틴

상태: 2026-09-13 설계 및 DB 마이그레이션 준비. 운영 프로젝트 연결, 로그인 화면, 실제 인증과 동기화는 아직 구현/검증되지 않았다. 기존 로컬 운동 기능은 계속 사용한다.

## 화면과 가입 방식

- 설정 → 계정: Apple로 계속하기 / Google로 계속하기 / 이메일로 계속하기. 가입 없이 운동하기도 유지한다.
- 이메일은 인증번호 방식으로 시작한다. 가입·로그인을 한 화면으로 통합하고, 약관·개인정보처리방침 확인 후 처음 사용하는 이메일은 계정을 생성한다. 전송 성공을 로그인 성공으로 표시하지 않는다. 인증 완료 후에만 계정 상태를 변경한다.
- 내 루틴 → 계정에 저장: 최초 로그인 때 기기 루틴을 계정으로 가져올지 확인한다. 이미 계정 루틴이 있으면 두 내용을 비교하고 선택하게 한다. 로그인만으로 어느 쪽도 덮어쓰지 않는다.
- 이후 내 루틴에 저장 상태(기기에 저장 / 동기화 대기 / 계정에 저장 / 충돌)를 표시한다. 로그인·네트워크가 없어도 운동과 로컬 저장은 가능하다.
- 설정 → 계정 → 로그아웃 / 계정 삭제. 계정 삭제는 재확인·재인증 및 서버 처리 결과까지 필요하다. Apple 인증을 사용하는 계정은 Apple 토큰 철회도 서버에서 처리해야 한다.

영어가 기본이며 한국어 설정을 화면과 이메일 요청 언어에 반영한다. Apple 비공개 이메일과 Google 이메일이 다르다고 이름만으로 계정을 합치지 않는다. 계정 연결은 인증된 세션에서 제공자 소유를 다시 증명하는 별도 흐름이다.

## 저장 범위와 충돌

첫 단계는 비공개 개인 루틴만 저장한다. `routine_libraries`는 사용자당 한 행이며, 문서는 `{ version: 1, preferences: ... }` 형식이다. 기존 분할 방식·customCycle·templates·savedPlan·starters·globalRest를 함께 원자적으로 보존한다. 개별 운동 행으로 분리해 부분 동기화하다가 분할 구성과 템플릿이 어긋나는 것을 피한다.

운동 중 세션·타이머·진행 단계·운동 기록은 이 문서에 넣지 않는다. 클라이언트는 기존 codec으로 preferences를 검증한다. 서버도 문서 종류와 크기를 제한한다. 공개 루틴과 포인트는 이후 별도 테이블과 검수·신고·차단·서버 원장으로 구현한다. 개인 루틴 테이블을 공개 조회 가능하게 바꾸지 않는다.

`owner_id`는 Supabase Auth UUID이며 RLS가 소유자만 CRUD하도록 제한한다. 클라이언트에는 publishable key만 넣는다. `service_role`/secret key는 앱에 절대 포함하지 않는다.

갱신은 마지막으로 읽은 `revision`과 소유자를 조건으로 UPDATE한다. 갱신된 행이 0개면 충돌이므로 다시 읽고 선택을 요청한다. 무조건 upsert로 다른 기기의 수정을 덮어쓰지 않는다. DB trigger가 revision과 갱신 시각을 설정한다. 네트워크 오류 때도 로컬 원본을 유지한다.

캐시와 대기 작업은 사용자 UUID별로 분리한다. 로그아웃/계정 변경 때 이전 계정의 요청 결과를 폐기하고, 이전 회원 루틴을 새 회원에게 자동 업로드하지 않는다. 진행 중 운동의 snapshot은 로그인·동기화로 변경하지 않는다.

콘솔에서 실제로 눌러야 하는 절차는 [소셜 로그인 콘솔 설정](SOCIAL_LOGIN_SETUP.md)에 따로 있다.

## 운영자가 준비할 것

1. Supabase 계정과 FitIn 전용 프로젝트 생성. Project URL과 publishable key를 개발 환경에 설정한다. DB 비밀번호와 secret key는 공유하지 않는다.
2. 개발·운영 프로젝트를 분리하고 운영 리전, 비용 한도, 백업/복원 정책을 결정한다. 마이그레이션은 먼저 개발 프로젝트에 적용한다.
3. Apple Developer 가입과 최종 Bundle ID 확정 후 Sign in with Apple을 설정한다. iOS는 네이티브 ID token 인증을 우선한다. 웹/Android용 Apple OAuth에는 Services ID와 검증된 웹 도메인·return URL 설정이 추가로 필요하다. 웹용 client secret 갱신도 운영 항목이다.
4. Google Cloud OAuth 동의 화면과 플랫폼별 Client ID 생성. Supabase callback URL과 앱 복귀 URL을 정확히 등록한다. OAuth는 PKCE와 검증된 callback을 사용하고 토큰을 로그에 남기지 않는다.
5. 이메일 발신 도메인과 SMTP 설정. Supabase Magic Link 이메일 템플릿에 `{{ .Token }}`을 넣어 인증번호를 보낸다. 영어/한국어 템플릿, 만료·재전송·오입력 제한과 실제 수신을 확인한다.
6. 고객지원 이메일, 개인정보처리방침, 이용약관에 계정·루틴 서버 저장과 삭제 정책을 반영한다. 계정 삭제 서버 기능을 완성한 뒤 회원가입을 운영에 공개한다.

## 다음 구현과 필수 검증

준비된 SQL은 `supabase/migrations/202609130001_private_routines.sql`이다. `npm run test:rls`는 다른 프로젝트에 접근하지 않는 임시 Postgres 컨테이너에서 RLS·revision·삭제 연쇄를 검증한다. Docker가 필요하며 Auth의 UUID 전달 부분은 테스트용 대체 함수다. 실제 Supabase 프로젝트 검증과 구분한다.

1. Supabase client와 세션 보관, 계정 화면, 이메일 OTP 인증.
2. Apple/Google 인증 및 앱 복귀, 취소·만료·재실행, 계정 삭제.
3. 최초 루틴 가져오기, revision 기반 저장·충돌 UI, 오프라인 대기와 계정별 캐시.
4. 회원 A/B와 비로그인 사용자의 실제 API로 상호 조회·수정·삭제 차단을 검증한다. SQL 수준 테스트만으로 Auth/OAuth 동작을 인증하지 않는다.
5. 기존 로컬 기록/세션 보존, 동시 기기 편집, 로그아웃 도중 요청 완료, 실패한 업로드 후 재시도를 회귀 검증한다.

## 공식 근거

- [Supabase React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [이메일 OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Apple 인증](https://supabase.com/docs/guides/auth/social-login/auth-apple), [Google 인증](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Apple 앱 내 계정 삭제](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
