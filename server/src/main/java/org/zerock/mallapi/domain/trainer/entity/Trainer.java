package org.zerock.mallapi.domain.trainer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.zerock.mallapi.domain.gym.entity.Gym;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "trainer")
@Getter
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
@Builder
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trainer_no")
    private Long trainerNo;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "photo", length = 255)
    private String photo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_no", nullable = false)
    private Gym gym;

    @Column(name = "specialty", length = 255)
    private String specialty;

    // 업데이트용 메서드
    public void update(String name, String photo, Gym gym, String specialty) {
        this.name = name;
        this.photo = photo;
        this.gym = gym;
        this.specialty = specialty;
    }
}