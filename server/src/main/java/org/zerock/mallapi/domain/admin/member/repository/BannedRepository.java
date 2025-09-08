package org.zerock.mallapi.domain.admin.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.admin.member.entity.Banned;

import java.util.List;
import java.util.Optional;

public interface BannedRepository extends JpaRepository<Banned, Long> {
    
    // 특정 회원의 현재 활성 정지 내역 조회 (해제되지 않은 정지)
    @Query("SELECT b FROM Banned b WHERE b.memberNo = :memberNo AND b.unbannedAt IS NULL ORDER BY b.bannedAt DESC")
    Optional<Banned> findActiveBanByMemberNo(@Param("memberNo") Long memberNo);
    
    // 특정 회원의 모든 정지 내역 조회 (최신순)
    @Query("SELECT b FROM Banned b WHERE b.memberNo = :memberNo ORDER BY b.bannedAt DESC")
    List<Banned> findAllBansByMemberNo(@Param("memberNo") Long memberNo);
    
    // 현재 정지된 회원들의 최신 정지 내역 조회
    @Query("SELECT b FROM Banned b WHERE b.unbannedAt IS NULL AND " +
           "(b.bannedUntil IS NULL OR b.bannedUntil > CURRENT_TIMESTAMP) " +
           "ORDER BY b.bannedAt DESC")
    List<Banned> findCurrentlyBannedMembers();
      // 특정 관리자가 조치한 정지 내역 조회 (roleCode로 검색)
    @Query("SELECT b FROM Banned b WHERE b.bannedBy = :adminRoleCode ORDER BY b.bannedAt DESC")
    List<Banned> findBansByAdminRoleCode(@Param("adminRoleCode") String adminRoleCode);
    
    // 기간별 정지 내역 통계
    @Query("SELECT COUNT(b) FROM Banned b WHERE b.bannedAt BETWEEN :startDate AND :endDate")
    long countBansBetweenDates(@Param("startDate") java.time.LocalDateTime startDate, 
                              @Param("endDate") java.time.LocalDateTime endDate);
}
