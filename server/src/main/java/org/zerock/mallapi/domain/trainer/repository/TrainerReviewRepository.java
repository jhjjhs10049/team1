package org.zerock.mallapi.domain.trainer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.trainer.entity.TrainerReview;

import java.util.List;

public interface TrainerReviewRepository extends JpaRepository<TrainerReview, Long> {
    // 특정 트레이너의 리뷰 목록 조회
    List<TrainerReview> findByTrainer_TrainerNo(Long trainerNo);

    // 특정 트레이너의 평균 평점 계산
    @Query("SELECT AVG(tr.score) FROM TrainerReview tr WHERE tr.trainer.trainerNo = :trainerNo")
    Double getAverageScoreByTrainerNo(@Param("trainerNo") Long trainerNo);

    // 트레이너 수 카운트
    long countByTrainer_TrainerNo(Long trainerNo);
}