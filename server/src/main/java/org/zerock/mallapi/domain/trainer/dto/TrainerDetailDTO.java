package org.zerock.mallapi.domain.trainer.dto;

import lombok.*;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TrainerDetailDTO {
    private Long trainerNo;
    private String name;
    private String photo;

    private Long gymNo;
    private String gymTitle;

    private String specialty;

    private double rate;
    private long reviewCount;
}