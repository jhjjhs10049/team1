package org.zerock.mallapi.domain.multchat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.multchat.entity.MultChatMessage;

import java.time.LocalDateTime;
import java.util.List;

public interface MultChatMessageRepository extends JpaRepository<MultChatMessage, Long> {

    // 특정 채팅방의 메시지 목록 조회 (페이징)
    @Query("SELECT m FROM MultChatMessage m " +
           "WHERE m.chatRoom.no = :chatRoomNo AND m.isDeleted = false " +
           "ORDER BY m.createdAt DESC")
    Page<MultChatMessage> findByChatRoomNo(@Param("chatRoomNo") Long chatRoomNo, Pageable pageable);

    // 특정 채팅방의 최근 메시지 목록 조회 (최신 순)
    @Query("SELECT m FROM MultChatMessage m " +
           "WHERE m.chatRoom.no = :chatRoomNo AND m.isDeleted = false " +
           "ORDER BY m.createdAt DESC")
    List<MultChatMessage> findRecentByChatRoomNo(@Param("chatRoomNo") Long chatRoomNo, Pageable pageable);

    // 특정 채팅방의 최신 메시지 1개 조회
    @Query("SELECT m FROM MultChatMessage m " +
           "WHERE m.chatRoom.no = :chatRoomNo AND m.isDeleted = false " +
           "ORDER BY m.createdAt DESC")
    List<MultChatMessage> findTopByChatRoomNo(@Param("chatRoomNo") Long chatRoomNo, Pageable pageable);

    // 특정 시간 이후의 읽지 않은 메시지 수 조회
    @Query("SELECT COUNT(m) FROM MultChatMessage m " +
           "WHERE m.chatRoom.no = :chatRoomNo AND m.isDeleted = false " +
           "AND m.createdAt > :lastReadAt AND m.sender.memberNo != :memberNo")
    Long countUnreadMessages(@Param("chatRoomNo") Long chatRoomNo, 
                            @Param("lastReadAt") LocalDateTime lastReadAt, 
                            @Param("memberNo") Long memberNo);

    // 특정 채팅방의 전체 메시지 수 조회
    @Query("SELECT COUNT(m) FROM MultChatMessage m " +
           "WHERE m.chatRoom.no = :chatRoomNo AND m.isDeleted = false")
    Long countByChatRoomNo(@Param("chatRoomNo") Long chatRoomNo);

    // 특정 사용자가 보낸 메시지 목록 조회
    @Query("SELECT m FROM MultChatMessage m " +
           "WHERE m.chatRoom.no = :chatRoomNo AND m.sender.memberNo = :senderNo AND m.isDeleted = false " +
           "ORDER BY m.createdAt DESC")
    List<MultChatMessage> findByChatRoomNoAndSenderNo(@Param("chatRoomNo") Long chatRoomNo, 
                                                      @Param("senderNo") Long senderNo);
}
