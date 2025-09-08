package org.zerock.mallapi.domain.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.mallapi.domain.schedule.entity.TodayStat;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TodayStatRepository extends JpaRepository<TodayStat, Long> {
    Optional<TodayStat> findByMemberMemberNoAndStatDate(Long memberNo, LocalDate statDate);
    List<TodayStat> findByMemberMemberNoAndStatDateBetween(Long memberNo, LocalDate from, LocalDate to);
}