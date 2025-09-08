package org.zerock.mallapi.domain.gym.dto;

import lombok.*;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
public class GymReviewDTO {
    private Long reviewNo;
    private Long gymNo;
    private Long writerNo;
    private String writerName;
    private double score;
    private String comment;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
}