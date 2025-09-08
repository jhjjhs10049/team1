package org.zerock.mallapi.domain.support.prequestion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatQuestionDTO {

    private Long no;
    
    // Member 정보
    private Long memberNo;
    private String memberEmail;
    private String memberNickname;
    private String memberPhone;    // 2개 질문의 답변
    private String q1; // 문의 유형 (선택)
    private String q2; // 자세한 문의사항 (텍스트)
    
    // 생성된 채팅방 ID
    private Long chatRoomId;
    
    // 메타 정보
    private LocalDateTime createdAt;
    private String deleteStatus;

    // 명시적 getter/setter (Lombok 이슈 방지)
    public Long getNo() {
        return no;
    }

    public void setNo(Long no) {
        this.no = no;
    }

    public Long getMemberNo() {
        return memberNo;
    }

    public void setMemberNo(Long memberNo) {
        this.memberNo = memberNo;
    }

    public String getQ1() {
        return q1;
    }

    public void setQ1(String q1) {
        this.q1 = q1;
    }

    public String getQ2() {
        return q2;
    }    public void setQ2(String q2) {
        this.q2 = q2;
    }
}
