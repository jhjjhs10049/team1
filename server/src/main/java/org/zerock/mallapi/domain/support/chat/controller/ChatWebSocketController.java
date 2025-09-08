package org.zerock.mallapi.domain.support.chat.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.zerock.mallapi.domain.support.chat.dto.ChatMessageDTO;
import org.zerock.mallapi.domain.support.chat.service.ChatMessageService;
import org.zerock.mallapi.global.constants.WebSocketDestinations;

@Controller
@RequiredArgsConstructor
@Log4j2
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;    @MessageMapping("/chat/send")
    public void sendMessage(@Payload ChatMessageDTO messageData) {
        try {
            log.info("📥 1:1 채팅 웹소켓 메시지 수신: {}", messageData);
            
            // 메시지를 데이터베이스에 저장
            ChatMessageDTO savedMessage = chatMessageService.sendMessage(
                messageData.getChatRoomNo(), 
                messageData.getSenderNo(), 
                messageData.getMessage(), 
                messageData.getMessageType()
            );
              
            // 1:1 채팅은 Queue 방식으로 개별 전송
            String queueDestination = WebSocketDestinations.Queue.chatMessage(messageData.getChatRoomNo());
            messagingTemplate.convertAndSend(queueDestination, savedMessage);
              
            log.info("📤 1:1 채팅 웹소켓 메시지 전송 완료: 채팅방 {}, 메시지 ID {}", 
                    messageData.getChatRoomNo(), savedMessage.getNo());
                    
        } catch (Exception e) {
            log.error("❌ 1:1 채팅 웹소켓 메시지 처리 오류: ", e);
        }
    }

    /**
     * 채팅방 상태 변경 알림을 웹소켓으로 전송
     */
    public void notifyStatusChange(Long chatRoomNo, String status, String adminNickname, String rejectionReason) {
        try {
            log.info("🚀 웹소켓 상태 변경 알림 전송 시작 - 채팅방: {}, 상태: {}, 관리자: {}", 
                     chatRoomNo, status, adminNickname);
            
            String notificationType = "WAITING".equals(status) ? "NEW_CHAT_ROOM" : "STATUS_CHANGE";
            
            // 상태 변경 알림 메시지 생성
            StatusChangeNotification notification = StatusChangeNotification.builder()
                    .type(notificationType)
                    .chatRoomNo(chatRoomNo)
                    .status(status)
                    .adminNickname(adminNickname)
                    .rejectionReason(rejectionReason)
                    .timestamp(System.currentTimeMillis())
                    .build();
              log.info("📤 생성된 알림 객체: {}", notification);
              // 개별 채팅방 상태 변경은 Queue로 전송 (1:1)
            String destination = WebSocketDestinations.Queue.chatStatus(chatRoomNo);
            messagingTemplate.convertAndSend(destination, notification);
            log.info("✅ 개별 채팅방 알림 전송 완료: {}", destination);
            
            // 관리자 페이지로도 알림 전송 (전체 관리자)
            String adminDestination = WebSocketDestinations.Topic.ADMIN_STATUS;
            messagingTemplate.convertAndSend(adminDestination, notification);
            log.info("✅ 관리자 페이지 알림 전송 완료: {} -> 알림 내용: {}", adminDestination, notification);
            
        } catch (Exception e) {
            log.error("❌ 상태 변경 알림 전송 오류: ", e);
        }
    }

    /**
     * 상태 변경 알림을 위한 내부 클래스
     */
    @lombok.Builder
    @lombok.Getter
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class StatusChangeNotification {
        private String type;
        private Long chatRoomNo;
        private String status;
        private String adminNickname;
        private String rejectionReason;
        private Long timestamp;
    }
}
