package org.zerock.mallapi.domain.admin.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.admin.member.dto.AdminMemberDTO;
import org.zerock.mallapi.domain.admin.member.dto.BanRequestDTO;
import org.zerock.mallapi.domain.admin.member.dto.BannedDTO;
import org.zerock.mallapi.domain.admin.member.service.AdminService;
import org.zerock.mallapi.domain.member.entity.MemberRole;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/admin/member")
public class AdminController {
      private final AdminService adminService;
      // 회원 목록 조회
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/list")
    public ResponseEntity<?> getAllMembers(
            @RequestParam String adminRole,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String searchType) {
        try {
            log.info("회원 목록 조회 요청: adminRole = {}, keyword = {}, searchType = {}", adminRole, keyword, searchType);
            
            MemberRole role = MemberRole.valueOf(adminRole.toUpperCase());
            List<AdminMemberDTO> members = adminService.getAllMembers(role, keyword, searchType);
            
            log.info("회원 목록 조회 완료: {} 건", members.size());
            return ResponseEntity.ok(members);
            
        } catch (IllegalArgumentException e) {
            log.error("잘못된 권한 값: {}", adminRole);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", "잘못된 권한 값입니다: " + adminRole,
                    "data", List.of()
                ));
        } catch (Exception e) {
            log.error("회원 목록 조회 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", "회원 목록 조회 중 오류가 발생했습니다.",
                    "data", List.of()
                ));
        }
    }
    
    // 회원 정지
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/ban")
    public ResponseEntity<?> banMember(@RequestBody BanRequestDTO banRequest) {
        try {
            log.info("회원 정지 요청: {}", banRequest);
            
            adminService.banMember(banRequest);
            
            return ResponseEntity.ok(Map.of("message", "회원이 정지되었습니다."));
            
        } catch (IllegalArgumentException e) {
            log.error("정지 요청 데이터 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("회원 정지 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("회원 정지 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "회원 정지 중 오류가 발생했습니다."));
        }
    }
      // 회원 정지 해제
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/unban")
    public ResponseEntity<?> unbanMember(@RequestParam Long memberNo, @RequestParam String adminRoleCode) {
        try {
            log.info("회원 정지 해제 요청: memberNo = {}, adminRoleCode = {}", memberNo, adminRoleCode);
            
            adminService.unbanMember(memberNo, adminRoleCode);
            
            return ResponseEntity.ok(Map.of("message", "회원 정지가 해제되었습니다."));
            
        } catch (RuntimeException e) {
            log.error("회원 정지 해제 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("회원 정지 해제 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "회원 정지 해제 중 오류가 발생했습니다."));
        }
    }
    
    // 계정 복구
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/restore")
    public ResponseEntity<?> restoreMember(@RequestParam Long memberNo) {
        try {
            log.info("계정 복구 요청: memberNo = {}", memberNo);
            
            adminService.restoreMember(memberNo);
            
            return ResponseEntity.ok(Map.of("message", "계정이 복구되었습니다."));
            
        } catch (RuntimeException e) {
            log.error("계정 복구 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("계정 복구 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "계정 복구 중 오류가 발생했습니다."));
        }
    }
      // 회원 권한 변경 (ADMIN만 가능)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/change-role")
    public ResponseEntity<?> changeMemberRole(@RequestParam Long memberNo, @RequestParam String newRole) {
        try {
            log.info("회원 권한 변경 요청: memberNo = {}, newRole = {}", memberNo, newRole);
            
            MemberRole role = MemberRole.valueOf(newRole.toUpperCase());
            adminService.changeMemberRole(memberNo, role);
            
            return ResponseEntity.ok(Map.of("message", "회원 권한이 변경되었습니다."));
            
        } catch (IllegalArgumentException e) {
            log.error("잘못된 권한 값: {}", newRole);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "잘못된 권한 값입니다: " + newRole));
        } catch (RuntimeException e) {
            log.error("회원 권한 변경 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("회원 권한 변경 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "회원 권한 변경 중 오류가 발생했습니다."));
        }    }
    
    // 회원 정지 내역 조회
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/ban-history/{memberNo}")
    public ResponseEntity<?> getBanHistory(@PathVariable Long memberNo) {
        try {
            log.info("정지 내역 조회 요청: memberNo = {}", memberNo);
            
            List<BannedDTO> banHistory = adminService.getBanHistory(memberNo);
            
            log.info("정지 내역 조회 완료: {} 건", banHistory.size());
            return ResponseEntity.ok(banHistory);
            
        } catch (Exception e) {
            log.error("정지 내역 조회 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "정지 내역 조회 중 오류가 발생했습니다."));
        }    }
    
    // 현재 정지된 회원 목록 조회
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/banned")
    public ResponseEntity<?> getCurrentlyBannedMembers() {
        try {
            log.info("현재 정지된 회원 목록 조회 요청");
            
            List<AdminMemberDTO> bannedMembers = adminService.getCurrentlyBannedMembers();
            
            log.info("현재 정지된 회원 수: {}", bannedMembers.size());
            return ResponseEntity.ok(bannedMembers);
            
        } catch (Exception e) {
            log.error("정지된 회원 목록 조회 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "정지된 회원 목록 조회 중 오류가 발생했습니다."));
        }    }
      // 관리자 조치 내역 조회 (roleCode로 검색)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/admin-actions/{adminRoleCode}")
    public ResponseEntity<?> getAdminActionsByRoleCode(@PathVariable String adminRoleCode) {
        try {
            log.info("관리자 조치 내역 조회 요청: adminRoleCode = {}", adminRoleCode);
            
            List<BannedDTO> actions = adminService.getAdminActionsByRoleCode(adminRoleCode);
            
            log.info("관리자 조치 내역: {} 건", actions.size());
            return ResponseEntity.ok(actions);
            
        } catch (Exception e) {
            log.error("관리자 조치 내역 조회 오류: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "관리자 조치 내역 조회 중 오류가 발생했습니다."));
        }
    }
}
