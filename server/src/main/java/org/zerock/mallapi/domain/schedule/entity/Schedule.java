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
        name = "schedule",
        indexes = {
                @Index(name = "ix_schedule_member_date", columnList = "member_no,date"),
                @Index(name = "ix_schedule_member_start", columnList = "member_no,start_time")
        }
)
@Getter
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_no")
    private Long scheduleNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_no", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Member member;

    /** YYYY-MM-DD */
    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 100)
    private String title;

    /** YYYY-MM-DD HH:MM */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(length = 100)
    private String gym;

    @Column(name = "trainer_name", length = 100)
    private String trainerName;

    @Column(length = 32)
    private String color;

    @Column(nullable = false)
    private boolean completed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        // 간단 검증: 종료가 시작보다 뒤여야 함
        if (endTime != null && startTime != null && !endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (endTime != null && startTime != null && !endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }
    }
}
