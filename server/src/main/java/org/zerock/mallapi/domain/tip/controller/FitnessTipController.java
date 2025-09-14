package org.zerock.mallapi.domain.tip.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.tip.dto.FitnessTipCreateDTO;
import org.zerock.mallapi.domain.tip.dto.FitnessTipDTO;
import org.zerock.mallapi.domain.tip.dto.FitnessTipUpdateDTO;
import org.zerock.mallapi.domain.tip.service.FitnessTipService;

import java.util.List;

@RestController
@RequestMapping("/api/fitness-tips")
@RequiredArgsConstructor
@Log4j2
public class FitnessTipController {

    private final FitnessTipService fitnessTipService;

    // 랜덤 팁 조회 (메인페이지용)
    @GetMapping("/random")
    public ResponseEntity<FitnessTipDTO> getRandomTip() {
        FitnessTipDTO tip = fitnessTipService.getRandomTip();
        return ResponseEntity.ok(tip);
    }

    // 활성화된 팁 목록 조회
    @GetMapping("/active")
    public ResponseEntity<List<FitnessTipDTO>> getActiveTips() {
        List<FitnessTipDTO> tips = fitnessTipService.getActiveTips();
        return ResponseEntity.ok(tips);
    }

    // 모든 팁 목록 조회 (관리자용)
    @GetMapping("/admin")
    public ResponseEntity<List<FitnessTipDTO>> getAllTips() {
        List<FitnessTipDTO> tips = fitnessTipService.getAllTips();
        return ResponseEntity.ok(tips);
    }

    // 팁 상세 조회
    @GetMapping("/{tipNo}")
    public ResponseEntity<FitnessTipDTO> getTip(@PathVariable Long tipNo) {
        FitnessTipDTO tip = fitnessTipService.getTip(tipNo);
        return ResponseEntity.ok(tip);
    }

    // 팁 생성 (관리자용)
    @PostMapping("/admin")
    public ResponseEntity<Long> createTip(@RequestBody FitnessTipCreateDTO createDTO) {
        Long tipNo = fitnessTipService.createTip(createDTO);
        return ResponseEntity.ok(tipNo);
    }

    // 팁 수정 (관리자용)
    @PutMapping("/admin/{tipNo}")
    public ResponseEntity<Void> updateTip(
            @PathVariable Long tipNo,
            @RequestBody FitnessTipUpdateDTO updateDTO) {
        fitnessTipService.updateTip(tipNo, updateDTO);
        return ResponseEntity.ok().build();
    }

    // 팁 삭제 (관리자용)
    @DeleteMapping("/admin/{tipNo}")
    public ResponseEntity<Void> deleteTip(@PathVariable Long tipNo) {
        fitnessTipService.deleteTip(tipNo);
        return ResponseEntity.ok().build();
    }

    // 팁 활성화/비활성화 (관리자용)
    @PatchMapping("/admin/{tipNo}/toggle")
    public ResponseEntity<Void> toggleTipStatus(
            @PathVariable Long tipNo,
            @RequestParam String modifiedBy) {
        fitnessTipService.toggleTipStatus(tipNo, modifiedBy);
        return ResponseEntity.ok().build();
    }
}