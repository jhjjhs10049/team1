package org.zerock.mallapi.domain.gym.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

//부분 수정(PATCH) 용 DTO,  * null인 필드는 무시, 값이 있으면 해당 필드만 업데이트
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GymPatchDTO {

    @Size(max = 255)
    private String title;

    private String content;

    @Size(max = 255)
    private String address;

    @Size(max = 30)
    private String phoneNumber;

    @Size(max = 255)
    private String openingHours;

    private List<String> facilities;

    private List<String> imageList;

    private Double locationX; // lng
    private Double locationY; // lat
}