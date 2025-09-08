package org.zerock.mallapi.domain.admin.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.zerock.mallapi.domain.member.entity.MemberRole;
import org.zerock.mallapi.domain.member.entity.MemberStatus;
import org.zerock.mallapi.global.util.DateTimeUtil;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminMemberDTO {
    
    private Long memberNo;
    
    private String email;
    
    private String nickname;
    
    private String phone;
    
    private String postalCode;
    
    private String roadAddress;
    
    private String detailAddress;
    
    private MemberStatus active;
    
    private MemberRole role;
    
    private String roleCode;
    
    private Boolean social;
    
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime joinedDate;
    
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime modifiedDate;
    
    // 현재 정지 정보 (정지된 경우에만)
    private BannedDTO currentBan;
    
    // 전체 정지 횟수
    private int totalBanCount;
    
    // 헬퍼 메서드들
    public boolean isActive() {
        return MemberStatus.ACTIVE.equals(active);
    }
    
    public boolean isBanned() {
        return MemberStatus.BANNED.equals(active);
    }
    
    public boolean isDeleted() {
        return MemberStatus.DELETED.equals(active);
    }
    
    public boolean isCurrentlyBanned() {
        return currentBan != null && currentBan.isCurrentlyBanned();
    }
    
    public String getStatusDisplayName() {
        if (active == null) return "알 수 없음";
        
        switch (active) {
            case ACTIVE:
                return "활성";
            case BANNED:
                return "정지";
            case DELETED:
                return "삭제";
            default:
                return active.toString();
        }
    }
    
    public String getRoleDisplayName() {
        if (role == null) return "알 수 없음";
        
        String roleName = role.toString();
        if (roleCode != null && !roleCode.isEmpty()) {
            roleName += " (" + roleCode + ")";
        }
        
        return roleName;
    }
}
