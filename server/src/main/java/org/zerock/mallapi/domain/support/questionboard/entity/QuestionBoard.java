package org.zerock.mallapi.domain.support.questionboard.entity;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

@Entity
@Table(name = "question_board")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@ToString
public class QuestionBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long no;    
    
    @Column(name = "question", nullable = false, length = 500)
    private String question;

    @Column(name = "answer", nullable = false, length = 2000)
    private String answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    private Member writer;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "delete_status", nullable = false)
    @Builder.Default
    private String deleteStatus = "N";

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 질문 수정 메서드
    public void updateQuestion(String question) {
        this.question = question;
        this.updatedAt = LocalDateTime.now();
    }

    // 답변 수정 메서드
    public void updateAnswer(String answer) {
        this.answer = answer;
        this.updatedAt = LocalDateTime.now();
    }

    // 수정 시간 업데이트
    public void updateModifiedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // 삭제 메서드 (소프트 삭제)
    public void markAsDeleted() {
        this.deleteStatus = "Y";
        this.updatedAt = LocalDateTime.now();
    }
}
