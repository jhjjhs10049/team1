package org.zerock.mallapi.domain.multchat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "mult_chat_room_participant")
public class MultChatRoomParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_no", nullable = false)
    private MultChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_no", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParticipantRole role = ParticipantRole.MEMBER;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    private LocalDateTime leftAt; // 퇴장 시간
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true; // 현재 활성 상태

    // 마지막 메시지 읽은 시간 (읽지 않은 메시지 수 계산용)
    private LocalDateTime lastReadAt;

    public enum ParticipantRole {
        CREATOR,  // 방장
        ADMIN,    // 관리자
        MEMBER    // 일반 멤버
    }

    // 참가자 퇴장 처리
    public void leave() {
        this.isActive = false;
        this.leftAt = LocalDateTime.now();
    }

    // 참가자 재입장 처리
    public void rejoin() {
        this.isActive = true;
        this.leftAt = null;
    }

    // 마지막 읽은 시간 업데이트
    public void updateLastReadTime() {
        this.lastReadAt = LocalDateTime.now();
    }
}
