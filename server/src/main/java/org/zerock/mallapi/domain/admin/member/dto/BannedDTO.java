package org.zerock.mallapi.domain.admin.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.zerock.mallapi.global.util.DateTimeUtil;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BannedDTO {
    
    private Long no;
    
    private Long memberNo;
    
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime bannedAt;
    
    @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime bannedUntil;
      private String reason;
    
    private String bannedBy;
      @JsonFormat(pattern = DateTimeUtil.DATE_TIME_PATTERN, timezone = "Asia/Seoul")
    private LocalDateTime unbannedAt;
    
    private String unbannedBy;
    
    // 현재 정지 상태인지 확인하는 헬퍼 메서드
    public boolean isCurrentlyBanned() {
        if (unbannedAt != null) {
            return false; // 이미 해제됨
        }
        
        if (bannedUntil == null) {
            return true; // 영구 정지
        }
        
        return LocalDateTime.now().isBefore(bannedUntil); // 기간 정지 중
    }
    
    // 정지 타입 반환 (영구/기간)
    public String getBanType() {
        return bannedUntil == null ? "영구 정지" : "기간 정지";
    }
}
