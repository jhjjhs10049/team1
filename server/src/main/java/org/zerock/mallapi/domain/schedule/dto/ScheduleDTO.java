package org.zerock.mallapi.domain.schedule.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ScheduleDTO {
    private Long scheduleNo;
    private Long memberNo;
    private LocalDate date;
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String gym;
    private String trainerName;
    private String color;
    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}