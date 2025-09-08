package org.zerock.mallapi.domain.support.questionboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionBoardDTO {
    
    private Long no;
    private String question;
    private String answer;
    private Long writerNo;
    private String writerEmail;
    private String writerNickname;
    private String writerRoleCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String deleteStatus;

    // Getter/Setter 명시적 추가 (Lombok 이슈 해결용)
    public Long getWriterNo() {
        return writerNo;
    }

    public void setWriterNo(Long writerNo) {
        this.writerNo = writerNo;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public Long getNo() {
        return no;
    }

    public void setNo(Long no) {
        this.no = no;
    }
}
