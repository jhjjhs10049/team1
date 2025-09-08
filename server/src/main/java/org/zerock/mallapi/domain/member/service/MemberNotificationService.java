package org.zerock.mallapi.domain.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.zerock.mallapi.global.constants.WebSocketDestinations;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberNotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * 회원 상태 또는 권한 변경 시 강제 로그아웃 알림 전송
     */
    public void notifyMemberStatusChange(Long memberNo, String changeType, String reason, String adminRoleCode) {
        try {
            log.info("🚨 회원 상태 변경 알림 전송 시작 - 회원: {}, 변경 타입: {}, 사유: {}", 
                     memberNo, changeType, reason);
              // 강제 로그아웃 알림 메시지 생성
            MemberStatusChangeNotification notification = MemberStatusChangeNotification.builder()
                    .type("FORCE_LOGOUT")
                    .memberNo(memberNo)
                    .changeType(changeType) // "STATUS_CHANGE", "ROLE_CHANGE", "BAN"
                    .reason(reason)
                    .adminRoleCode(adminRoleCode)
                    .timestamp(System.currentTimeMillis())
                    .build();
            
            log.info("📤 생성된 알림 객체: {}", notification);
            
            // 해당 회원에게만 강제 로그아웃 알림 전송 (Queue 방식)
            String destination = WebSocketDestinations.Queue.memberLogout(memberNo);
            messagingTemplate.convertAndSend(destination, notification);
            
            log.info("✅ 회원 강제 로그아웃 알림 전송 완료: {}", destination);
            
        } catch (Exception e) {
            log.error("❌ 회원 상태 변경 알림 전송 오류: ", e);
        }
    }
    
    /**
     * 회원 상태 변경 알림을 위한 내부 클래스
     */
    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class MemberStatusChangeNotification {
        private String type;
        private Long memberNo;
        private String changeType;
        private String reason;
        private String adminRoleCode;
        private Long timestamp;
    }
}
