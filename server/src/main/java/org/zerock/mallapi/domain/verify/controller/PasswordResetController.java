package org.zerock.mallapi.domain.verify.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.verify.service.PasswordResetService;

/**
 * 비밀번호 재설정 컨트롤러
 * - 비밀번호 찾기 기능을 위한 이메일 인증
 * - 비밀번호 재설정 기능
 */
@RestController
@RequestMapping("/api/password-reset")
@RequiredArgsConstructor
@Log4j2
public class PasswordResetController {

    private final PasswordResetService passwordResetService;
    private final MemberRepository memberRepository;

    /**
     * 비밀번호 재설정을 위한 인증번호 발송
     */
    @PostMapping("/send-code")
    public ResponseEntity<String> sendResetCode(@RequestParam String email) {
        try {
            log.info("비밀번호 재설정 인증코드 발송 요청 - 이메일: {}", email);
            
            // 이메일 형식 검증
            if (!isValidEmail(email)) {
                return ResponseEntity.badRequest().body("올바른 이메일 형식이 아닙니다.");
            }
            
            // 이메일 존재 확인 (가입된 회원이어야 함)
            if (!memberRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("가입되지 않은 이메일입니다.");
            }
            
            passwordResetService.sendResetCode(email);
            return ResponseEntity.ok("비밀번호 재설정 인증번호를 발송했습니다. 이메일을 확인해주세요.");
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 인증 코드 발송 오류: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("인증번호 발송에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 비밀번호 재설정을 위한 인증번호 검증
     */
    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyResetCode(@RequestParam String email, @RequestParam String code) {
        try {
            log.info("비밀번호 재설정 인증 코드 검증 요청 - 이메일: {}, 코드: {}", email, code);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
            }
            
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("인증번호를 입력해주세요.");
            }
            
            boolean result = passwordResetService.verifyResetCode(email, code);
            if (result) {
                log.info("✅ 비밀번호 재설정 인증 성공 - 이메일: {}", email);
                return ResponseEntity.ok("인증이 완료되었습니다!");
            } else {
                log.warn("❌ 비밀번호 재설정 인증 실패 - 이메일: {}, 코드: {}", email, code);
                return ResponseEntity.badRequest().body("인증번호가 올바르지 않거나 만료되었습니다.");
            }
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 인증 코드 검증 오류: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("인증 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 비밀번호 재설정 (인증 완료 후)
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String email, 
            @RequestParam String code,
            @RequestParam String newPassword) {
        try {
            log.info("비밀번호 재설정 요청 - 이메일: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
            }
            
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("인증번호를 입력해주세요.");
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("새 비밀번호를 입력해주세요.");
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("비밀번호는 6자리 이상 입력해주세요.");
            }
            
            boolean result = passwordResetService.resetPassword(email, code, newPassword);
            if (result) {
                log.info("✅ 비밀번호 재설정 성공 - 이메일: {}", email);
                return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다!");
            } else {
                log.warn("❌ 비밀번호 재설정 실패 - 이메일: {}, 코드: {}", email, code);
                return ResponseEntity.badRequest().body("인증번호가 올바르지 않거나 만료되었습니다.");
            }
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 오류: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("비밀번호 재설정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 이메일 형식 검증
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}
