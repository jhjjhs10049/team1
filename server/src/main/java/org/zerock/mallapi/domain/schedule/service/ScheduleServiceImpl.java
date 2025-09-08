package org.zerock.mallapi.domain.schedule.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.schedule.dto.ScheduleDTO;
import org.zerock.mallapi.domain.schedule.entity.Schedule;
import org.zerock.mallapi.domain.schedule.repository.ScheduleRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleServiceImpl implements ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO> getSchedulesByDate(Long memberNo, java.time.LocalDate date) {
        return scheduleRepository.findByMemberMemberNoAndDate(memberNo, date)
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO> getSchedulesByDateRange(Long memberNo, java.time.LocalDate from, java.time.LocalDate to) {
        return scheduleRepository.findByMemberMemberNoAndDateBetween(memberNo, from, to)
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO> getSchedulesByStartTimeRange(Long memberNo, java.time.LocalDateTime from, java.time.LocalDateTime to) {
        return scheduleRepository.findByMemberMemberNoAndStartTimeBetween(memberNo, from, to)
                .stream().map(this::toDTO).toList();
    }

    @Override
    public ScheduleDTO createSchedule(Long memberNo, ScheduleDTO dto) {
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));

        Schedule entity = Schedule.builder()
                .member(member)
                .date(dto.getDate())
                .title(dto.getTitle())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .gym(dto.getGym())
                .trainerName(dto.getTrainerName())
                .color(dto.getColor())
                .completed(false)
                .build();

        Schedule saved = scheduleRepository.save(entity);
        return toDTO(saved);
    }

    @Override
    public ScheduleDTO updateSchedule(Long memberNo, ScheduleDTO dto) {
        Schedule schedule = scheduleRepository
                .findByScheduleNoAndMemberMemberNo(dto.getScheduleNo(), memberNo)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));

        schedule = Schedule.builder()
                .scheduleNo(schedule.getScheduleNo())
                .member(schedule.getMember())
                .date(dto.getDate() != null ? dto.getDate() : schedule.getDate())
                .title(dto.getTitle() != null ? dto.getTitle() : schedule.getTitle())
                .startTime(dto.getStartTime() != null ? dto.getStartTime() : schedule.getStartTime())
                .endTime(dto.getEndTime() != null ? dto.getEndTime() : schedule.getEndTime())
                .gym(dto.getGym() != null ? dto.getGym() : schedule.getGym())
                .trainerName(dto.getTrainerName() != null ? dto.getTrainerName() : schedule.getTrainerName())
                .color(dto.getColor() != null ? dto.getColor() : schedule.getColor())
                .completed(dto.isCompleted())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();

        Schedule saved = scheduleRepository.save(schedule);
        return toDTO(saved);
    }

    @Override
    public void deleteSchedule(Long memberNo, Long scheduleNo) {
        Schedule schedule = scheduleRepository
                .findByScheduleNoAndMemberMemberNo(scheduleNo, memberNo)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
        scheduleRepository.delete(schedule);
    }

    @Override
    public ScheduleDTO setCompleted(Long memberNo, Long scheduleNo, boolean completed) {
        Schedule schedule = scheduleRepository
                .findByScheduleNoAndMemberMemberNo(scheduleNo, memberNo)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없습니다."));
        Schedule patched = Schedule.builder()
                .scheduleNo(schedule.getScheduleNo())
                .member(schedule.getMember())
                .date(schedule.getDate())
                .title(schedule.getTitle())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .gym(schedule.getGym())
                .trainerName(schedule.getTrainerName())
                .color(schedule.getColor())
                .completed(completed)
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();

        return toDTO(scheduleRepository.save(patched));
    }

    private ScheduleDTO toDTO(Schedule s) {
        return ScheduleDTO.builder()
                .scheduleNo(s.getScheduleNo())
                .memberNo(s.getMember().getMemberNo())
                .date(s.getDate())
                .title(s.getTitle())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .gym(s.getGym())
                .trainerName(s.getTrainerName())
                .color(s.getColor())
                .completed(s.isCompleted())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}