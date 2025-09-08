package org.zerock.mallapi.domain.trainer.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.trainer.dto.TrainerDetailDTO;
import org.zerock.mallapi.domain.trainer.dto.TrainerListItemDTO;
import org.zerock.mallapi.domain.trainer.dto.TrainerReviewDTO;
import org.zerock.mallapi.domain.trainer.service.TrainerReviewService;
import org.zerock.mallapi.domain.trainer.service.TrainerService;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
@RequiredArgsConstructor
@Log4j2
public class TrainerController {

    private final TrainerService trainerService;
    private final TrainerReviewService trainerReviewService;

    // 목록 (q: 검색)
    @GetMapping
    public ResponseEntity<List<TrainerListItemDTO>> list(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) Long gymNo,
            @RequestParam(required = false, defaultValue = "30") Integer limit
    ) {
        log.info("[TrainerController] list q={}, gymNo={}, limit={}", q, gymNo, limit);
        return ResponseEntity.ok(trainerService.list(q, gymNo, limit));
    }

    // 상세
    @GetMapping("/{trainerNo}")
    public ResponseEntity<TrainerDetailDTO> detail(@PathVariable Long trainerNo) {
        return ResponseEntity.ok(trainerService.get(trainerNo));
    }

    // 리뷰 목록
    @GetMapping("/{trainerNo}/reviews")
    public ResponseEntity<List<TrainerReviewDTO>> reviews(@PathVariable Long trainerNo) {
        return ResponseEntity.ok(trainerReviewService.getReviewsByTrainer(trainerNo));
    }    // 리뷰 등록
    @PostMapping("/{trainerNo}/reviews")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<TrainerReviewDTO> addReview(
            @PathVariable Long trainerNo,
            @RequestBody TrainerReviewDTO dto
    ) {
        dto.setTrainerNo(trainerNo);
        return ResponseEntity.ok(trainerReviewService.addReview(dto));
    }

    // 리뷰 삭제
    @DeleteMapping("/{trainerNo}/reviews/{reviewNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long trainerNo,
            @PathVariable Long reviewNo,
            @RequestParam Long memberNo
    ) {
        trainerReviewService.deleteReview(reviewNo, memberNo);
        return ResponseEntity.noContent().build();
    }
}