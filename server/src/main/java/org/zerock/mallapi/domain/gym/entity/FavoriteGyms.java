package org.zerock.mallapi.domain.gym.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(
        name = "favorite_gyms",
        uniqueConstraints = @UniqueConstraint(columnNames = {"member_no", "gym_no"})
)
@EntityListeners(AuditingEntityListener.class)
@Getter @NoArgsConstructor(access = PROTECTED)
public class FavoriteGyms {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favorite_no")
    @Getter
    private Long favoriteNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_no", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_no", nullable = false)
    private Gym gym;

    @CreatedDate
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Builder
    public FavoriteGyms(Member member, Gym gym, LocalDateTime createdDate) {
        this.member = member;
        this.gym = gym;
        this.createdDate= createdDate;
    }
}