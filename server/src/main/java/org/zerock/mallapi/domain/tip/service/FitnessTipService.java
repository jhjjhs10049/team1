package org.zerock.mallapi.domain.tip.service;

import org.zerock.mallapi.domain.tip.dto.FitnessTipCreateDTO;
import org.zerock.mallapi.domain.tip.dto.FitnessTipDTO;
import org.zerock.mallapi.domain.tip.dto.FitnessTipUpdateDTO;

import java.util.List;

public interface FitnessTipService {
    
    // 랜덤 팁 조회 (메인페이지용)
    FitnessTipDTO getRandomTip();
    
    // 활성화된 팁 목록 조회
    List<FitnessTipDTO> getActiveTips();
    
    // 모든 팁 목록 조회 (관리자용)
    List<FitnessTipDTO> getAllTips();
    
    // 팁 상세 조회
    FitnessTipDTO getTip(Long tipNo);
    
    // 팁 생성
    Long createTip(FitnessTipCreateDTO createDTO);
    
    // 팁 수정
    void updateTip(Long tipNo, FitnessTipUpdateDTO updateDTO);
    
    // 팁 삭제
    void deleteTip(Long tipNo);
    
    // 팁 활성화/비활성화
    void toggleTipStatus(Long tipNo, String modifiedBy);
}