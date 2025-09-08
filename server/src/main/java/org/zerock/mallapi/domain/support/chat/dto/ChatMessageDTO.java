package org.zerock.mallapi.domain.support.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.zerock.mallapi.domain.support.chat.entity.ChatMessage;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {

    private Long no;
    private Long chatRoomNo;
    private Long senderNo;
    private String senderNickname;
    private String senderEmail;
    private String message;
    private ChatMessage.MessageType messageType;
    private LocalDateTime sentAt;
    private String readStatus;
    private String deleteStatus;

    // 메시지 전송용 생성자
    public ChatMessageDTO(Long chatRoomNo, Long senderNo, String message, ChatMessage.MessageType messageType) {
        this.chatRoomNo = chatRoomNo;
        this.senderNo = senderNo;
        this.message = message;
        this.messageType = messageType;
        this.readStatus = "N";
        this.deleteStatus = "N";
    }
}
