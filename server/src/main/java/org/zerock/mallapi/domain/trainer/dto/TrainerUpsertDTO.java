package org.zerock.mallapi.domain.trainer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrainerUpsertDTO {

    @NotBlank
    private String name;

    private String photo;

    @NotNull
    private Long gymNo;

    private String specialty;
}