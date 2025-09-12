package org.zerock.mallapi.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.zerock.mallapi.domain.member.entity.MemberRole;
import org.zerock.mallapi.domain.member.entity.MemberStatus;
import org.zerock.mallapi.global.util.DateTimeUtil;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString   //MemberDTO 는 스프링 시큐리티에서 이용하는 타입의 객체로 만들었다.그래서 USER 를 상속
public class MemberDTO extends User  {
//USER 객체 : Spring Security 에서 제공하는 인증용 사용자 객체
//           주로 로그인 된 사용자의 정보를 담기 위한 용도로 사용
    private Long memberNo;
    private String email;
    private String pw;
    private String nickname;    
    private String phone;
    private String postalCode;
    private String roadAddress;
    private String detailAddress;    
    private MemberStatus active;
    private MemberRole role;
    private String roleCode;
    private boolean social;
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime modifiedDate;
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime joinedDate;
    private List<String> roleNames = new ArrayList<>();

    public MemberDTO(String email, String pw, String nickname,
                     boolean social, List<String> roleNames) {
        //SimpleGrantedAuthority : spring Security 에서 사용자의 권한을 나타내기위한 클래스
        // 역할 또는 권한을 표현할 때 사용("ROLE_USER", "ROLE_ADMIN" 등)로 권한을 나타냄
        //roleNames 에서 권한을 하나씩 꺼내서 SimpleGrantedAuthority 의 생성자의 매개변수로
        //String 타입의 변수를 전송한다.
        super(email, pw, roleNames.stream().map(str ->
                new SimpleGrantedAuthority("ROLE_"+str)).collect(Collectors.toList()));

        this.email = email;
        this.pw = pw;
        this.nickname = nickname;
        this.social = social;
        this.roleNames = roleNames;
    }

    // JWT 토큰에서 memberNo를 포함한 인증용 생성자
    public MemberDTO(Long memberNo, String email, String pw, String nickname,
                     boolean social, List<String> roleNames) {
        super(email, pw, roleNames.stream().map(str ->
                new SimpleGrantedAuthority("ROLE_"+str)).collect(Collectors.toList()));

        this.memberNo = memberNo;
        this.email = email;
        this.pw = pw;
        this.nickname = nickname;
        this.social = social;
        this.roleNames = roleNames;
    }
    
    // 새로운 생성자 추가 (전체 필드)
    public MemberDTO(Long memberNo, String email, String pw, String nickname, String phone, 
                     String postalCode, String roadAddress, String detailAddress,
                     MemberStatus active, MemberRole role, String roleCode, boolean social, 
                     LocalDateTime modifiedDate, LocalDateTime joinedDate,
                     List<String> roleNames) {
        super(email, pw, roleNames.stream().map(str ->
                new SimpleGrantedAuthority("ROLE_"+str)).collect(Collectors.toList()));

        this.memberNo = memberNo;
        this.email = email;
        this.pw = pw;
        this.nickname = nickname;
        this.phone = phone;
        this.postalCode = postalCode;
        this.roadAddress = roadAddress;
        this.detailAddress = detailAddress;
        this.active = active;
        this.role = role;
        this.roleCode = roleCode;
        this.social = social;
        this.modifiedDate = modifiedDate;
        this.joinedDate = joinedDate;
        this.roleNames = roleNames;
    }

    // 추가 setter 메서드들
    public void setMemberNo(Long memberNo) {
        this.memberNo = memberNo;
    }    
    public void setPhone(String phone) {
        this.phone = phone;
    }      
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public void setRoadAddress(String roadAddress) {
        this.roadAddress = roadAddress;
    }
    
    public void setDetailAddress(String detailAddress) {
        this.detailAddress = detailAddress;
    }
    public void setActive(MemberStatus active) {
        this.active = active;
    }    
    public void setRole(MemberRole role) {
        this.role = role;
    }
    
    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode;
    }
    
    public void setModifiedDate(LocalDateTime modifiedDate) {
        this.modifiedDate = modifiedDate;
    }
    public void setJoinedDate(LocalDateTime joinedDate) {
        this.joinedDate = joinedDate;
    }    // 현재 사용자의 정보를 Map 타입으로 반환(이후에 JWT 문자열 생성시에 사용)
    public Map<String , Object> getClaims() {
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("memberNo", memberNo);
        dataMap.put("email", email);
        dataMap.put("pw", pw);
        dataMap.put("nickname", nickname);          
        dataMap.put("phone", phone);
        dataMap.put("postalCode", postalCode);
        dataMap.put("roadAddress", roadAddress);
        dataMap.put("detailAddress", detailAddress);        
        dataMap.put("active", active != null ? active.toString() : null);
        dataMap.put("role", role != null ? role.toString() : null);
        dataMap.put("roleCode", roleCode);
        dataMap.put("social", social);
        // LocalDateTime을 문자열로 변환하여 직렬화 문제 해결
        dataMap.put("modifiedDate", modifiedDate != null ? modifiedDate.toString() : null);
        dataMap.put("joinedDate", joinedDate != null ? joinedDate.toString() : null);
        
        // roleNames 설정 - role이 있으면 List로 변환, 없으면 빈 리스트
        if (role != null) {
            dataMap.put("roleNames", List.of(role.toString()));
        } else if (roleNames != null && !roleNames.isEmpty()) {
            dataMap.put("roleNames", roleNames);
        } else {
            dataMap.put("roleNames", List.of("USER")); // 기본값
        }

        return dataMap;
    }
}
