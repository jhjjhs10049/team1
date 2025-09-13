package org.zerock.mallapi.domain.multchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoomParticipant;

import java.util.List;
import java.util.Optional;

public interface MultChatRoomParticipantRepository extends JpaRepository<MultChatRoomParticipant, Long> {

    // 특정 채팅방의 활성 참가자 목록 조회
    @Query("SELECT p FROM MultChatRoomParticipant p " +
           "WHERE p.chatRoom.no = :chatRoomNo AND p.isActive = true " +
           "ORDER BY p.joinedAt ASC")
    List<MultChatRoomParticipant> findActiveByChatRoomNo(@Param("chatRoomNo") Long chatRoomNo);

    // 특정 멤버의 특정 채팅방 참가 정보 조회
    @Query("SELECT p FROM MultChatRoomParticipant p " +
           "WHERE p.chatRoom.no = :chatRoomNo AND p.member.memberNo = :memberNo")
    Optional<MultChatRoomParticipant> findByChatRoomNoAndMemberNo(@Param("chatRoomNo") Long chatRoomNo, 
                                                                  @Param("memberNo") Long memberNo);

    // 특정 멤버의 특정 채팅방 활성 참가 정보 조회
    @Query("SELECT p FROM MultChatRoomParticipant p " +
           "WHERE p.chatRoom.no = :chatRoomNo AND p.member.memberNo = :memberNo AND p.isActive = true")
    Optional<MultChatRoomParticipant> findActiveByChatRoomNoAndMemberNo(@Param("chatRoomNo") Long chatRoomNo, 
                                                                         @Param("memberNo") Long memberNo);

    // 특정 멤버가 참가 중인 채팅방의 참가자 정보 목록 조회
    @Query("SELECT p FROM MultChatRoomParticipant p " +
           "WHERE p.member.memberNo = :memberNo AND p.isActive = true " +
           "ORDER BY p.chatRoom.modifiedAt DESC")
    List<MultChatRoomParticipant> findActiveByMemberNo(@Param("memberNo") Long memberNo);

    // 특정 채팅방의 참가자 수 조회
    @Query("SELECT COUNT(p) FROM MultChatRoomParticipant p " +
           "WHERE p.chatRoom.no = :chatRoomNo AND p.isActive = true")
    Long countActiveByChatRoomNo(@Param("chatRoomNo") Long chatRoomNo);

    // 특정 멤버가 특정 채팅방에 참가 중인지 확인
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
           "FROM MultChatRoomParticipant p " +
           "WHERE p.chatRoom.no = :chatRoomNo AND p.member.memberNo = :memberNo AND p.isActive = true")
    boolean isParticipating(@Param("chatRoomNo") Long chatRoomNo, @Param("memberNo") Long memberNo);
}
