package org.zerock.mallapi.domain.board.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardImageDto {
    private Long id; // 생성 시엔 null 가능, 응답에서 식별용으로 유용
    private String fileName;
    private Integer ord; // 정렬 순서
}