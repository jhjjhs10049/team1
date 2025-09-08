# 🔐 JWT 토큰 시간 관리 가이드

## 📝 개요
이 프로젝트는 JWT 토큰의 유지시간을 중앙에서 간편하게 관리할 수 있도록 설정되어 있습니다.

## ⚙️ 토큰 시간 변경 방법

### 🎯 **서버 설정 (한 곳에서만 관리)**
**파일: `/server/src/main/java/org/zerock/mallapi/global/config/TokenConfig.java`**

```java
public class TokenConfig {
    // 🔐 액세스 토큰 시간 (분 단위) - 모든 상황에서 동일
    public static final int ACCESS_TOKEN_MINUTES = 1;        // 여기 숫자만 변경!
    
    // 🔄 리프레시 토큰 시간 (분 단위) - 모든 상황에서 동일  
    public static final int REFRESH_TOKEN_MINUTES = 1440;     // 여기 숫자만 변경!
    
    // 🚨 갱신 임계값 (분 단위)
    public static final int REFRESH_THRESHOLD_MINUTES = 60;   // 여기 숫자만 변경!
}
```

## 🔧 **적용 범위**
이 설정은 다음 모든 상황에 적용됩니다:
- ✅ 일반 로그인 (`APILoginSuccessHandler`)
- ✅ 카카오 소셜 로그인 (`SocialController`)
- ✅ 토큰 자동 갱신 (`APIRefreshController`)

## 🕐 시간 단위 참고표

| 시간 | 분 단위 | 설명 |
|------|---------|------|
| 5분 | 5 | 테스트용 |
| 10분 | 10 | 짧은 세션 |
| 30분 | 30 | 일반적인 액세스 토큰 |
| 1시간 | 60 | 긴 액세스 토큰 |
| 12시간 | 720 | 반나절 |
| 24시간 | 1440 | 하루 (리프레시 토큰) |
| 7일 | 10080 | 일주일 |

## 🔄 변경 후 적용 방법

**서버 재시작 필요**: 파일 저장 후 서버를 재시작해야 적용됩니다.

## 💡 권장 설정

### 🛡️ 보안 중시 (운영 환경)
```java
ACCESS_TOKEN_MINUTES = 15;        // 15분
REFRESH_TOKEN_MINUTES = 1440;     // 24시간
REFRESH_THRESHOLD_MINUTES = 60;   // 1시간
```

### 🎯 개발 편의성 중시 (개발 환경)
```java
ACCESS_TOKEN_MINUTES = 60;        // 1시간
REFRESH_TOKEN_MINUTES = 10080;    // 7일
REFRESH_THRESHOLD_MINUTES = 120;  // 2시간
```

### ⚖️ 균형 잡힌 설정 (기본 권장)
```java
ACCESS_TOKEN_MINUTES = 30;        // 30분
REFRESH_TOKEN_MINUTES = 1440;     // 24시간
REFRESH_THRESHOLD_MINUTES = 60;   // 1시간
```

## 🚨 주의사항

1. **액세스 토큰**은 너무 길면 보안 위험, 너무 짧으면 사용자 불편
2. **리프레시 토큰**은 액세스 토큰보다 훨씬 길어야 함
3. **갱신 임계값**은 사용자가 인지하지 못하도록 충분한 여유 시간 설정
4. 변경 후 반드시 테스트해보기!
5. **서버 재시작 필수**: 설정 변경 후 서버를 재시작해야 적용됩니다.
