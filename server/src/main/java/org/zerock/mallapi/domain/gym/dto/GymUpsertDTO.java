package org.zerock.mallapi.domain.gym.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

// 헬스장 등록/수정(전체 갱신) 공용 DTO
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymUpsertDTO {
    /** 헬스장명 */
    @NotBlank(message = "헬스장명(title)은 필수입니다.")
    @Size(max = 255, message = "헬스장명은 최대 255자입니다.")
    private String title;

    /** 소개/설명 */
    @NotBlank(message = "소개(content)는 필수입니다.")
    private String content;

    /** 주소 */
    @NotBlank(message = "주소(address)는 필수입니다.")
    @Size(max = 255, message = "주소는 최대 255자입니다.")
    private String address;

    /** 연락처 (선택) */
    @Size(max = 30, message = "전화번호는 최대 30자입니다.")
    private String phoneNumber;

    /** 운영시간 (선택) */
    @Size(max = 255, message = "운영시간은 최대 255자입니다.")
    private String openingHours;

    /** 부대시설 (선택) */
    @Builder.Default
    private List<String> facilities = new ArrayList<>();

    /** 이미지 URL 목록 (선택) */
    @Builder.Default
    private List<String> imageList = new ArrayList<>();

    /** 지도 좌표: X=경도(lng), Y=위도(lat) */
    @NotNull(message = "경도(locationX)는 필수입니다.")
    private Double locationX;

    @NotNull(message = "위도(locationY)는 필수입니다.")
    private Double locationY;

    /** 작성자(로그인된 사용자 정보를 가져옴) */
    @NotNull
    private Long writerId;
}