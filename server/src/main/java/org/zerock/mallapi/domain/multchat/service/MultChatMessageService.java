package org.zerock.mallapi.domain.multchat.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.zerock.mallapi.domain.multchat.dto.MultChatMessageDTO;

import java.util.List;

public interface MultChatMessageService {

    // 메시지 전송
    MultChatMessageDTO sendMessage(MultChatMessageDTO messageDTO);

    // 채팅방의 메시지 목록 조회 (페이징)
    Page<MultChatMessageDTO> getMessagesByChatRoom(Long roomNo, Long memberNo, Pageable pageable);

    // 채팅방의 최근 메시지 목록 조회
    List<MultChatMessageDTO> getRecentMessages(Long roomNo, Long memberNo, int limit);

    // 시스템 메시지 전송 (입장/퇴장 알림)
    MultChatMessageDTO sendSystemMessage(Long roomNo, String content, String messageType, String systemData);

    // 메시지 삭제 (본인 메시지만 가능)
    void deleteMessage(Long messageNo, Long memberNo);

    // 읽지 않은 메시지 수 조회
    Long getUnreadMessageCount(Long roomNo, Long memberNo);

    // 메시지 읽음 처리 (마지막 읽은 시간 업데이트)
    void markMessagesAsRead(Long roomNo, Long memberNo);

    // 특정 사용자가 보낸 메시지 목록 조회
    List<MultChatMessageDTO> getMessagesByUser(Long roomNo, Long senderNo);
}
