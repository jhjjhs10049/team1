package org.zerock.mallapi.domain.trainer.dto;

import lombok.*;

import static lombok.AccessLevel.PROTECTED;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
public class TrainerDTO {
    private Long trainerNo;
    private String name;
    private String photo;
    private Long gymNo;
    private String specialty;
}