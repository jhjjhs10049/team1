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
    private String description;  // 새로 추가
    private String exerciseList; // 새로 추가
    private String color;
    private List<RoutineItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
