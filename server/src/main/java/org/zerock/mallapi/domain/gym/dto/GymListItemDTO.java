package org.zerock.mallapi.domain.gym.dto;

import lombok.*;

import static lombok.AccessLevel.PROTECTED;

@Getter
@Setter
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
@Builder
public class GymListItemDTO {
    private Long gymNo;
    private String title;
    private String address;
    private Double locationX; // 경도(추정)
    private Double locationY; // 위도(추정)
    private Double rate;      // 평균 평점 (없으면 0.0)
    private Double distance;  // 선택: 반경 검색 시 m 단위 거리, 없으면 null
}