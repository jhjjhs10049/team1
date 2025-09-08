package org.zerock.mallapi.domain.schedule.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.mallapi.domain.schedule.entity.Routine;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    @EntityGraph(attributePaths = "items")
    List<Routine> findByMemberMemberNo(Long memberNo);
    Optional<Routine> findByRoutineNoAndMemberMemberNo(Long routineNo, Long memberNo);
    Optional<Routine> findByMemberMemberNoAndRoutineKey(Long memberNo, String routineKey);
    boolean existsByMemberMemberNoAndRoutineKey(Long memberNo, String routineKey);
    void deleteByRoutineNoAndMemberMemberNo(Long routineNo, Long memberNo);
}