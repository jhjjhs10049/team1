package org.zerock.mallapi.global.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PageRequestDTO {
    
    @Builder.Default
    private int page = 0; // 기본값 0
    
    @Builder.Default
    private int size = 10; // 기본값 10

    public int getSkip() {
        return page * size;
    }
}
