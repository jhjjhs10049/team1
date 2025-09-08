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
@Table(name = "mult_chat_message")
public class MultChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_no", nullable = false)
    private MultChatRoom chatRoom;    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_no", nullable = true)
    private Member sender;@Column(nullable = false, length = 1000, columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageType messageType = MessageType.CHAT;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = Boolean.FALSE;

    private LocalDateTime deletedAt;

    // 시스템 메시지용 추가 정보
    private String systemMessageData; // JSON 형태로 시스템 메시지 관련 데이터 저장

    public enum MessageType {
        CHAT,     // 일반 채팅 메시지
        JOIN,     // 입장 알림
        LEAVE,    // 퇴장 알림
        SYSTEM,   // 시스템 메시지
        FILE,     // 파일 첨부
        IMAGE     // 이미지 첨부
    }

    // 메시지 삭제 (소프트 삭제)
    public void deleteMessage() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.content = "삭제된 메시지입니다.";
    }

    // 시스템 메시지인지 확인
    public boolean isSystemMessage() {
        return this.messageType == MessageType.SYSTEM || 
               this.messageType == MessageType.JOIN || 
               this.messageType == MessageType.LEAVE;
    }
}
