package org.zerock.mallapi.domain.multchat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.zerock.mallapi.domain.member.dto.MemberDTO;

import java.util.List;
import java.util.Map;

/**
 * 단체채팅 사용자 서비스
 * - 사용자 인증 정보 처리
 * - 닉네임 결정 로직
 * - JWT 토큰 및 세션 처리
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class MultChatUserService {

    /**
     * WebSocket 헤더에서 사용자 정보 추출
     */
    public MemberDTO extractUserInfo(SimpMessageHeaderAccessor headerAccessor) {
        // JWT 토큰에서 사용자 정보 추출
        Authentication auth = (Authentication) headerAccessor.getUser();
        MemberDTO memberDTO = null;
        
        if (auth == null) {
            memberDTO = extractFromSession(headerAccessor);
        } else {
            memberDTO = (MemberDTO) auth.getPrincipal();
            log.info("JWT 토큰에서 사용자 정보 추출: {} ({})", 
                     memberDTO.getNickname(), memberDTO.getEmail());
        }
        
        return memberDTO;
    }

    /**
     * WebSocket 세션에서 사용자 정보 복원
     */
    private MemberDTO extractFromSession(SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return null;
        }

        // memberNo는 Integer나 Long일 수 있으므로 안전하게 처리
        Object memberNoObj = sessionAttributes.get("memberNo");
        Long memberNo = null;
        if (memberNoObj instanceof Integer) {
            memberNo = ((Integer) memberNoObj).longValue();
        } else if (memberNoObj instanceof Long) {
            memberNo = (Long) memberNoObj;
        }

        String email = (String) sessionAttributes.get("email");
        String nickname = (String) sessionAttributes.get("nickname");
        Boolean social = (Boolean) sessionAttributes.get("social");
        @SuppressWarnings("unchecked")
        List<String> roleNames = (List<String>) sessionAttributes.get("roleNames");

        if (memberNo != null && email != null) {
            // 닉네임이 세션에 없는 경우 이메일에서 추출
            if (nickname == null || nickname.isEmpty()) {
                nickname = email.split("@")[0];
            }

            // social 정보가 없는 경우 기본값 설정
            if (social == null) {
                social = false;
            }

            // roleNames가 없는 경우 기본 권한 설정
            if (roleNames == null || roleNames.isEmpty()) {
                roleNames = List.of("USER");
            }

            // 정상적인 생성자를 사용하여 MemberDTO 생성
            MemberDTO memberDTO = new MemberDTO(memberNo, email, "temp", nickname, social, roleNames);
            log.info("세션에서 사용자 정보 복원 완료: {} ({})", nickname, email);
            return memberDTO;
        }

        return null;
    }

    /**
     * 최종 닉네임 결정 (서버 측 닉네임 -> 클라이언트 닉네임 -> 이메일 추출 순서)
     */
    public String determineFinalNickname(MemberDTO memberDTO, String clientNickname) {
        String serverNickname = memberDTO != null ? memberDTO.getNickname() : null;
        String email = memberDTO != null ? memberDTO.getEmail() : null;

        String finalNickname;

        // 서버 측 닉네임이 우선
        if (serverNickname != null && !serverNickname.trim().isEmpty()) {
            finalNickname = serverNickname;
            log.info("📝 서버 측 닉네임 사용: '{}'", finalNickname);
        }
        // 서버 측 닉네임이 없으면 클라이언트 닉네임 사용
        else if (clientNickname != null && !clientNickname.trim().isEmpty()) {
            finalNickname = clientNickname;
            log.info("📝 클라이언트 닉네임 사용: '{}'", finalNickname);
        }
        // 둘 다 없으면 이메일에서 추출
        else if (email != null) {
            finalNickname = email.split("@")[0];
            log.info("📝 이메일에서 닉네임 추출: '{}'", finalNickname);
        }
        // 모든 방법이 실패하면 기본값
        else {
            finalNickname = "익명";
            log.warn("📝 모든 닉네임 추출 방법 실패, 기본값 사용: '{}'", finalNickname);
        }

        return finalNickname;
    }

    /**
     * 세션에 사용자 정보 저장
     */
    public void saveUserToSession(SimpMessageHeaderAccessor headerAccessor, 
                                  String username, Long roomNo, Long memberNo) {
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("roomNo", roomNo);
        headerAccessor.getSessionAttributes().put("memberNo", memberNo);
        
        log.info("세션에 사용자 정보 저장 완료 - username: {}, roomNo: {}, memberNo: {}", 
                 username, roomNo, memberNo);
    }

    /**
     * 사용자 인증 확인
     */
    public boolean isUserAuthenticated(MemberDTO memberDTO) {
        boolean authenticated = memberDTO != null && memberDTO.getMemberNo() != null;
        if (!authenticated) {
            log.error("인증되지 않은 사용자 접근 시도");
        }
        return authenticated;
    }
}
