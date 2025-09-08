package org.zerock.mallapi.domain.trainer.service;

import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.trainer.dto.TrainerDetailDTO;
import org.zerock.mallapi.domain.trainer.dto.TrainerListItemDTO;
import org.zerock.mallapi.domain.trainer.dto.TrainerUpsertDTO;

import java.util.List;

public interface TrainerService {
    List<TrainerListItemDTO> list(String q, Long gymNo, Integer limit);
    TrainerDetailDTO get(Long trainerNo);
    @Transactional
    TrainerDetailDTO createTrainer(TrainerUpsertDTO dto);
    @Transactional
    TrainerDetailDTO updateTrainer(Long trainerNo, TrainerUpsertDTO dto);
    @Transactional
    void deleteTrainer(Long trainerNo);
}