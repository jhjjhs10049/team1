package org.zerock.mallapi.domain.tip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessTipDTO {
    private Long tipNo;
    private String content;
    private Boolean isActive;
    private String createdBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private String modifiedBy;
}