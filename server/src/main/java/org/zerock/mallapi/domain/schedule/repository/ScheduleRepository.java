package org.zerock.mallapi.domain.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.mallapi.domain.schedule.entity.Schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByMemberMemberNoAndDateBetween(Long memberNo, LocalDate from, LocalDate to);
    List<Schedule> findByMemberMemberNoAndDate(Long memberNo, LocalDate date);
    List<Schedule> findByMemberMemberNoAndStartTimeBetween(Long memberNo, LocalDateTime from, LocalDateTime to);
    Optional<Schedule> findByScheduleNoAndMemberMemberNo(Long scheduleNo, Long memberNo);
    void deleteByScheduleNoAndMemberMemberNo(Long scheduleNo, Long memberNo);
}