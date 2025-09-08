package org.zerock.mallapi.domain.schedule.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TodayStatDTO {
    private Long todayStatNo;
    private Long memberNo;
    private LocalDate statDate;
    private Integer calories;
    private Integer minutes;
    private BigDecimal weightKg;
    private Integer waterMl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}