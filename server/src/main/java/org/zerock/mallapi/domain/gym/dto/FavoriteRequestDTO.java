package org.zerock.mallapi.domain.gym.dto;

import lombok.*;

import static lombok.AccessLevel.PROTECTED;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
public class FavoriteRequestDTO {
    private Long memberNo;
    private Long gymNo;
}