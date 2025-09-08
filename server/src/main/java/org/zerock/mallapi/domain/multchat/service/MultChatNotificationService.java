package org.zerock.mallapi.domain.multchat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 단체채팅 알림 서비스
 * - WebSocket 메시지 전송
 * - 사용자 목록 업데이트 알림
 * - 시스템 메시지 전송
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class MultChatNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 사용자 목록 업데이트 알림 전송
     */
    public void sendUserListUpdate(Long roomNo, List<String> onlineUsers, 
                                   List<Map<String, Object>> participantList) {
        String notificationDestination = "/topic/multchat/room/" + roomNo + "/notification";
        
        Map<String, Object> userListNotification = Map.of(
            "type", "USER_LIST_UPDATE",
            "roomNo", roomNo,
            "onlineUsers", onlineUsers, // 기존 호환성을 위해 유지
            "participants", participantList, // 새로운 상세 참가자 정보
            "userCount", onlineUsers.size()
        );
        
        messagingTemplate.convertAndSend(notificationDestination, userListNotification);
        log.info("📤 사용자 목록 업데이트 알림 전송 완료 - 채팅방: {}, 참가자 수: {}, 목적지: {}", 
                 roomNo, onlineUsers.size(), notificationDestination);
        log.info("📤 전송된 알림 내용: {}", userListNotification);
        log.info("📤 현재 온라인 사용자 목록: {}", onlineUsers);
    }

    /**
     * 채팅 메시지 브로드캐스트
     */
    public void broadcastMessage(Long roomNo, Object message) {
        String destination = "/topic/multchat/room/" + roomNo;
        messagingTemplate.convertAndSend(destination, message);
        log.info("📤 채팅 메시지 브로드캐스트 완료 - 채팅방: {}, 목적지: {}", roomNo, destination);
    }

    /**
     * 시스템 메시지와 사용자 목록 업데이트를 함께 전송
     */
    public void sendSystemMessageWithUserUpdate(Long roomNo, Object systemMessage, 
                                                List<String> onlineUsers, 
                                                List<Map<String, Object>> participantList) {
        // 시스템 메시지 브로드캐스트
        broadcastMessage(roomNo, systemMessage);
        
        // 사용자 목록 업데이트 알림
        sendUserListUpdate(roomNo, onlineUsers, participantList);
    }

    /**
     * 알림 목적지 생성
     */
    public String getNotificationDestination(Long roomNo) {
        return "/topic/multchat/room/" + roomNo + "/notification";
    }

    /**
     * 메시지 목적지 생성
     */
    public String getMessageDestination(Long roomNo) {
        return "/topic/multchat/room/" + roomNo;
    }
}
