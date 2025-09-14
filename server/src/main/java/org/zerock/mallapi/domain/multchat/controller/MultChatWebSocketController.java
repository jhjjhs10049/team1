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
    private final MultChatRoomService chatRoomService;

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
     * 채팅방 나가기 처리 (실제 나가기 버튼을 누른 경우만)
     * - 메시지 타입이 "REAL_LEAVE"인 경우에만 실제 나가기 처리
     * - 다른 경우는 무시하여 페이지 이동/새로고침으로 인한 자동 나가기 방지
     */
    @MessageMapping("/multchat/leave/{roomNo}")
    public void leaveRoom(@DestinationVariable Long roomNo,
                         @Payload MultChatMessageDTO message,
                         SimpMessageHeaderAccessor headerAccessor) {
        
        log.info("🔍 [DEBUG] leaveRoom 메서드 시작 - 방번호: {}, 메시지타입: {}", roomNo, message.getMessageType());
        
        // 실제 나가기 버튼을 누른 경우에만 처리
        if ("REAL_LEAVE".equals(message.getMessageType())) {
            log.info("✅ 실제 나가기 버튼 클릭 - 방번호: {}, 사용자: {}", roomNo, message.getSenderNickname());
            
            try {
                // 사용자 정보 추출
                MemberDTO memberDTO = userService.extractUserInfo(headerAccessor);
                log.info("🔍 [DEBUG] 추출된 사용자 정보: {}", memberDTO);
                
                if (!userService.isUserAuthenticated(memberDTO)) {
                    log.error("인증되지 않은 사용자의 나가기 시도");
                    return;
                }

                // 최종 닉네임 결정
                String finalNickname = userService.determineFinalNickname(memberDTO, message.getSenderNickname());
                log.info("🔍 [DEBUG] 최종 닉네임: {}", finalNickname);
                
                // 웹소켓 메모리에서 사용자 제거
                boolean removed = roomManager.removeUserFromRoom(roomNo, finalNickname);
                log.info("🔍 [DEBUG] removeUserFromRoom 결과: {}", removed);
                
                if (removed) {
                    log.info("사용자 {}님이 채팅방 {}에서 나감 - 현재 온라인: {}명", 
                             finalNickname, roomNo, roomManager.getOnlineUserCount(roomNo));

                    // 나가기 시스템 메시지 생성 및 브로드캐스트
                    MultChatMessageDTO leaveMessage = messageHandler.handleSystemMessage(
                        roomNo, finalNickname + "님이 나가셨습니다.", "LEAVE", finalNickname
                    );
                    notificationService.broadcastMessage(roomNo, leaveMessage);
                    log.info("🔍 [DEBUG] 나가기 시스템 메시지 브로드캐스트 완료");
                    
                    // 🔄 개별 사용자 나가기 알림 추가 전송
                    log.info("🔍 [DEBUG] sendUserLeftNotification 호출 시작");
                    notificationService.sendUserLeftNotification(roomNo, finalNickname, memberDTO.getMemberNo());
                    log.info("🔍 [DEBUG] sendUserLeftNotification 호출 완료");
                    
                    // 사용자 목록 업데이트 알림 전송
                    if (roomManager.getOnlineUserCount(roomNo) > 0) {
                        List<String> onlineUsers = List.copyOf(roomManager.getOnlineUsers(roomNo));
                        List<Map<String, Object>> participantList = roomManager.getParticipantList(roomNo);
                        notificationService.sendUserListUpdate(roomNo, onlineUsers, participantList);
                        log.info("🔍 [DEBUG] 사용자 목록 업데이트 알림 전송 완료");
                    }
                    
                    // 🆕 글로벌 채팅방 리스트 업데이트 알림 전송 (나가기로 인한 참가자 수 변경)
                    log.info("🔍 [DEBUG] 글로벌 채팅방 리스트 업데이트 알림 전송 시작");
                    notificationService.sendParticipantCountUpdate(roomNo, roomManager.getOnlineUserCount(roomNo));
                    log.info("🔍 [DEBUG] 글로벌 채팅방 리스트 업데이트 알림 전송 완료");
                    
                    // 🏠 방장 나가기 처리: 방장이 나가면 방을 비활성화
                    try {
                        boolean isRoomOwner = chatRoomService.isRoomOwner(roomNo, memberDTO.getMemberNo());
                        if (isRoomOwner) {
                            log.info("👑 방장 {}님이 채팅방 {}에서 나감 - 방 비활성화 처리 시작", finalNickname, roomNo);
                            
                            // 방 비활성화
                            chatRoomService.deactivateRoom(roomNo);
                            
                            // 방 삭제 시스템 메시지 브로드캐스트
                            MultChatMessageDTO roomDeleteMessage = messageHandler.handleSystemMessage(
                                roomNo, "방장이 나가서 채팅방이 삭제되었습니다.", "ROOM_DELETED", finalNickname
                            );
                            notificationService.broadcastMessage(roomNo, roomDeleteMessage);
                            
                            // 방 삭제 알림을 글로벌로 전송 (채팅방 리스트에서 제거하기 위해)
                            Map<String, Object> roomDeleteData = Map.of(
                                "roomNo", roomNo,
                                "roomName", "삭제된 방",
                                "reason", "방장 나가기",
                                "deletedAt", System.currentTimeMillis()
                            );
                            notificationService.sendRoomListUpdate("ROOM_DELETED", roomNo, roomDeleteData);
                            log.info("📤 방 삭제 글로벌 알림 전송 완료 - 방번호: {}", roomNo);
                            
                            log.info("👑 방장 나가기로 인한 채팅방 {} 비활성화 완료", roomNo);
                        }
                    } catch (Exception roomDeleteError) {
                        log.error("방장 나가기 처리 중 오류 발생", roomDeleteError);
                    }
                } else {
                    log.warn("🔍 [DEBUG] 사용자 제거 실패 - 사용자가 이미 제거되었거나 존재하지 않음");
                }

            } catch (Exception e) {
                log.error("🔍 [DEBUG] 채팅방 나가기 처리 중 오류 발생", e);
            }
        } else {
            log.info("🚫 페이지 이동/새로고침으로 인한 임시 나가기 요청 무시 - 방번호: {}, 사용자: {} (채팅방 소속 유지)", 
                     roomNo, message.getSenderNickname());
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

    /*
     * 특정 채팅방의 온라인 사용자 목록 조회
     */
    public Set<String> getOnlineUsers(Long roomNo) {
        return roomManager.getOnlineUsers(roomNo);
    }
}
