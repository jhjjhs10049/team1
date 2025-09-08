package org.zerock.mallapi.domain.schedule.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.schedule.dto.RoutineDTO;
import org.zerock.mallapi.domain.schedule.service.RoutineService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/routines")
@RequiredArgsConstructor
public class RoutineController {

    private final RoutineService routineService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<RoutineDTO>> list(@AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(routineService.getRoutines(memberDTO.getMemberNo()));
    }

    @GetMapping("/{routineNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<RoutineDTO> get(@PathVariable Long routineNo,
                                          @AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(routineService.getRoutine(memberDTO.getMemberNo(), routineNo));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<RoutineDTO> create(@RequestBody RoutineDTO dto,
                                             @AuthenticationPrincipal MemberDTO memberDTO) {
        RoutineDTO created = routineService.createRoutine(memberDTO.getMemberNo(), dto);
        return ResponseEntity.created(URI.create("/api/routines/" + created.getRoutineNo())).body(created);
    }

    @PutMapping("/{routineNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<RoutineDTO> update(@PathVariable Long routineNo,
                                             @RequestBody RoutineDTO dto,
                                             @AuthenticationPrincipal MemberDTO memberDTO) {
        dto.setRoutineNo(routineNo);
        return ResponseEntity.ok(routineService.updateRoutine(memberDTO.getMemberNo(), dto));
    }

    @DeleteMapping("/{routineNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long routineNo,
                                       @AuthenticationPrincipal MemberDTO memberDTO) {
        routineService.deleteRoutine(memberDTO.getMemberNo(), routineNo);
        return ResponseEntity.noContent().build();
    }
}
