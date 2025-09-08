package org.zerock.mallapi.domain.support.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_room")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"member", "admin"})
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_no")
    private Member member; // 문의한 회원

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_no")
    private Member admin; // 담당 관리자 (처음에는 null)

    @Column(name = "question_type", length = 100)
    private String questionType; // Q1 답변 (문의 유형)    @Column(name = "question_detail", length = 1000)
    private String questionDetail; // Q2 답변 (자세한 문의사항)

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('WAITING', 'ACTIVE', 'ENDED', 'REJECTED')")
    private ChatStatus status; // 채팅방 상태

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt; // 채팅 시작 시간

    @Column(name = "ended_at")
    private LocalDateTime endedAt; // 채팅 종료 시간

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason; // 거절 사유 (REJECTED 상태일 때 사용)

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt; // 거절 시간

    public enum ChatStatus {
        WAITING,    // 대기중 (관리자 배정 전)
        ACTIVE,     // 진행중 (관리자와 채팅 중)
        ENDED,      // 종료됨
        REJECTED    // 거절됨
    }    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ChatStatus.WAITING;
        }
    }

    // 관리자 배정 및 채팅 시작
    public void startChat(Member admin) {
        this.admin = admin;
        this.status = ChatStatus.ACTIVE;
        this.startedAt = LocalDateTime.now();
    }    // 채팅 종료
    public void endChat() {
        // 이미 거절된 상태인 경우 상태를 변경하지 않음
        if (this.status == ChatStatus.REJECTED) {
            return;
        }
        this.status = ChatStatus.ENDED;
        this.endedAt = LocalDateTime.now();
    }    // 채팅방 거절
    public void rejectChat(String rejectionReason) {
        this.status = ChatStatus.REJECTED;
        this.rejectionReason = rejectionReason;
        this.rejectedAt = LocalDateTime.now();
    }
      // 채팅방 거절 (관리자 정보 포함)
    public void rejectChat(Member admin, String rejectionReason) {
        this.admin = admin;
        this.status = ChatStatus.REJECTED;
        this.rejectionReason = rejectionReason;
        this.rejectedAt = LocalDateTime.now();
    }
}
