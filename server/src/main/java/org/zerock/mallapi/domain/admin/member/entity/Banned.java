package org.zerock.mallapi.domain.admin.member.entity;
import jakarta.persistence.*;
import lombok.*;
import org.zerock.mallapi.global.util.DateTimeUtil;
import java.time.LocalDateTime;

@Entity
@Table(name = "banned")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class Banned {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;
    
    @Column(name = "member_no", nullable = false)
    private Long memberNo;
    
    @Column(name = "banned_at", nullable = false, columnDefinition = "DATETIME")
    private LocalDateTime bannedAt;
    
    @Column(name = "banned_until", columnDefinition = "DATETIME")
    private LocalDateTime bannedUntil; // null이면 영구 정지
      @Column(name = "reason", nullable = false, length = 500)
    private String reason;
    
    @Column(name = "banned_by", nullable = false, length = 50)
    private String bannedBy; // 정지 조치한 관리자의 role_code
      
    @Column(name = "unbanned_at", columnDefinition = "DATETIME")
    private LocalDateTime unbannedAt; // 실제 정지 해제 시각
    
    @Column(name = "unbanned_by", length = 50)
    private String unbannedBy; // 정지 해제한 관리자의 role_code
    
    // 정지 해제 메서드
    public void unban(String adminRoleCode) {
        this.unbannedAt = DateTimeUtil.getModifiedTime();
        this.unbannedBy = adminRoleCode;
    }
    
    // 현재 정지 상태인지 확인
    public boolean isCurrentlyBanned() {
        if (unbannedAt != null) {
            return false; // 이미 해제됨
        }
        
        if (bannedUntil == null) {
            return true; // 영구 정지
        }
        
        return LocalDateTime.now().isBefore(bannedUntil); // 기간 정지 중
    }
}
