package org.zerock.mallapi.domain.schedule.service;

import org.zerock.mallapi.domain.schedule.dto.WeeklyGoalDTO;

import java.time.LocalDate;

public interface WeeklyGoalService {
    WeeklyGoalDTO get(Long memberNo, LocalDate weekStartSun);
    WeeklyGoalDTO upsert(Long memberNo, WeeklyGoalDTO dto);
}