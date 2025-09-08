package org.zerock.mallapi.domain.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.dto.MemberJoinDTO;
import org.zerock.mallapi.domain.member.dto.MemberModifyDTO;
import org.zerock.mallapi.domain.member.service.MemberService;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;

    // 회원가입
    @PostMapping("/join")
    public ResponseEntity<?> join(@RequestBody MemberJoinDTO memberJoinDTO) {
        try {
            log.info("Join request: " + memberJoinDTO);

            memberService.join(memberJoinDTO);
            
            return ResponseEntity.ok(Map.of("message", "회원가입이 완료되었습니다."));

        } catch (RuntimeException e) {
            log.error("Join error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Join error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "회원가입 중 오류가 발생했습니다."));
        }
    }    

    // 이메일 중복확인
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        try {
            boolean exists = memberService.isEmailDuplicate(email);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            log.error("Email check error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "이메일 중복 확인 중 오류가 발생했습니다."));
        }
    }

    // 닉네임 중복확인
    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname) {
        try {
            boolean exists = memberService.isNicknameDuplicate(nickname);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            log.error("Nickname check error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "닉네임 중복 확인 중 오류가 발생했습니다."));
        }
    }    // 마이페이지 - 회원 정보 조회
    @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
    @GetMapping("/mypage")
    public ResponseEntity<?> getMyPage(@RequestParam String email) {
        try {
            MemberDTO memberDTO = memberService.getMemberByEmail(email);
            return ResponseEntity.ok(memberDTO);
        } catch (Exception e) {
            log.error("MyPage get error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "회원 정보 조회 중 오류가 발생했습니다."));
        }    }    
    // 마이페이지 - 회원 정보 수정
    @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
    @PutMapping("/mypage")
    public ResponseEntity<?> updateMyPage(@RequestBody MemberModifyDTO memberModifyDTO) {
        try {
            log.info("MyPage update request: " + memberModifyDTO);
            
            memberService.modifyMember(memberModifyDTO);
            
            return ResponseEntity.ok(Map.of("message", "회원 정보가 수정되었습니다."));

        } catch (RuntimeException e) {
            log.error("MyPage update error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("MyPage update error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "회원 정보 수정 중 오류가 발생했습니다."));
        }    }

    // 비밀번호 확인
    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            log.info("Password verification request: " + email);
            
            boolean isValid = memberService.verifyPassword(email, password);
            
            return ResponseEntity.ok(Map.of("valid", isValid));

        } catch (RuntimeException e) {
            log.error("Password verification error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Password verification error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "비밀번호 확인 중 오류가 발생했습니다."));
        }
    }

    // 회원탈퇴
    @DeleteMapping("/withdraw")
    public ResponseEntity<?> withdrawMember(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            log.info("Member withdraw request: " + email);
            // 비밀번호 검증
            boolean isValid = memberService.verifyPassword(email, password);
            if (!isValid) {
                throw new RuntimeException("비밀번호가 일치하지 않습니다.");
            }
            memberService.withdrawMember(email);
            return ResponseEntity.ok(Map.of("message", "회원탈퇴가 완료되었습니다."));
        } catch (RuntimeException e) {
            log.error("Member withdraw error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Member withdraw error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "회원탈퇴 중 오류가 발생했습니다."));
        }
    }      // 기존 MANAGER들에게 roleCode 부여 (관리자 전용)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/assign-manager-codes")
    public ResponseEntity<?> assignManagerCodes() {
        try {
            log.info("기존 MANAGER들에게 roleCode 부여 요청");
            
            memberService.assignRoleCodeToExistingManagers();
            
            return ResponseEntity.ok(Map.of("message", "기존 MANAGER들에게 roleCode 부여가 완료되었습니다."));

        } catch (Exception e) {
            log.error("Manager code assignment error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "roleCode 부여 중 오류가 발생했습니다: " + e.getMessage()));
        }    }
    
    // 특정 회원을 MANAGER로 승격 (관리자 전용)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/promote-manager")
    public ResponseEntity<?> promoteToManager(@RequestParam String email) {
        try {
            log.info("MANAGER 승격 요청: " + email);
            
            memberService.promoteToManager(email);
            
            return ResponseEntity.ok(Map.of("message", email + " 회원이 MANAGER로 승격되었습니다."));

        } catch (RuntimeException e) {
            log.error("Manager promotion error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Manager promotion error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "MANAGER 승격 중 오류가 발생했습니다."));
        }    }
    
    // 특정 회원의 MANAGER 권한 해제 (관리자 전용)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/demote-manager")
    public ResponseEntity<?> demoteFromManager(@RequestParam String email) {
        try {
            log.info("MANAGER 권한 해제 요청: " + email);
            
            memberService.demoteFromManager(email);
            
            return ResponseEntity.ok(Map.of("message", email + " 회원의 MANAGER 권한이 해제되었습니다."));

        } catch (RuntimeException e) {
            log.error("Manager demotion error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Manager demotion error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("message", "MANAGER 권한 해제 중 오류가 발생했습니다."));
        }
    }
}
