package org.zerock.mallapi.domain.support.chat.service;

import org.zerock.mallapi.domain.support.chat.dto.ChatMessageDTO;
import org.zerock.mallapi.domain.support.chat.entity.ChatMessage;

import java.util.List;

public interface ChatMessageService {

    // 메시지 전송
    ChatMessageDTO sendMessage(Long chatRoomNo, Long senderNo, String message, ChatMessage.MessageType messageType);

    // 채팅방의 모든 메시지 조회
    List<ChatMessageDTO> getMessagesByChatRoomNo(Long chatRoomNo);

    // 채팅방의 읽지 않은 메시지 수 조회
    Long getUnreadMessageCount(Long chatRoomNo, Long memberNo);

    // 메시지 읽음 처리
    void markMessagesAsRead(Long chatRoomNo, Long memberNo);

    // 메시지 삭제 (소프트 삭제)
    void deleteMessage(Long messageNo);

    // 시스템 메시지 전송 (관리자 입장, 퇴장 등)
    ChatMessageDTO sendSystemMessage(Long chatRoomNo, String message);
}
