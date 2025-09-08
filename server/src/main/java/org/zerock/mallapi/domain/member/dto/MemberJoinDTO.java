package org.zerock.mallapi.domain.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberJoinDTO {
    private String email;
    private String pw;
    private String nickname;    
    private String phone;
    private String postalCode;
    private String roadAddress;
    private String detailAddress;
}
