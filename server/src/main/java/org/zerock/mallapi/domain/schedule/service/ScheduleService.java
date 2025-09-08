package org.zerock.mallapi.domain.schedule.service;

import org.zerock.mallapi.domain.schedule.dto.ScheduleDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleService {
    List<ScheduleDTO> getSchedulesByDate(Long memberNo, LocalDate date);
    List<ScheduleDTO> getSchedulesByDateRange(Long memberNo, LocalDate from, LocalDate to);
    List<ScheduleDTO> getSchedulesByStartTimeRange(Long memberNo, LocalDateTime from, LocalDateTime to);
    ScheduleDTO createSchedule(Long memberNo, ScheduleDTO dto);
    ScheduleDTO updateSchedule(Long memberNo, ScheduleDTO dto);
    void deleteSchedule(Long memberNo, Long scheduleNo);
    ScheduleDTO setCompleted(Long memberNo, Long scheduleNo, boolean completed);
}