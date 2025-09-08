package org.zerock.mallapi.domain.schedule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(
        name = "weekly_goal",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_weekly_goal", columnNames = {"member_no", "week_start_sun"})
        },
        indexes = {
                @Index(name = "ix_weekly_goal_member_week", columnList = "member_no,week_start_sun")
        }
)
@Getter
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
@Builder
public class WeeklyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weekly_goal_no")
    private Long weeklyGoalNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_no", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Member member;

    /** 그 주의 '일요일' */
    @Column(name = "week_start_sun", nullable = false)
    private LocalDate weekStartSun;

    @Column(name = "target_percent", nullable = false)
    private Integer targetPercent;

    @Column(name = "done_percent", nullable = false)
    private Integer donePercent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}