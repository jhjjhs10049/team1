package org.zerock.mallapi.domain.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.mallapi.domain.schedule.entity.RoutineItem;

import java.util.List;

@Repository
public interface RoutineItemRepository extends JpaRepository<RoutineItem, Long> {
    List<RoutineItem> findByRoutineRoutineNoOrderBySortOrderAsc(Long routineNo);
    void deleteByRoutineRoutineNo(Long routineNo);
}