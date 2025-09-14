package org.zerock.mallapi.domain.trainer.service;

import org.zerock.mallapi.domain.trainer.dto.TrainerReviewDTO;

import java.util.List;

public interface TrainerReviewService {
    List<TrainerReviewDTO> getReviewsByTrainer(Long trainerNo);

    TrainerReviewDTO addReview(TrainerReviewDTO dto);

    void deleteReview(Long reviewNo, Long memberNo);
    
    void createTestReviewData();
}