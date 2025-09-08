package org.zerock.mallapi.domain.support.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomDTO {

    private Long no;
    private Long memberNo;
    private String memberNickname;
    private String memberEmail;
    private Long adminNo;
    private String adminNickname;
    private String adminEmail;
    private String questionType;
    private String questionDetail;
    private ChatRoom.ChatStatus status;
    private LocalDateTime createdAt;    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String rejectionReason; // 거절 사유
    private LocalDateTime rejectedAt; // 거절 시간

    // 사전 질문으로부터 채팅방 생성용 생성자
    public ChatRoomDTO(Long memberNo, String questionType, String questionDetail) {
        this.memberNo = memberNo;
        this.questionType = questionType;
        this.questionDetail = questionDetail;
        this.status = ChatRoom.ChatStatus.WAITING;
    }
}
