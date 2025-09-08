# 🛡️ Spring Boot + React 보안 체계 통합 문서

## 📋 개요
JWT 토큰 기반 인증 시스템으로 백엔드와 프론트엔드의 보안 설정을 통일하여 일관성 있는 보안 체계를 구축

## 🏗️ 보안 체계 구조

### 백엔드 보안 계층
```
Request → SecurityConfig → JWTCheckFilter → @PreAuthorize → Service Layer
```

### 프론트엔드 보안 계층
```
JWT 자동 리프레시 → Protected Components → Role-based UI 제어
```

## 🔐 권한 레벨 체계

### 권한 계층 구조
- **USER** < **MANAGER** < **ADMIN**
- 모든 상위 권한은 하위 권한을 포함
- `hasAnyRole('USER','MANAGER','ADMIN')` 패턴 사용

### 권한별 접근 범위

#### 🟢 PUBLIC (인증 불필요)
- 회원가입, 로그인, 카카오 로그인
- 중복확인 API
- JWT 토큰 리프레시
- 게시글 목록/상세 조회
- 파일 조회 (이미지 다운로드)

#### 🔵 USER 이상 (인증 필요)
- 마이페이지 조회/수정
- 게시글 작성/수정/삭제
- 댓글 작성/수정/삭제
- 파일 업로드

#### 🟡 MANAGER 이상
- 회원 관리 (조회, 정지, 복구)
- 정지 내역 조회
- 관리자 조치 내역 조회

#### 🔴 ADMIN 전용
- 회원 권한 변경
- MANAGER 승격/해제
- 관리자 코드 부여

## 📁 컨트롤러별 보안 설정

### 🎯 BoardController
```java
// 게시글 작성/수정/삭제
@PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
```

### 💬 ReplyController
```java
// 댓글 작성/수정/삭제
@PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
```

### 📁 FileController
```java
// 파일 업로드 (조회는 public)
@PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
```

### 👤 MemberController
```java
// 마이페이지 조회/수정
@PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")

// 관리자 전용 기능
@PreAuthorize("hasRole('ADMIN')")
```

### 🏛️ AdminController
```java
// 회원 관리 (MANAGER 이상)
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")

// 권한 변경 (ADMIN 전용)
@PreAuthorize("hasRole('ADMIN')")
```

### 🌐 SocialController
```java
// 소셜 로그인 회원 정보 수정
@PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
```

## 🛠️ 주요 보안 설정 파일

### SecurityConfig 주요 설정
```java
// JWT 토큰 리프레시 허용
.requestMatchers("/api/member/refresh").permitAll()

// 게시판 API 패턴 수정
.requestMatchers("/api/board/*/replies/**").authenticated()

// 파일 API 분리
.requestMatchers("/api/files/**").permitAll()
```

### JWTCheckFilter 예외 경로
- `/api/member/login`
- `/api/member/join`
- `/api/member/refresh` ✅ 추가됨
- `/api/member/kakao`

## 🖥️ 프론트엔드 보안 구성

### Protected Components
- `ProtectedLogin`: 로그인 필요 페이지
- `ProtectedAdmin`: 관리자 권한 필요 페이지
- `ProtectedBoard`: 게시판 관리자 기능

### 권한 체크 통일
```javascript
// 통일된 권한 체크 방식
const userRole = loginState?.roleNames?.[0];
```

## 🔄 JWT 토큰 관리

### 자동 리프레시 로직
1. Access Token 만료 감지
2. Refresh Token으로 새 토큰 발급
3. 자동으로 요청 재시도
4. 사용자 경험 중단 없음

### 토큰 저장 방식
- 쿠키 기반 저장
- HttpOnly 설정으로 XSS 방어
- Secure 설정으로 HTTPS 전용

## 🧪 테스트 시나리오

### 기본 인증 테스트
1. ✅ 비로그인 사용자 게시글 조회 가능
2. ✅ 로그인 후 게시글 작성 가능
3. ✅ 토큰 만료 시 자동 리프레시
4. ✅ 권한 없는 페이지 접근 차단

### 관리자 기능 테스트
1. ✅ MANAGER 회원 관리 기능 접근
2. ✅ ADMIN 권한 변경 기능 접근
3. ✅ USER 관리자 페이지 접근 차단

## 🚀 최적화 포인트

### 성능 최적화
- JWT 검증 캐싱
- 권한 정보 메모리 캐시
- 불필요한 DB 조회 최소화

### 보안 강화
- 브루트포스 공격 방어
- API 요청 속도 제한
- 민감 정보 로깅 제외

## 📝 변경 이력

### v1.0 (2025-01-XX)
- JWT 토큰 리프레시 문제 해결
- Spring Security 패턴 오류 수정
- 파일 업로드 경로 통일
- 모든 컨트롤러 @PreAuthorize 통일
- 프론트엔드 권한 체크 로직 통일

## 🔧 유지보수 가이드

### 새로운 API 추가 시
1. 적절한 `@PreAuthorize` 어노테이션 추가
2. SecurityConfig에 경로 패턴 확인
3. 프론트엔드 권한 체크 로직 구현
4. 테스트 시나리오 업데이트

### 권한 체계 변경 시
1. 모든 컨트롤러 어노테이션 일괄 수정
2. 프론트엔드 권한 체크 로직 수정
3. 문서 업데이트
4. 전체 테스트 수행

---
**⚠️ 주의사항**: 보안 설정 변경 시 반드시 전체 테스트를 수행하고, 권한 체계의 일관성을 유지해야 합니다.
