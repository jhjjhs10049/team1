package org.zerock.mallapi.domain.gym.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.gym.dto.FavoriteListDTO;
import org.zerock.mallapi.domain.gym.dto.GymDetailDTO;
import org.zerock.mallapi.domain.gym.dto.GymListItemDTO;
import org.zerock.mallapi.domain.gym.dto.GymReviewDTO;
import org.zerock.mallapi.domain.gym.service.GymReviewService;
import org.zerock.mallapi.domain.gym.service.GymService;

import java.util.List;
import java.util.Map;

@Log4j2
@RestController
@RequestMapping("/api/gyms")
@RequiredArgsConstructor
public class GymController {
    private final GymService gymService;
    private final GymReviewService gymReviewService;

    // 헬스장 목록 조회 (검색/반경)
    @GetMapping
    public ResponseEntity<Page<GymListItemDTO>> listGyms(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Integer radius,
            @PageableDefault(size = 30, sort = "gym_no", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(gymService.searchGyms(q, lat, lng, radius, pageable));
    }

    // 헬스장 상세 조회 (평점, 리뷰 포함)
    @GetMapping("/{gymNo}")
    public ResponseEntity<GymDetailDTO> getGymDetail(
            @PathVariable Long gymNo,
            @RequestParam(required = false) Long memberNo
    ) {
        return ResponseEntity.ok(gymService.getGym(gymNo, memberNo));
    }

    // 특정 헬스장의 리뷰 목록 조회
    @GetMapping("/{gymNo}/reviews")
    public ResponseEntity<List<GymReviewDTO>> getReviewsByGym(@PathVariable Long gymNo) {
        return ResponseEntity.ok(gymReviewService.getReviewsByGym(gymNo));
    }    // 리뷰 등록
    @PostMapping("/{gymNo}/reviews")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<GymReviewDTO> addReview(
            @PathVariable Long gymNo,
            @RequestBody GymReviewDTO dto
    ) {
        dto.setGymNo(gymNo);
        return ResponseEntity.ok(gymReviewService.addReview(dto));
    }

    // 즐겨찾기 등록/해제
    @PostMapping("/{gymNo}/favorite")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> setFavorite(
            @PathVariable Long gymNo,
            @RequestParam Long memberNo,
            @RequestParam boolean favorite
    ) {
        return ResponseEntity.ok(gymService.setFavorite(gymNo, memberNo, favorite));
    }

    @GetMapping("/favorites/list")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<FavoriteListDTO>> getFavoriteGyms(
            @RequestParam Long memberNo
    ) {
        return ResponseEntity.ok(gymService.getFavoriteGyms(memberNo));
    }

    // 리뷰 삭제
    @DeleteMapping("/{gymNo}/reviews/{reviewNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long gymNo,
            @PathVariable Long reviewNo,
            @RequestParam Long memberNo
    ) {
        gymReviewService.deleteReview(reviewNo, memberNo);
        return ResponseEntity.noContent().build(); // 204
    }
}