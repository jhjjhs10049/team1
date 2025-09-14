package org.zerock.mallapi.domain.board.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;
import org.zerock.mallapi.domain.member.entity.Member;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "board")
@DynamicUpdate
public class Board {

    public enum PostType {
        NORMAL, ANN, AD
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_no")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "writer_id", nullable = false)
    private Member writer;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "view_count", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private Integer viewCount = 0;    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, columnDefinition = "varchar(10) default 'NORMAL'")
    @Builder.Default
    private PostType postType = PostType.NORMAL;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // 위치 정보 필드 추가
    @Column(name = "location_lat")
    private Double locationLat;

    @Column(name = "location_lng")
    private Double locationLng;

    @Column(name = "location_address", length = 500)
    private String locationAddress;

    @PrePersist
    void onPersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (viewCount == null) {
            viewCount = 0;
        }
        if (postType == null) {
            postType = PostType.NORMAL;
        }
        if (isDeleted == null) {
            isDeleted = false;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 논리삭제 메서드
    public void delete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 삭제 복구 메서드
    public void restore() {
        this.isDeleted = false;
        this.deletedAt = null;
        this.updatedAt = LocalDateTime.now();
    }
}