package org.zerock.mallapi.global.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

/**
 * 날짜 시간 관련 유틸리티 클래스
 * 프로젝트 전체에서 일관된 날짜 형식(yyyy-MM-dd HH:mm:ss)을 보장합니다.
 */
public class DateTimeUtil {
    
    /**
     * 프로젝트 전체에서 사용할 날짜 시간 패턴 상수
     */
    public static final String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    
    /**
     * 한국 시간대 상수
     */
    public static final ZoneId KOREA_ZONE = ZoneId.of("Asia/Seoul");
    
    /**
     * LocalDateTime에서 나노초를 제거하여 초까지만 반환
     * @param dateTime 원본 LocalDateTime
     * @return 나노초가 제거된 LocalDateTime (yyyy-MM-dd HH:mm:ss.000)
     */
    public static LocalDateTime truncateToSecond(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.truncatedTo(ChronoUnit.SECONDS);
    }
      /**
     * 현재 시간을 초까지만 반환 (한국 시간대 기준)
     * @return 현재 시간에서 나노초가 제거된 LocalDateTime
     */
    public static LocalDateTime nowToSecond() {
        return truncateToSecond(LocalDateTime.now(KOREA_ZONE));
    }
      /**
     * 엔티티에서 사용할 현재 시간 반환 (modified_date 용)
     * @return 초까지만 포함된 현재 시간
     */
    public static LocalDateTime getModifiedTime() {
        return nowToSecond();
    }
      /**
     * 엔티티에서 사용할 현재 시간 반환 (joined_date 용)
     * @return 초까지만 포함된 현재 시간
     */
    public static LocalDateTime getJoinedTime() {
        return nowToSecond();
    }
    
    /**
     * LocalDateTime을 문자열로 포맷
     * @param dateTime 포맷할 LocalDateTime
     * @return 포맷된 문자열 (yyyy-MM-dd HH:mm:ss)
     */
    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(java.time.format.DateTimeFormatter.ofPattern(DATE_TIME_PATTERN));
    }
    
    /**
     * 문자열을 LocalDateTime으로 파싱
     * @param dateTimeString 파싱할 문자열 (yyyy-MM-dd HH:mm:ss 형식)
     * @return 파싱된 LocalDateTime
     */
    public static LocalDateTime parse(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.trim().isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(dateTimeString, java.time.format.DateTimeFormatter.ofPattern(DATE_TIME_PATTERN));
    }
}
