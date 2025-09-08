package org.zerock.mallapi.domain.schedule.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoutineItemDTO {
    private Long routineItemNo;
    private Integer sortOrder;
    private String content;
}