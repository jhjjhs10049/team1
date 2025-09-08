package org.zerock.mallapi.domain.member.dto;

import lombok.Data;

@Data
public class MemberModifyDTO {

    private String email;

    private String pw;

    private String nickname;
      private String phone;
    
    private String postalCode;
    
    private String roadAddress;
    
    private String detailAddress;
}
