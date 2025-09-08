package org.zerock.mallapi.domain.schedule.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

import java.util.List;

@Data
@Builder
public class RoutineDTO {
    private Long routineNo;
    private Long memberNo;
    private String routineKey;
    private String name;
    private String color;
    private List<RoutineItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
