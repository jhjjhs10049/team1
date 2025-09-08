package org.zerock.mallapi.domain.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.mallapi.domain.schedule.entity.WeeklyGoal;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyGoalRepository extends JpaRepository<WeeklyGoal, Long> {
    Optional<WeeklyGoal> findByMemberMemberNoAndWeekStartSun(Long memberNo, LocalDate weekStartSun);
    List<WeeklyGoal> findByMemberMemberNoAndWeekStartSunBetween(Long memberNo, LocalDate from, LocalDate to);
}