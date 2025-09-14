package org.zerock.mallapi.domain.tip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessTipCreateDTO {
    private String content;
    private String createdBy;
}