package org.zerock.mallapi.domain.trainer.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.trainer.dto.TrainerDetailDTO;
import org.zerock.mallapi.domain.trainer.dto.TrainerUpsertDTO;
import org.zerock.mallapi.domain.trainer.service.TrainerService;

@RestController
@RequestMapping("/api/admin/trainers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTrainerController {
    private final TrainerService trainerService;
    /** 트레이너 등록 */
    @PostMapping
    public ResponseEntity<TrainerDetailDTO> create(@Valid @RequestBody TrainerUpsertDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(trainerService.createTrainer(dto));
    }

    /** 트레이너 수정 */
    @PutMapping("/{trainerNo}")
    public ResponseEntity<TrainerDetailDTO> update(@PathVariable Long trainerNo,
                                                   @Valid @RequestBody TrainerUpsertDTO dto) {
        return ResponseEntity.ok(trainerService.updateTrainer(trainerNo, dto));
    }

    /** 트레이너 삭제 */
    @DeleteMapping("/{trainerNo}")
    public ResponseEntity<Void> delete(@PathVariable Long trainerNo) {
        trainerService.deleteTrainer(trainerNo);
        return ResponseEntity.noContent().build();
    }
}