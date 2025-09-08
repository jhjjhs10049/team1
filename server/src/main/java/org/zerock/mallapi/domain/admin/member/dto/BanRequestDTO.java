package org.zerock.mallapi.domain.admin.member.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BanRequestDTO {
    
    private Long memberNo; // 정지할 회원 번호
    
    private String reason; // 정지 사유    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime bannedUntil; // 정지 해제 예정일 (null이면 영구 정지)
    
    private String bannedBy; // 정지 조치하는 관리자의 role_code
    
    // 정지 기간 타입 (frontend에서 사용)
    private String banType; // "temporary" 또는 "permanent"
    
    // 정지 기간 (일 단위, frontend에서 사용)
    private Integer banDurationDays;
    
    // 유효성 검증 메서드들
    public boolean isValid() {
        return memberNo != null && 
               reason != null && !reason.trim().isEmpty() && 
               bannedBy != null;
    }
    
    public boolean isPermanentBan() {
        return bannedUntil == null || "permanent".equals(banType);
    }
    
    public boolean isTemporaryBan() {
        return bannedUntil != null && "temporary".equals(banType);
    }
}
