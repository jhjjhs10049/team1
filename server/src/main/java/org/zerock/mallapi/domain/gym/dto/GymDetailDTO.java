package org.zerock.mallapi.domain.gym.dto;

import lombok.*;
import org.zerock.mallapi.domain.trainer.dto.TrainerDTO;

import java.util.ArrayList;
import java.util.List;

import static lombok.AccessLevel.PROTECTED;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
public class GymDetailDTO {
    private Long gymNo;
    private String title;
    private String content;
    private String address;
    private String phoneNumber;
    private String openingHours;

    @Builder.Default
    private List<String> facilities = new ArrayList<>();

    @Builder.Default
    private Double rate = 0.0;

    @Builder.Default
    private List<String> imageList = new ArrayList<>();

    @Builder.Default
    private List<TrainerDTO> trainers = new ArrayList<>();

    @Builder.Default
    private List<GymReviewDTO> reviews = new ArrayList<>();

    private Double locationX;
    private Double locationY;

    private Boolean isFavorite;
    private Integer favoriteCount;
}