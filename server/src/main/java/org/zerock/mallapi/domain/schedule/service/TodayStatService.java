package org.zerock.mallapi.domain.schedule.service;

import org.zerock.mallapi.domain.schedule.dto.TodayStatDTO;

import java.time.LocalDate;

public interface TodayStatService {
    TodayStatDTO get(Long memberNo, LocalDate date);
    TodayStatDTO upsert(Long memberNo, TodayStatDTO dto);
}