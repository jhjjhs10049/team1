package org.zerock.mallapi.domain.gym.service;

import org.zerock.mallapi.domain.gym.dto.GymReviewDTO;

import java.util.List;

public interface GymReviewService {
    List<GymReviewDTO> getReviewsByGym(Long gymNo);
    GymReviewDTO addReview(GymReviewDTO dto);
    Double getAverageScore(Long gymNo);

    void deleteReview(Long reviewNo, Long memberNo);
}