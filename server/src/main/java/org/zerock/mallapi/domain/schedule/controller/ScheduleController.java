package org.zerock.mallapi.domain.schedule.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.schedule.dto.ScheduleDTO;
import org.zerock.mallapi.domain.schedule.service.ScheduleService;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;    @GetMapping("/day/{date}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<ScheduleDTO>> byDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                    @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDate(memberDTO.getMemberNo(), date));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<ScheduleDTO>> byDateRange(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                                         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
                                                         @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDateRange(memberDTO.getMemberNo(), from, to));
    }

    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<ScheduleDTO>> byStartTimeRange(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
                                                              @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
                                                              @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(scheduleService.getSchedulesByStartTimeRange(memberDTO.getMemberNo(), from, to));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ScheduleDTO> create(@RequestBody ScheduleDTO dto,
                                              @AuthenticationPrincipal MemberDTO memberDTO) {
        ScheduleDTO created = scheduleService.createSchedule(memberDTO.getMemberNo(), dto);
        return ResponseEntity.created(URI.create("/api/schedules/" + created.getScheduleNo())).body(created);
    }

    @PutMapping("/{scheduleNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ScheduleDTO> update(@PathVariable Long scheduleNo,
                                              @RequestBody ScheduleDTO dto,
                                              @AuthenticationPrincipal MemberDTO memberDTO) {
        dto.setScheduleNo(scheduleNo);
        return ResponseEntity.ok(scheduleService.updateSchedule(memberDTO.getMemberNo(), dto));
    }

    @PatchMapping("/{scheduleNo}/completed")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ScheduleDTO> setCompleted(@PathVariable Long scheduleNo,
                                                    @RequestParam boolean value,
                                                    @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(scheduleService.setCompleted(memberDTO.getMemberNo(), scheduleNo, value));
    }

    @DeleteMapping("/{scheduleNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long scheduleNo,
                                       @AuthenticationPrincipal MemberDTO memberDTO) {
        scheduleService.deleteSchedule(memberDTO.getMemberNo(), scheduleNo);
        return ResponseEntity.noContent().build();
    }
}

