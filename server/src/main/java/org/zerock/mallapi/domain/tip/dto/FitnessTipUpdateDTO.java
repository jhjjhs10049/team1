package org.zerock.mallapi.domain.tip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessTipUpdateDTO {
    private String content;
    private Boolean isActive;
    private String modifiedBy;
}