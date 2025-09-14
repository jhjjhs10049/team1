package org.zerock.mallapi.domain.tip.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.tip.dto.FitnessTipCreateDTO;
import org.zerock.mallapi.domain.tip.dto.FitnessTipDTO;
import org.zerock.mallapi.domain.tip.dto.FitnessTipUpdateDTO;
import org.zerock.mallapi.domain.tip.entity.FitnessTip;
import org.zerock.mallapi.domain.tip.repository.FitnessTipRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Log4j2
public class FitnessTipServiceImpl implements FitnessTipService {

    private final FitnessTipRepository fitnessTipRepository;

    @Override
    public FitnessTipDTO getRandomTip() {
        FitnessTip tip = fitnessTipRepository.findRandomActiveTip();
        if (tip == null) {
            // 기본 팁 반환
            return FitnessTipDTO.builder()
                    .content("꾸준한 운동이 건강의 비결입니다!")
                    .build();
        }
        return entityToDTO(tip);
    }

    @Override
    public List<FitnessTipDTO> getActiveTips() {
        List<FitnessTip> tips = fitnessTipRepository.findByIsActiveTrueOrderByCreatedDateDesc();
        return tips.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FitnessTipDTO> getAllTips() {
        List<FitnessTip> tips = fitnessTipRepository.findAllByOrderByCreatedDateDesc();
        return tips.stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FitnessTipDTO getTip(Long tipNo) {
        FitnessTip tip = fitnessTipRepository.findById(tipNo)
                .orElseThrow(() -> new RuntimeException("팁을 찾을 수 없습니다."));
        return entityToDTO(tip);
    }

    @Override
    @Transactional
    public Long createTip(FitnessTipCreateDTO createDTO) {
        FitnessTip tip = FitnessTip.builder()
                .content(createDTO.getContent())
                .createdBy(createDTO.getCreatedBy())
                .isActive(true)
                .build();
        
        FitnessTip savedTip = fitnessTipRepository.save(tip);
        return savedTip.getTipNo();
    }

    @Override
    @Transactional
    public void updateTip(Long tipNo, FitnessTipUpdateDTO updateDTO) {
        FitnessTip tip = fitnessTipRepository.findById(tipNo)
                .orElseThrow(() -> new RuntimeException("팁을 찾을 수 없습니다."));
        
        tip.setContent(updateDTO.getContent());
        tip.setModifiedBy(updateDTO.getModifiedBy());
        
        if (updateDTO.getIsActive() != null) {
            tip.setIsActive(updateDTO.getIsActive());
        }
        
        fitnessTipRepository.save(tip);
    }

    @Override
    @Transactional
    public void deleteTip(Long tipNo) {
        if (!fitnessTipRepository.existsById(tipNo)) {
            throw new RuntimeException("팁을 찾을 수 없습니다.");
        }
        fitnessTipRepository.deleteById(tipNo);
    }

    @Override
    @Transactional
    public void toggleTipStatus(Long tipNo, String modifiedBy) {
        FitnessTip tip = fitnessTipRepository.findById(tipNo)
                .orElseThrow(() -> new RuntimeException("팁을 찾을 수 없습니다."));
        
        tip.setIsActive(!tip.getIsActive());
        tip.setModifiedBy(modifiedBy);
        
        fitnessTipRepository.save(tip);
    }

    private FitnessTipDTO entityToDTO(FitnessTip entity) {
        return FitnessTipDTO.builder()
                .tipNo(entity.getTipNo())
                .content(entity.getContent())
                .isActive(entity.getIsActive())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .modifiedDate(entity.getModifiedDate())
                .modifiedBy(entity.getModifiedBy())
                .build();
    }
}