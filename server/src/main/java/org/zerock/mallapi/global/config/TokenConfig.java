package org.zerock.mallapi.global.config;

/**
 * 간단한 토큰 시간 관리 클래스
 * 여기서 숫자만 바꾸면 토큰 시간이 변경됩니다.
 */
public class TokenConfig {

    // 🔐 액세스 토큰 시간 (분 단위) - 모든 상황에서 동일
    public static final int ACCESS_TOKEN_MINUTES = 30;        // 일반로그인, 카카오로그인, 토큰갱신 모두 동일
    
    // 🔄 리프레시 토큰 시간 (분 단위) - 모든 상황에서 동일  
    public static final int REFRESH_TOKEN_MINUTES = 1440;     // 24시간 (60 * 24)
    
    // 🚨 갱신 임계값 (분 단위)
    public static final int REFRESH_THRESHOLD_MINUTES =60;   // 1시간    // 토큰만료 테스트용 (더 빠른 만료)
    
    // 토큰만료 테스트용 (매우 빠른 만료)

    // public static final int ACCESS_TOKEN_MINUTES = 1;       
    
    // public static final int REFRESH_TOKEN_MINUTES = 1;     
    
    // public static final int REFRESH_THRESHOLD_MINUTES = 0;

}