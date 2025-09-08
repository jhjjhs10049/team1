package org.zerock.mallapi.domain.multchat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoom;

import java.util.List;

public interface MultChatRoomRepository extends JpaRepository<MultChatRoom, Long> {

    // 활성 상태인 공개방 목록 조회 (페이징)
    @Query("SELECT mcr FROM MultChatRoom mcr WHERE mcr.status = 'ACTIVE' AND mcr.roomType = 'PUBLIC' ORDER BY mcr.createdAt DESC")
    Page<MultChatRoom> findActivePublicRooms(Pageable pageable);

    // 특정 사용자가 참가 중인 채팅방 목록 조회
    @Query("SELECT DISTINCT mcr FROM MultChatRoom mcr " +
           "JOIN mcr.participants p " +
           "WHERE p.member.memberNo = :memberNo AND p.isActive = true " +
           "ORDER BY mcr.modifiedAt DESC")
    List<MultChatRoom> findMyActiveRooms(@Param("memberNo") Long memberNo);

    // 방 이름으로 검색 (활성 상태인 공개방만)
    @Query("SELECT mcr FROM MultChatRoom mcr " +
           "WHERE mcr.status = 'ACTIVE' AND mcr.roomType = 'PUBLIC' " +
           "AND mcr.roomName LIKE %:roomName% " +
           "ORDER BY mcr.createdAt DESC")
    Page<MultChatRoom> findByRoomNameContaining(@Param("roomName") String roomName, Pageable pageable);

    // 방장이 생성한 채팅방 목록 조회
    @Query("SELECT mcr FROM MultChatRoom mcr WHERE mcr.creator.memberNo = :creatorNo ORDER BY mcr.createdAt DESC")
    List<MultChatRoom> findByCreatorNo(@Param("creatorNo") Long creatorNo);

    // 인기 채팅방 목록 (참가자 수 기준)
    @Query("SELECT mcr FROM MultChatRoom mcr " +
           "WHERE mcr.status = 'ACTIVE' AND mcr.roomType = 'PUBLIC' " +
           "ORDER BY mcr.currentParticipants DESC, mcr.createdAt DESC")
    Page<MultChatRoom> findPopularRooms(Pageable pageable);

    // 최근 활성화된 채팅방 목록
    @Query("SELECT mcr FROM MultChatRoom mcr " +
           "WHERE mcr.status = 'ACTIVE' AND mcr.roomType = 'PUBLIC' " +
           "ORDER BY mcr.modifiedAt DESC")
    Page<MultChatRoom> findRecentActiveRooms(Pageable pageable);
}
