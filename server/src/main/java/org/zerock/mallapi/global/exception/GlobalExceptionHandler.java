package org.zerock.mallapi.global.exception;

import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
@Log4j2
public class GlobalExceptionHandler {
    
    // IllegalArgumentException 처리 (비즈니스 로직 에러)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("비즈니스 로직 에러: {}", e.getMessage());
        
        return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "VALIDATION_ERROR",
                    "message", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
                ));
    }
    
    // AccessDeniedException 처리 (권한 에러)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException e) {
        log.warn("권한 에러: {}", e.getMessage());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                    "error", "ACCESS_DENIED",
                    "message", "접근 권한이 없습니다.",
                    "timestamp", System.currentTimeMillis()
                ));
    }
    
    // RuntimeException 처리 (일반적인 런타임 에러)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        log.error("런타임 에러: {}", e.getMessage(), e);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "INTERNAL_ERROR",
                    "message", "서버 내부 오류가 발생했습니다.",
                    "timestamp", System.currentTimeMillis()
                ));
    }
    
    // 기타 모든 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception e) {
        log.error("예상치 못한 에러: {}", e.getMessage(), e);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "UNEXPECTED_ERROR",
                    "message", "예상치 못한 오류가 발생했습니다.",
                    "timestamp", System.currentTimeMillis()
                ));
    }
}
