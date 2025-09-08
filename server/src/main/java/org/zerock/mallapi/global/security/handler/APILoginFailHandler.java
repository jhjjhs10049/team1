package org.zerock.mallapi.global.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.zerock.mallapi.global.exception.BannedMemberException;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;


@Log4j2
public class APILoginFailHandler implements AuthenticationFailureHandler {    //로그인 실패시 여기서 처리    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {

        log.info("Login fail....." + exception);
        log.info("Exception type: " + exception.getClass().getName());
        log.info("Exception message: " + exception.getMessage());
        log.info("Exception cause: " + exception.getCause());
        if (exception.getCause() != null) {
            log.info("Cause type: " + exception.getCause().getClass().getName());
        }        
        
        //Jackson ObjectMapper : java 객체를 JSON으로 바꾸거나, JSON을 자바 객체로 바꿔주는 도구
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // LocalDateTime 처리를 위해 JavaTimeModule 등록
        String jsonStr;// BannedMemberException인 경우 특별 처리 (직접 확인 또는 cause로 확인)
        BannedMemberException bannedException = null;
        
        // 직접 BannedMemberException인지 확인
        if (exception instanceof BannedMemberException) {
            bannedException = (BannedMemberException) exception;
            log.info("Direct BannedMemberException detected");
        }
        // cause가 BannedMemberException인지 확인
        else if (exception.getCause() instanceof BannedMemberException) {
            bannedException = (BannedMemberException) exception.getCause();
            log.info("BannedMemberException found in cause");
        }        if (bannedException != null) {
            log.info("정지된 회원의 로그인 시도: {}", bannedException.getMessage());
            log.info("정지 정보: {}", bannedException.getBanInfo());
            
            if (bannedException.getBanInfo() != null) {
                log.info("APILoginFailHandler에서 확인한 정지 정보 상세:");
                log.info("  - no: {}", bannedException.getBanInfo().getNo());
                log.info("  - memberNo: {}", bannedException.getBanInfo().getMemberNo());
                log.info("  - bannedAt: {}", bannedException.getBanInfo().getBannedAt());
                log.info("  - bannedUntil: {}", bannedException.getBanInfo().getBannedUntil());
                log.info("  - reason: {}", bannedException.getBanInfo().getReason());
                log.info("  - bannedBy: {}", bannedException.getBanInfo().getBannedBy());
            } else {
                log.error("BannedMemberException의 banInfo가 null입니다!");
            }
            
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403 상태코드
            
            // banInfo가 null인 경우 빈 Map 대신 기본 정보 제공
            Object banInfoToSend = bannedException.getBanInfo();
            if (banInfoToSend == null) {
                log.warn("banInfo가 null이므로 기본값을 사용합니다.");
                banInfoToSend = Map.of(
                    "reason", "정지된 회원입니다.",
                    "bannedAt", java.time.LocalDateTime.now().toString(),
                    "bannedUntil", (Object) null
                );
            }
            
            Map<String, Object> errorResponse = Map.of(
                "error", "MEMBER_BANNED",
                "message", bannedException.getMessage(),
                "banInfo", banInfoToSend
            );
            jsonStr = objectMapper.writeValueAsString(errorResponse);
            log.info("최종 전송할 JSON: {}", jsonStr);
        } else {
            // 일반적인 로그인 실패
            log.info("일반적인 로그인 실패");
            jsonStr = objectMapper.writeValueAsString(Map.of("error", "ERROR_LOGIN"));
        }

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
