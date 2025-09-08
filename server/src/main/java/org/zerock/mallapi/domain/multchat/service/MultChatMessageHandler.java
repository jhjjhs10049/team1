package org.zerock.mallapi.domain.multchat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.multchat.dto.MultChatMessageDTO;

/**
 * 단체채팅 메시지 처리 서비스
 * - 메시지 내용 처리 및 검증
 * - 이모지 처리
 * - 메시지 저장 및 브로드캐스트 로직
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class MultChatMessageHandler {

    private final MultChatMessageService multChatMessageService;
    private final MultChatRoomManager roomManager;
    private final MultChatNotificationService notificationService;

    /**
     * 일반 채팅 메시지 처리
     */
    public MultChatMessageDTO handleChatMessage(Long roomNo, MultChatMessageDTO message, 
                                                MemberDTO memberDTO, String finalNickname) {
        log.info("📝 메시지 처리 시작 - 방번호: {}, 발신자: {}, 내용: {}", 
                 roomNo, finalNickname, message.getContent());

        // 메시지 전송 시에도 사용자를 roomUsers에 추가 (입장하지 않은 사용자 처리)
        roomManager.addUserToRoom(roomNo, finalNickname, memberDTO.getMemberNo(), memberDTO.getEmail());

        // 이모지 포함 메시지 상세 로깅
        analyzeMessageContent(message.getContent());        // 메시지 데이터 설정
        message.setSenderNickname(finalNickname);
        message.setChatRoomNo(roomNo);

        // 메시지를 데이터베이스에 저장
        MultChatMessageDTO savedMessage = multChatMessageService.sendMessage(message);
        log.info("단체채팅 메시지 저장 완료 - 메시지ID: {}", savedMessage.getNo());        // 메시지만 브로드캐스트 (사용자 목록은 입장/퇴장 시에만 업데이트)
        notificationService.broadcastMessage(roomNo, savedMessage);

        return savedMessage;
    }

    /**
     * 시스템 메시지 처리 (입장/퇴장)
     */
    public MultChatMessageDTO handleSystemMessage(Long roomNo, String content, String type, String nickname) {
        log.info("시스템 메시지 처리 - 방번호: {}, 타입: {}, 내용: {}", roomNo, type, content);

        MultChatMessageDTO systemMessage = multChatMessageService.sendSystemMessage(
            roomNo, content, type, null
        );

        return systemMessage;
    }    /**
     * 메시지 내용 분석 (이모지, 특수 문자 등)
     */
    private void analyzeMessageContent(String content) {
        boolean containsEmoji = content.matches(".*[\\p{So}\\p{Cn}].*");
        
        log.info("📝 메시지 내용: {}", content);
        log.info("🎭 이모지 포함: {}", containsEmoji);
        
        if (containsEmoji) {
            log.info("🔍 이모지 상세 정보:");
            for (int i = 0; i < content.length(); i++) {
                int codePoint = content.codePointAt(i);
                if (Character.isSupplementaryCodePoint(codePoint) || codePoint > 127) {
                    String emoji = new String(Character.toChars(codePoint));
                    log.info("   이모지: {} (U+{})", emoji, Integer.toHexString(codePoint).toUpperCase());
                    
                    if (Character.isSupplementaryCodePoint(codePoint)) {
                        i++; // Supplementary 문자는 2개의 char를 사용하므로 인덱스 추가 증가
                    }
                }
            }
        }
    }

    /**
     * 메시지 유효성 검증
     */
    public boolean isValidMessage(MultChatMessageDTO message) {
        if (message == null) {
            log.error("메시지가 null입니다");
            return false;
        }
        
        if (message.getContent() == null || message.getContent().trim().isEmpty()) {
            log.error("메시지 내용이 비어있습니다");
            return false;
        }
        
        if (message.getContent().length() > 1000) { // 메시지 길이 제한
            log.error("메시지가 너무 깁니다: {} 문자", message.getContent().length());
            return false;
        }
        
        return true;
    }
}
