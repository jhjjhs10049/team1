package org.zerock.mallapi.domain.support.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.support.chat.entity.ChatMessage;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방의 모든 메시지 조회 (삭제되지 않은 것들)
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.no = :chatRoomNo " +
           "AND cm.deleteStatus = 'N' " +
           "ORDER BY cm.sentAt ASC")
    List<ChatMessage> findMessagesByChatRoomNo(@Param("chatRoomNo") Long chatRoomNo);

    // 채팅방의 읽지 않은 메시지 수 조회
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoom.no = :chatRoomNo " +
           "AND cm.readStatus = 'N' " +
           "AND cm.deleteStatus = 'N' " +
           "AND cm.sender.memberNo != :memberNo")
    Long countUnreadMessagesByChatRoomNoAndMemberNo(@Param("chatRoomNo") Long chatRoomNo, @Param("memberNo") Long memberNo);

    // 특정 사용자가 보낸 채팅방의 읽지 않은 메시지들을 읽음 처리하기 위한 조회
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.no = :chatRoomNo " +
           "AND cm.readStatus = 'N' " +
           "AND cm.deleteStatus = 'N' " +
           "AND cm.sender.memberNo != :memberNo")
    List<ChatMessage> findUnreadMessagesByChatRoomNoAndMemberNo(@Param("chatRoomNo") Long chatRoomNo, @Param("memberNo") Long memberNo);
}
