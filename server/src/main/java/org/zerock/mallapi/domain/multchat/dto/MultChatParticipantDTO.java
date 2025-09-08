package org.zerock.mallapi.domain.multchat.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultChatParticipantDTO {

    private Long no;
    private Long chatRoomNo;
    private Long memberNo;
    private String memberNickname;
    private String role; // CREATOR, ADMIN, MEMBER
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Boolean isActive;
    private LocalDateTime lastReadAt;
    
    // 읽지 않은 메시지 수
    private Long unreadCount;
}
