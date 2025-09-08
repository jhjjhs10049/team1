package org.zerock.mallapi.domain.gym.dto;

import lombok.*;

import static lombok.AccessLevel.PROTECTED;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
public class FavoriteListDTO {
    private Long gymNo;
    private String title;
    private String address;
    private String imageUrl;
    private Double rate;
}