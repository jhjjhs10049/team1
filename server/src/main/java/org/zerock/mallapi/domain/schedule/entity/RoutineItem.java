package org.zerock.mallapi.domain.schedule.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(
        name = "routine_item",
        indexes = {
                @Index(name = "ix_routine_item", columnList = "routine_no,sort_order")
        }
)
@Getter
@NoArgsConstructor(access = PROTECTED)
@AllArgsConstructor(access = PROTECTED)
@Builder
public class RoutineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "routine_item_no")
    private Long routineItemNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "routine_no", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @Setter(AccessLevel.PACKAGE)
    private Routine routine;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(nullable = false, length = 200)
    private String content;
}