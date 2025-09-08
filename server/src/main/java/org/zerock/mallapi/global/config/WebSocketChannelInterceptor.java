package org.zerock.mallapi.global.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.zerock.mallapi.domain.member.dto.MemberDTO;

import java.util.List;
import java.util.Map;

@Component
@Log4j2
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        SimpMessageHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, SimpMessageHeaderAccessor.class);
        
        if (accessor != null) {
            // WebSocket 세션 attributes에서 사용자 정보 가져오기
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
              if (sessionAttributes != null) {
                // memberNo는 Integer나 Long일 수 있으므로 안전하게 처리
                Object memberNoObj = sessionAttributes.get("memberNo");
                Long memberNo = null;
                if (memberNoObj instanceof Integer) {
                    memberNo = ((Integer) memberNoObj).longValue();
                } else if (memberNoObj instanceof Long) {
                    memberNo = (Long) memberNoObj;
                }
                
                String email = (String) sessionAttributes.get("email");
                @SuppressWarnings("unchecked")
                List<String> roleNames = (List<String>) sessionAttributes.get("roleNames");
                  if (memberNo != null && email != null) {
                    // MemberDTO 생성 (기존 생성자 사용)
                    MemberDTO memberDTO = new MemberDTO(memberNo, email, "", "", false, roleNames);
                    
                    // Spring Security Authentication 생성
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());
                    
                    // 메시지 헤더에 인증 정보 설정
                    accessor.setUser(authentication);
                    
                    log.debug("WebSocket 메시지에 인증 정보 설정 완료: {}", email);
                }
            }
        }
        
        return message;
    }
}
