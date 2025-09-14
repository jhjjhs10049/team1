package org.zerock.mallapi.domain.tip.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.zerock.mallapi.domain.tip.entity.FitnessTip;

import java.util.List;

public interface FitnessTipRepository extends JpaRepository<FitnessTip, Long> {
    
    // 활성화된 팁들만 조회
    List<FitnessTip> findByIsActiveTrueOrderByCreatedDateDesc();
    
    // 랜덤으로 하나의 활성화된 팁 조회
    @Query(value = "SELECT * FROM fitness_tips WHERE is_active = true ORDER BY RAND() LIMIT 1", nativeQuery = true)
    FitnessTip findRandomActiveTip();
    
    // 모든 팁 조회 (관리자용)
    List<FitnessTip> findAllByOrderByCreatedDateDesc();
}