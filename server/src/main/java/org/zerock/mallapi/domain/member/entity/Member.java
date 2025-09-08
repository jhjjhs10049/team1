package org.zerock.mallapi.domain.member.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.zerock.mallapi.global.util.DateTimeUtil;

import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class Member {

    // Member Table Entity
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_no")
    private Long memberNo;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "pw", nullable = false)
    private String pw;

    @Column(name = "nickname", nullable = false, unique = true)
    private String nickname;    
    
    @Column(name = "phone")
    private String phone;    
    
    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "road_address")
    private String roadAddress;

    @Column(name = "detail_address")
    private String detailAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "active", nullable = false)
    @Builder.Default
    private MemberStatus active = MemberStatus.ACTIVE;    
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private MemberRole role = MemberRole.USER;

    @Column(name = "role_code", length = 4)
    private String roleCode;

    @Column(name = "social")
    @Builder.Default
    private Boolean social = false;
    
    @Column(name = "modified_date", nullable = true, columnDefinition = "DATETIME")
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime modifiedDate;

    @Column(name = "joined_date", updatable = false, columnDefinition = "DATETIME")
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime joinedDate;
    
    // 변경 메서드들
    public void changeNickname(String nickname){
        this.nickname = nickname;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }

    public void changePw(String pw){
        this.pw = pw;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }

    public void changeSocial(boolean social){
        this.social = social;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }    
    
    public void changePhone(String phone) {
        this.phone = phone;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }    
    
    public void changeAddress(String postalCode, String roadAddress, String detailAddress) {
        this.postalCode = postalCode;
        this.roadAddress = roadAddress;
        this.detailAddress = detailAddress;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }

    public void changeActive(MemberStatus active) {
        this.active = active;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }    public void changeRole(MemberRole role) {
        this.role = role;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }

    public void changeRoleCode(String roleCode) {
        this.roleCode = roleCode;
        this.modifiedDate = DateTimeUtil.getModifiedTime();
    }
    
    // 디폴트 설정
    @PrePersist
    public void prePersist() {
        LocalDateTime now = DateTimeUtil.getJoinedTime();
        if (this.joinedDate == null) {
            this.joinedDate = now;
        }
        // 기본 역할 설정
        if (this.role == null) {
            this.role = MemberRole.USER;
        }
    }
}
