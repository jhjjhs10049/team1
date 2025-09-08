package org.zerock.mallapi.domain.trainer.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "trainer_review")
@EntityListeners(AuditingEntityListener.class)
@Getter @NoArgsConstructor(access = PROTECTED)
public class TrainerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_no")
    private Long reviewNo;

    @Column(name = "score", nullable = false)
    private double score;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_no", nullable = false)
    private Trainer trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_no", nullable = false)
    private Member writer;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @CreatedDate
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "modified_date", nullable = false)
    private LocalDateTime modifiedDate;

    @Builder
    public TrainerReview(double score, Trainer trainer, Member writer, String comment) {
        this.score = score;
        this.trainer = trainer;
        this.writer = writer;
        this.comment = comment;
    }
}