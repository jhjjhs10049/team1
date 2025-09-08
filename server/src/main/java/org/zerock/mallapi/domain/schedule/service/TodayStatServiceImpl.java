package org.zerock.mallapi.domain.schedule.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.schedule.dto.TodayStatDTO;
import org.zerock.mallapi.domain.schedule.entity.TodayStat;
import org.zerock.mallapi.domain.schedule.repository.TodayStatRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class TodayStatServiceImpl implements TodayStatService {

    private final TodayStatRepository todayStatRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public TodayStatDTO get(Long memberNo, LocalDate date) {
        TodayStat stat = todayStatRepository.findByMemberMemberNoAndStatDate(memberNo, date)
                .orElse(null);
        return stat == null ? null : toDTO(stat);
    }

    @Override
    public TodayStatDTO upsert(Long memberNo, TodayStatDTO dto) {
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));

        TodayStat stat = todayStatRepository.findByMemberMemberNoAndStatDate(memberNo, dto.getStatDate())
                .orElse(TodayStat.builder().member(member).statDate(dto.getStatDate()).build());

        stat = TodayStat.builder()
                .todayStatNo(stat.getTodayStatNo())
                .member(stat.getMember())
                .statDate(stat.getStatDate())
                .calories(dto.getCalories())
                .minutes(dto.getMinutes())
                .weightKg(dto.getWeightKg())
                .waterMl(dto.getWaterMl())
                .createdAt(stat.getCreatedAt())
                .updatedAt(stat.getUpdatedAt())
                .build();

        return toDTO(todayStatRepository.save(stat));
    }

    private TodayStatDTO toDTO(TodayStat s) {
        return TodayStatDTO.builder()
                .todayStatNo(s.getTodayStatNo())
                .memberNo(s.getMember().getMemberNo())
                .statDate(s.getStatDate())
                .calories(s.getCalories())
                .minutes(s.getMinutes())
                .weightKg(s.getWeightKg())
                .waterMl(s.getWaterMl())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}