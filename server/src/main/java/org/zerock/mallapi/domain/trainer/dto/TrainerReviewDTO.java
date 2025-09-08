package org.zerock.mallapi.domain.trainer.dto;

import lombok.*;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
public class TrainerReviewDTO {
    private Long reviewNo;
    private double score;
    private Long trainerNo; // Trainer 엔티티의 ID
    private Long writerNo; // Member 엔티티의 ID (작성자)
    private String writerNickname; // 작성자 닉네임 (서비스 로직에서 채워줌)
    private String comment;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

}