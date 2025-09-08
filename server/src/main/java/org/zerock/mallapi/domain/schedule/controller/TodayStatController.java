package org.zerock.mallapi.domain.schedule.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.schedule.dto.TodayStatDTO;
import org.zerock.mallapi.domain.schedule.service.TodayStatService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/stats/today")
@RequiredArgsConstructor
public class TodayStatController {

    private final TodayStatService todayStatService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<TodayStatDTO> get(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                            @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(todayStatService.get(memberDTO.getMemberNo(), date));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<TodayStatDTO> upsert(@RequestBody TodayStatDTO dto,
                                               @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(todayStatService.upsert(memberDTO.getMemberNo(), dto));
    }
}

