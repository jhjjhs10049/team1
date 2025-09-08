package org.zerock.mallapi.domain.trainer.dto;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TrainerListItemDTO {
    private Long trainerNo;
    private String name;
    private String photo;
    private Long gymNo;
    private String gymTitle;   // 필요 시 채움 (간단히 이름만)
    private String specialty;

    private double rate;       // 평균 평점
    private long reviewCount;  // 리뷰 개수
}
