package org.zerock.mallapi.domain.multchat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "mult_chat_room")
public class MultChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @Column(nullable = false, length = 100)
    private String roomName;
    
    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_no", nullable = false)
    private Member creator;

    @Builder.Default
    @Column(nullable = false)
    private Integer maxParticipants = 50; // 최대 참가자 수

    @Builder.Default
    @Column(nullable = false)
    private Integer currentParticipants = 0; // 현재 참가자 수

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.ACTIVE;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType = RoomType.PUBLIC;    private String password; // 비공개 방일 경우 비밀번호

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime modifiedAt;
    
    // 채팅방 참가자 목록 (양방향 매핑)
    @Builder.Default
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MultChatRoomParticipant> participants = new ArrayList<>();

    // 채팅방 메시지 목록 (양방향 매핑)
    @Builder.Default
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MultChatMessage> messages = new ArrayList<>();

    public enum RoomStatus {
        ACTIVE,   // 활성
        CLOSED,   // 폐쇄
        ARCHIVED  // 보관
    }

    public enum RoomType {
        PUBLIC,   // 공개방
        PRIVATE   // 비공개방
    }

    // 참가자 입장
    public void addParticipant(Member member) {
        this.currentParticipants++;
    }

    // 참가자 퇴장
    public void removeParticipant(Member member) {
        if (this.currentParticipants > 0) {
            this.currentParticipants--;
        }
    }

    // 채팅방 폐쇄
    public void closeRoom() {
        this.status = RoomStatus.CLOSED;
    }

    // 채팅방 보관
    public void archiveRoom() {
        this.status = RoomStatus.ARCHIVED;
    }

    // 참가 가능 여부 확인
    public boolean canJoin() {
        return this.status == RoomStatus.ACTIVE && 
               this.currentParticipants < this.maxParticipants;
    }

    // 방장 여부 확인
    public boolean isCreator(Long memberNo) {
        return this.creator.getMemberNo().equals(memberNo);
    }
}
