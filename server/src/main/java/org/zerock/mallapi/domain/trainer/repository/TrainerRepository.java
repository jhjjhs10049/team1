package org.zerock.mallapi.domain.trainer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.mallapi.domain.trainer.entity.Trainer;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {
}