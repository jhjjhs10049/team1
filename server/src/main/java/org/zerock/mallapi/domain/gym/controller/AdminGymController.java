package org.zerock.mallapi.domain.gym.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.gym.dto.GymDetailDTO;
import org.zerock.mallapi.domain.gym.dto.GymUpsertDTO;
import org.zerock.mallapi.domain.gym.service.GymService;
import org.zerock.mallapi.domain.member.dto.MemberDTO;

@RestController
@RequestMapping("/api/admin/gyms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminGymController {
    private final GymService gymService;

    @PostMapping
    public ResponseEntity<GymDetailDTO> create(@Valid @RequestBody GymUpsertDTO dto,
                                               @AuthenticationPrincipal MemberDTO loginUser) { // ⭐ 다시 추가
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gymService.createGym(dto, loginUser.getMemberNo())); // ⭐ 로그인 사용자 정보를 서비스에 전달
    }

    @PutMapping("/{gymNo}")
    public ResponseEntity<GymDetailDTO> update(@PathVariable Long gymNo,
                                               @Valid @RequestBody GymUpsertDTO dto,
                                               @AuthenticationPrincipal MemberDTO loginUser) { // ⭐ 다시 추가
        return ResponseEntity.ok(gymService.updateGym(gymNo, dto, loginUser.getMemberNo())); // ⭐ 로그인 사용자 정보를 서비스에 전달
    }

    @DeleteMapping("/{gymNo}")
    public ResponseEntity<Void> delete(@PathVariable Long gymNo,
                                       @AuthenticationPrincipal MemberDTO loginUser) {
        gymService.deleteGym(gymNo, loginUser.getMemberNo());
        return ResponseEntity.noContent().build();
    }
}