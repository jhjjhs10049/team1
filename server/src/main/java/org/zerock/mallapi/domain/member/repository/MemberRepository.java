package org.zerock.mallapi.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.entity.MemberStatus;
import org.zerock.mallapi.domain.member.repository.MemberRepository;


import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    
    @Query("select m from Member m where m.email = :email and m.active = :status")
    Optional<Member> getWithRoles(@Param("email") String email, @Param("status") MemberStatus status);
    
    // 이메일로 회원 찾기 (활성 상태만)
    @Query("select m from Member m where m.email = :email and m.active = 'ACTIVE'")
    Optional<Member> findByEmailAndActiveStatus(@Param("email") String email);
    
    // 닉네임으로 회원 찾기
    Optional<Member> findByNickname(String nickname);
    
    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);
    
    // 닉네임 존재 여부 확인
    boolean existsByNickname(String nickname);    

    // 기존 호환성을 위한 메서드
    default Member getWithRoles(String email) {
        return getWithRoles(email, MemberStatus.ACTIVE).orElse(null);
    }

    Optional<Member> findByEmail(String email);
    
    // MANAGER 역할의 최신 코드 조회 (1001부터 시작)
    @Query(value = "SELECT role_code FROM member WHERE role = 'MANAGER' AND role_code LIKE '1%' ORDER BY role_code DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLatestManagerCode();
    
    // 특정 roleCode 존재 여부 확인
    boolean existsByRoleCode(String roleCode);
    
    // roleCode가 null인 MANAGER들 조회
    @Query("SELECT m FROM Member m WHERE m.role = 'MANAGER' AND m.roleCode IS NULL ORDER BY m.joinedDate ASC")
    java.util.List<Member> findManagersWithoutRoleCode();

    // Admin 관련 쿼리들
    
    // 일반 사용자들만 조회 (ADMIN, MANAGER 제외)
    @Query("SELECT m FROM Member m WHERE m.role = 'USER' ORDER BY m.joinedDate DESC")
    java.util.List<Member> findAllUsers();
    
    // 일반 사용자와 매니저 조회 (ADMIN 제외)
    @Query("SELECT m FROM Member m WHERE m.role IN ('USER', 'MANAGER') ORDER BY m.joinedDate DESC")
    java.util.List<Member> findAllUsersAndManagers();
}
