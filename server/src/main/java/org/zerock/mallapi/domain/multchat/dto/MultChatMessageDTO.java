package org.zerock.mallapi.domain.multchat.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultChatMessageDTO {

    private Long no;
    private Long chatRoomNo;
    private Long senderNo;
    private String senderNickname;
    private String content;
    private String messageType; // CHAT, JOIN, LEAVE, SYSTEM, FILE, IMAGE
    private LocalDateTime createdAt;
    private Boolean isDeleted;
    private String systemMessageData; // 시스템 메시지 추가 데이터

    // 메시지 전송용 생성자
    public MultChatMessageDTO(Long chatRoomNo, Long senderNo, String senderNickname, 
                            String content, String messageType) {
        this.chatRoomNo = chatRoomNo;
        this.senderNo = senderNo;
        this.senderNickname = senderNickname;
        this.content = content;
        this.messageType = messageType;
        this.createdAt = LocalDateTime.now();
        this.isDeleted = false;
    }
}
