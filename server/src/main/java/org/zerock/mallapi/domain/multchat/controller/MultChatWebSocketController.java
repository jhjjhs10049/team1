package org.zerock.mallapi.domain.multchat.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.context.event.EventListener;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.multchat.dto.MultChatMessageDTO;
import org.zerock.mallapi.domain.multchat.service.*;

import java.util.*;

/**
 * 단체채팅을 위한 WebSocket 컨트롤러 (리팩토링된 간소화 버전)
 * 
 * 기존 554줄의 거대한 컨트롤러를 다음과 같이 분리:
 * - MultChatRoomManager: 채팅방 및 사용자 관리
 * - MultChatUserService: 사용자 인증 및 닉네임 처리
 * - MultChatMessageHandler: 메시지 처리 로직
 * - MultChatNotificationService: 알림 전송 서비스
 * 
 * Topic 방식을 사용하여 브로드캐스트 구현
 * 채팅방별 구독 경로: /topic/multchat/room/{roomNo}
 * 알림 경로: /topic/multchat/room/{roomNo}/notification
 */
@RestController
@RequiredArgsConstructor
@Log4j2
public class MultChatWebSocketController {

    private final MultChatRoomManager roomManager;
    private final MultChatUserService userService;
    private final MultChatMessageHandler messageHandler;
    private final MultChatNotificationService notificationService;

    /**
     * 단체채팅 메시지 전송 처리
     * 클라이언트가 /app/multchat/send/{roomNo}로 메시지를 보낼 때 처리
     */
    @MessageMapping("/multchat/send/{roomNo}")
    public void sendMessage(@DestinationVariable Long roomNo,
                          @Payload MultChatMessageDTO message,
                          SimpMessageHeaderAccessor headerAccessor) {
        log.info("단체채팅 메시지 전송 - 방번호: {}, 메시지: {}", roomNo, message.getContent());

        try {
            // 사용자 정보 추출
            MemberDTO memberDTO = userService.extractUserInfo(headerAccessor);
            if (!userService.isUserAuthenticated(memberDTO)) {
                log.error("인증되지 않은 사용자의 메시지 전송 시도 - roomNo: {}", roomNo);
                return;
            }

            // 메시지 유효성 검증
            if (!messageHandler.isValidMessage(message)) {
                log.error("유효하지 않은 메시지 - roomNo: {}", roomNo);
                return;
            }

            // 최종 닉네임 결정
            String finalNickname = userService.determineFinalNickname(memberDTO, message.getSenderNickname());
            log.info("발신자: {} ({})", finalNickname, memberDTO.getEmail());

            // 메시지 처리 및 브로드캐스트
            messageHandler.handleChatMessage(roomNo, message, memberDTO, finalNickname);

        } catch (Exception e) {
            log.error("단체채팅 메시지 전송 중 오류 발생", e);
        }
    }

    /**
     * 채팅방 입장 처리
     * 클라이언트가 /app/multchat/join/{roomNo}로 입장 요청을 보낼 때 처리
     */
    @MessageMapping("/multchat/join/{roomNo}")
    public void joinRoom(@DestinationVariable Long roomNo,
                        @Payload MultChatMessageDTO message,
                        SimpMessageHeaderAccessor headerAccessor) {
        log.info("단체채팅방 입장 - 방번호: {}, 사용자: {}", roomNo, message.getSenderNickname());

        try {
            // 사용자 정보 추출
            MemberDTO memberDTO = userService.extractUserInfo(headerAccessor);
            if (!userService.isUserAuthenticated(memberDTO)) {
                log.error("인증되지 않은 사용자의 채팅방 입장 시도");
                return;
            }

            // 최종 닉네임 결정
            String finalNickname = userService.determineFinalNickname(memberDTO, message.getSenderNickname());
            
            // 세션에 사용자 정보 저장
            userService.saveUserToSession(headerAccessor, finalNickname, roomNo, memberDTO.getMemberNo());            // 채팅방에 사용자 추가
            boolean wasNewUser = roomManager.addUserToRoom(roomNo, finalNickname, memberDTO.getMemberNo(), memberDTO.getEmail());
            
            log.info("사용자 {}님이 채팅방 {}에 입장 - 새 사용자: {}, 현재 온라인: {}명", 
                     finalNickname, roomNo, wasNewUser, roomManager.getOnlineUserCount(roomNo));

            // ✅ 개선: 재입장하는 사용자에게도 입장 메시지 표시 (세션 지속성으로 인한 재입장 고려)
            // 입장 시스템 메시지 생성 및 브로드캐스트
            MultChatMessageDTO joinMessage = messageHandler.handleSystemMessage(
                roomNo, finalNickname + "님이 채팅방에 입장했습니다.", "JOIN", finalNickname
            );
            notificationService.broadcastMessage(roomNo, joinMessage);
            
            // 사용자 목록 업데이트 알림 전송
            List<String> onlineUsers = List.copyOf(roomManager.getOnlineUsers(roomNo));
            List<Map<String, Object>> participantList = roomManager.getParticipantList(roomNo);
            notificationService.sendUserListUpdate(roomNo, onlineUsers, participantList);

            log.info("단체채팅방 입장 완료 - 방번호: {}, 현재 온라인: {}명", 
                     roomNo, roomManager.getOnlineUserCount(roomNo));

        } catch (Exception e) {
            log.error("단체채팅방 입장 처리 중 오류 발생", e);
        }
    }

    /**
     * 채팅방 나가기 처리
     * 클라이언트가 /app/multchat/leave/{roomNo}로 나가기 요청을 보낼 때 처리
     */
    @MessageMapping("/multchat/leave/{roomNo}")
    public void leaveRoom(@DestinationVariable Long roomNo,
                         @Payload MultChatMessageDTO message,
                         SimpMessageHeaderAccessor headerAccessor) {
        log.info("단체채팅방 나가기 - 방번호: {}, 사용자: {}", roomNo, message.getSenderNickname());

        try {
            // 사용자 정보 추출
            MemberDTO memberDTO = userService.extractUserInfo(headerAccessor);
            if (!userService.isUserAuthenticated(memberDTO)) {
                log.error("인증되지 않은 사용자의 채팅방 나가기 시도");
                return;
            }

            // 최종 닉네임 결정
            String finalNickname = userService.determineFinalNickname(memberDTO, message.getSenderNickname());

            // 채팅방에서 사용자 제거
            boolean removed = roomManager.removeUserFromRoom(roomNo, finalNickname);

            if (removed) {
                log.info("사용자 {}님이 채팅방 {}에서 나감 - 현재 온라인: {}명", 
                         finalNickname, roomNo, roomManager.getOnlineUserCount(roomNo));

                // 채팅방에 다른 사용자가 있으면 알림 전송
                if (roomManager.getOnlineUserCount(roomNo) > 0) {
                    // 사용자 목록 업데이트 알림
                    List<String> onlineUsers = List.copyOf(roomManager.getOnlineUsers(roomNo));
                    List<Map<String, Object>> participantList = roomManager.getParticipantList(roomNo);
                    notificationService.sendUserListUpdate(roomNo, onlineUsers, participantList);
                }

                // 나가기 시스템 메시지 전송
                MultChatMessageDTO leaveMessage = messageHandler.handleSystemMessage(
                    roomNo, finalNickname + "님이 나가셨습니다.", "LEAVE", finalNickname
                );

                // 나가기 알림 브로드캐스트
                notificationService.broadcastMessage(roomNo, leaveMessage);
            }

            log.info("단체채팅방 나가기 완료 - 방번호: {}", roomNo);

        } catch (Exception e) {
            log.error("단체채팅방 나가기 처리 중 오류 발생", e);
        }
    }    /**
     * WebSocket 연결 끊김 이벤트 처리 (세션 지속성 개선)
     * ✅ 사용자가 명시적으로 "나가기"를 누르지 않는 한 채팅방에 계속 소속
     * - 페이지 새로고침, 네트워크 끊김 등으로 인한 일시적 연결 해제 시에도 세션 유지
     * - 실제 퇴장은 /app/multchat/leave/{roomNo} 경로를 통해서만 처리
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        log.info("WebSocket 연결 끊어짐 이벤트 발생 - 세션 지속성 유지");

        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        Long roomNo = (Long) headerAccessor.getSessionAttributes().get("roomNo");

        if (username != null && roomNo != null) {
            log.info("사용자 연결 일시 끊어짐 - 사용자: {}, 방번호: {} (채팅방 소속 유지)", username, roomNo);
            
            // ✅ 개선: 연결 끊김으로 인한 자동 제거 비활성화
            // 사용자는 여전히 채팅방에 소속되어 있고, 재연결 시 자동으로 복구됨
            
            // 참가자 상태 확인만 수행하고 제거하지 않음
            boolean userExists = roomManager.isUserInRoom(roomNo, username);
            if (userExists) {
                log.info("사용자 {}는 여전히 채팅방 {}에 소속됨 - 재연결 대기 중", username, roomNo);
            }
            
            log.info("연결 끊김 처리 완료 - 사용자 세션 유지: {}", username);
        }
    }

    /**
     * 특정 채팅방의 온라인 사용자 수 조회
     */
    public int getOnlineUserCount(Long roomNo) {
        return roomManager.getOnlineUserCount(roomNo);
    }

    /**
     * 특정 채팅방의 온라인 사용자 목록 조회
     */
    public Set<String> getOnlineUsers(Long roomNo) {
        return roomManager.getOnlineUsers(roomNo);
    }
}
