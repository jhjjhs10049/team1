package org.zerock.mallapi.domain.support.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom.ChatStatus;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {    // 회원의 활성화된 채팅방 조회 (대기중 또는 진행중)
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.member.memberNo = :memberNo " +
           "AND cr.status IN (:statuses) " +
           "ORDER BY cr.createdAt DESC")
    Optional<ChatRoom> findActiveChatRoomByMemberNo(@Param("memberNo") Long memberNo, @Param("statuses") List<ChatStatus> statuses);

    // 회원의 모든 채팅방 목록 조회
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.member.memberNo = :memberNo " +
           "ORDER BY cr.createdAt DESC")
    List<ChatRoom> findChatRoomsByMemberNo(@Param("memberNo") Long memberNo);

    // 관리자가 담당하는 채팅방 목록 조회
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.admin.memberNo = :adminNo " +
           "ORDER BY cr.createdAt DESC")
    List<ChatRoom> findChatRoomsByAdminNo(@Param("adminNo") Long adminNo);

    // 대기중인 채팅방 목록 조회 (관리자 배정 대기)
    List<ChatRoom> findByStatusOrderByCreatedAtAsc(ChatStatus status);

    // 진행중인 채팅방 목록 조회
    List<ChatRoom> findByStatusOrderByCreatedAtDesc(ChatStatus status);
}
