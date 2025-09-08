package org.zerock.mallapi.domain.schedule.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class WeeklyGoalDTO {
    private Long weeklyGoalNo;
    private Long memberNo;
    private LocalDate weekStartSun;
    private Integer targetPercent;
    private Integer donePercent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}