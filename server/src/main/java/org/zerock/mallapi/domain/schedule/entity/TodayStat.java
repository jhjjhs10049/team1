package org.zerock.mallapi.domain.schedule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.zerock.mallapi.domain.member.entity.Member;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(
        name = "today_stat",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_today_stat", columnNames = {"member_no", "stat_date"})
        },
        indexes = {
                @Index(name = "ix_today_stat_member_date", columnList = "member_no,stat_date")
        }
)
@Getter
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
@Builder
public class TodayStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "today_stat_no")
    private Long todayStatNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_no", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Member member;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;

    @Column(nullable = false)
    private Integer calories;     // kcal

    @Column(nullable = false)
    private Integer minutes;      // min

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;  // nullable

    @Column(name = "water_ml", nullable = false)
    private Integer waterMl;      // ml

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