package org.zerock.mallapi.domain.admin.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom;

public interface ChatRoomAdminRepository extends JpaRepository<ChatRoom, Long> {    // 모든 채팅방 페이징 조회 (생성일 역순) - Member 정보 FETCH JOIN
    @Query("SELECT c FROM ChatRoom c LEFT JOIN FETCH c.member LEFT JOIN FETCH c.admin ORDER BY c.createdAt DESC")
    Page<ChatRoom> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 상태별 채팅방 조회 - Member 정보 FETCH JOIN
    @Query("SELECT c FROM ChatRoom c LEFT JOIN FETCH c.member LEFT JOIN FETCH c.admin WHERE c.status = :status ORDER BY c.createdAt DESC")
    Page<ChatRoom> findByStatusOrderByCreatedAtDesc(@Param("status") ChatRoom.ChatStatus status, Pageable pageable);

    // 특정 회원의 채팅방 조회 (이메일로 검색) - Member 정보 FETCH JOIN
    @Query("SELECT c FROM ChatRoom c LEFT JOIN FETCH c.member LEFT JOIN FETCH c.admin WHERE c.member.email LIKE %:email% ORDER BY c.createdAt DESC")
    Page<ChatRoom> findByMemberEmailContainingOrderByCreatedAtDesc(@Param("email") String email, Pageable pageable);

    // 관리자 이메일로 검색 - Admin 정보 FETCH JOIN
    @Query("SELECT c FROM ChatRoom c LEFT JOIN FETCH c.member LEFT JOIN FETCH c.admin WHERE c.admin.email LIKE %:adminEmail% ORDER BY c.createdAt DESC")
    Page<ChatRoom> findByAdminEmailContainingOrderByCreatedAtDesc(@Param("adminEmail") String adminEmail, Pageable pageable);

    // 회원 닉네임으로 검색 - Member 정보 FETCH JOIN
    @Query("SELECT c FROM ChatRoom c LEFT JOIN FETCH c.member LEFT JOIN FETCH c.admin WHERE c.member.nickname LIKE %:nickname% ORDER BY c.createdAt DESC")
    Page<ChatRoom> findByMemberNicknameContainingOrderByCreatedAtDesc(@Param("nickname") String nickname, Pageable pageable);

    // 전체 검색 (이메일, 닉네임, 관리자 이메일에서 모두 검색)
    @Query("SELECT c FROM ChatRoom c LEFT JOIN FETCH c.member LEFT JOIN FETCH c.admin WHERE " +
           "(c.member.email LIKE %:keyword% OR c.member.nickname LIKE %:keyword% OR c.admin.email LIKE %:keyword%) " +
           "ORDER BY c.createdAt DESC")
    Page<ChatRoom> findByKeywordInAllFields(@Param("keyword") String keyword, Pageable pageable);
}
