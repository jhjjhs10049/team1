package org.zerock.mallapi.domain.schedule.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.schedule.dto.WeeklyGoalDTO;
import org.zerock.mallapi.domain.schedule.entity.WeeklyGoal;
import org.zerock.mallapi.domain.schedule.repository.WeeklyGoalRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class WeeklyGoalServiceImpl implements WeeklyGoalService {

    private final WeeklyGoalRepository weeklyGoalRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public WeeklyGoalDTO get(Long memberNo, LocalDate weekStartSun) {
        WeeklyGoal goal = weeklyGoalRepository.findByMemberMemberNoAndWeekStartSun(memberNo, weekStartSun)
                .orElse(null);
        return goal == null ? null : toDTO(goal);
    }

    @Override
    public WeeklyGoalDTO upsert(Long memberNo, WeeklyGoalDTO dto) {
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));

        WeeklyGoal goal = weeklyGoalRepository.findByMemberMemberNoAndWeekStartSun(memberNo, dto.getWeekStartSun())
                .orElse(WeeklyGoal.builder().member(member).weekStartSun(dto.getWeekStartSun()).build());

        goal = WeeklyGoal.builder()
                .weeklyGoalNo(goal.getWeeklyGoalNo())
                .member(goal.getMember())
                .weekStartSun(goal.getWeekStartSun())
                .targetPercent(dto.getTargetPercent())
                .donePercent(dto.getDonePercent())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();

        return toDTO(weeklyGoalRepository.save(goal));
    }

    private WeeklyGoalDTO toDTO(WeeklyGoal g) {
        return WeeklyGoalDTO.builder()
                .weeklyGoalNo(g.getWeeklyGoalNo())
                .memberNo(g.getMember().getMemberNo())
                .weekStartSun(g.getWeekStartSun())
                .targetPercent(g.getTargetPercent())
                .donePercent(g.getDonePercent())
                .createdAt(g.getCreatedAt())
                .updatedAt(g.getUpdatedAt())
                .build();
    }
}