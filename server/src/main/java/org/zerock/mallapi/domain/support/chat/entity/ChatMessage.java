package org.zerock.mallapi.domain.support.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_message")
@org.hibernate.annotations.DynamicInsert
@org.hibernate.annotations.DynamicUpdate
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"chatRoom", "sender"})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_no")
    private ChatRoom chatRoom; // 채팅방

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_no")
    private Member sender; // 메시지 발신자    @Column(name = "message", length = 1000, nullable = false, columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String message; // 메시지 내용

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType; // 메시지 유형

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "read_status", length = 1, nullable = false)
    private String readStatus; // "Y", "N"

    @Column(name = "delete_status", length = 1, nullable = false)
    private String deleteStatus; // "Y", "N"

    public enum MessageType {
        USER,       // 사용자 메시지
        ADMIN,      // 관리자 메시지
        SYSTEM      // 시스템 메시지 (입장, 퇴장 등)
    }

    @PrePersist
    public void prePersist() {
        this.sentAt = LocalDateTime.now();
        if (this.readStatus == null) {
            this.readStatus = "N";
        }
        if (this.deleteStatus == null) {
            this.deleteStatus = "N";
        }
    }

    // 메시지 읽음 처리
    public void markAsRead() {
        this.readStatus = "Y";
    }

    // 소프트 삭제
    public void markAsDeleted() {
        this.deleteStatus = "Y";
    }
}
