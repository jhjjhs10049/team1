package org.zerock.mallapi.domain.multchat.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@AllArgsConstructor
public class ChatMessage {


    private MessageType type;
    private String content;
    private String sender;
    private String timestamp;
    //private List<String> roomUserNames = null;

    public enum MessageType {
        CHAT, JOIN, LEAVE
    }

    public ChatMessage() {
        this.timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public ChatMessage(MessageType type, String content, String sender) {
        this();
        this.type = type;
        this.content = content;
        this.sender = sender;
//        this.roomUserNames = names;
    }

}
