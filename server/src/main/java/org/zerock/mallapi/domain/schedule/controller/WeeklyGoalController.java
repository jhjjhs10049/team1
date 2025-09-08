package org.zerock.mallapi.domain.schedule.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.schedule.dto.WeeklyGoalDTO;
import org.zerock.mallapi.domain.schedule.service.WeeklyGoalService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/weekly-goal")
@RequiredArgsConstructor
public class WeeklyGoalController {

    private final WeeklyGoalService weeklyGoalService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<WeeklyGoalDTO> get(@RequestParam("weekStart") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
                                             @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(weeklyGoalService.get(memberDTO.getMemberNo(), weekStart));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<WeeklyGoalDTO> upsert(@RequestBody WeeklyGoalDTO dto,
                                                @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(weeklyGoalService.upsert(memberDTO.getMemberNo(), dto));
    }
}