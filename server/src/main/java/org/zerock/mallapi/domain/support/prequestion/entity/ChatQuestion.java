package org.zerock.mallapi.domain.support.prequestion.entity;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_question")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "member")
public class ChatQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_no")
    private Member member;    // 2개 질문의 답변
    @Column(name = "q1", length = 100)
    private String q1; // 문의 유형 (선택)

    @Column(name = "q2", length = 1000)
    private String q2; // 자세한 문의사항 (텍스트)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "delete_status", length = 1, nullable = false)
    private String deleteStatus; // "Y", "N"

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.deleteStatus == null) {
            this.deleteStatus = "N";
        }
    }

    // 소프트 삭제 메서드
    public void markAsDeleted() {
        this.deleteStatus = "Y";
    }
}
