package org.zerock.mallapi.domain.multchat.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultChatRoomDTO {

    private Long no;
    private String roomName;
    private String description;
    private Long creatorNo;
    private String creatorNickname;
    private Integer maxParticipants;
    private Integer currentParticipants;    private String status; // ACTIVE, CLOSED, ARCHIVED
    private String roomType; // PUBLIC, PRIVATE
    private boolean hasPassword; // 비밀번호 여부만 전달 (보안)
    private String password; // 비밀번호 입력/수정시에만 사용 (저장시 암호화됨)
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    
    // 참가자 목록 (현재 활성 상태인 참가자들)
    private List<MultChatParticipantDTO> participants;
    
    // 최근 메시지 (채팅방 목록에서 미리보기용)
    private MultChatMessageDTO lastMessage;
    
    // 내가 읽지 않은 메시지 수
    private Long unreadCount;
    
    // 내가 참가 중인지 여부
    private Boolean isParticipating;
    
    // 내 권한 (방장, 관리자, 멤버)
    private String myRole;
}
