package org.zerock.mallapi.domain.gym.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.zerock.mallapi.domain.gym.entity.Gym;

import org.springframework.data.domain.Pageable;

@Repository
public interface GymRepository extends JpaRepository<Gym, Long> {
    // 키워드 검색 (좌표 없이)
    @Query(value = """
        SELECT 
            g.gym_no,
            g.title,
            g.address,
            g.location_x,
            g.location_y,
            IFNULL(AVG(r.score), 0) AS rate
        FROM gym g
        LEFT JOIN gym_review r ON r.gym_no = g.gym_no
        WHERE (:q = '' OR g.title LIKE CONCAT('%', :q, '%') OR g.address LIKE CONCAT('%', :q, '%'))
        GROUP BY g.gym_no, g.title, g.address, g.location_x, g.location_y
        ORDER BY g.gym_no DESC
        """,
            countQuery = """
    SELECT COUNT(DISTINCT g.gym_no)
    FROM gym g
    LEFT JOIN gym_review r ON r.gym_no = g.gym_no
    WHERE (:q = '' OR g.title LIKE CONCAT('%', :q, '%') OR g.address LIKE CONCAT('%', :q, '%'))
    """,
            nativeQuery = true)
    Page<Object[]> searchByKeywordRaw(@Param("q") String q, Pageable pageable);

    // 좌표 + 반경(m) 검색 (거리 포함)
    @Query(value = """
        SELECT 
            g.gym_no,
            g.title,
            g.address,
            g.location_x,
            g.location_y,
            IFNULL(AVG(r.score), 0) AS rate,
            (6371000 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS(:lat - g.location_y) / 2), 2) +
                COS(RADIANS(:lat)) * COS(RADIANS(g.location_y)) *
                POWER(SIN(RADIANS(:lng - g.location_x) / 2), 2)
            ))) AS distance
        FROM gym g
        LEFT JOIN gym_review r ON r.gym_no = g.gym_no
        WHERE (:q = '' OR g.title LIKE CONCAT('%', :q, '%') OR g.address LIKE CONCAT('%', :q, '%'))
        GROUP BY g.gym_no, g.title, g.address, g.location_x, g.location_y
        HAVING distance <= :radius
        ORDER BY distance ASC
        """,
            countQuery = """
    SELECT COUNT(DISTINCT g.gym_no)
    FROM gym g
    LEFT JOIN gym_review r ON r.gym_no = g.gym_no
    WHERE (:q = '' OR g.title LIKE CONCAT('%', :q, '%') OR g.address LIKE CONCAT('%', :q, '%'))
    """,
    nativeQuery = true)
    Page<Object[]> searchByKeywordWithinRadiusRaw(
            @Param("q") String q,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") int radius,
            Pageable pageable
    );
}
