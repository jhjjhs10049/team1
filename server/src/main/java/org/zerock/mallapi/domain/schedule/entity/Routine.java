package org.zerock.mallapi.domain.schedule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(
        name = "routine",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_routine_member_key", columnNames = {"member_no", "routine_key"})
        }
)
@Getter
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
@Builder
public class Routine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "routine_no")
    private Long routineNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_no", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Member member;

    /** 프론트의 key 와 매핑 */
    @Column(name = "routine_key", nullable = false, length = 64)
    private String routineKey;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 32)
    private String color;

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, routineItemNo ASC")
    @Builder.Default
    private List<RoutineItem> items = new ArrayList<>();

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

    // 편의 메서드
    public void addItem(RoutineItem item) {
        items.add(item);
        item.setRoutine(this);
    }

    public void removeItem(RoutineItem item) {
        items.remove(item);
        item.setRoutine(null);
    }

    public void changeHeader(String routineKey, String name, String color) {
        if (routineKey != null) this.routineKey = routineKey;
        if (name != null) this.name = name;
        if (color != null) this.color = color;
    }

    public void replaceItems(java.util.List<RoutineItem> newItems) {
        this.items.clear();
        if (newItems != null) this.items.addAll(newItems);
    }
}