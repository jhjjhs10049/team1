package org.zerock.mallapi.domain.verify.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.verify.service.VerificationService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Log4j2
public class AuthController {

    private final VerificationService verificationService;
    private final MemberRepository memberRepository;

    // 1. 인증번호 발송
    @PostMapping("/send-code")
    public ResponseEntity<String> sendCode(@RequestParam String email) {
        try {
            log.info("인증 코드 발송 요청 - 이메일: {}", email);
            
            // 이메일 형식 검증
            if (!isValidEmail(email)) {
                return ResponseEntity.badRequest().body("올바른 이메일 형식이 아닙니다.");
            }
            
            // 이메일 중복 확인
            if (memberRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("이미 가입된 이메일입니다.");
            }
            
            verificationService.sendCode(email);
            return ResponseEntity.ok("인증번호를 발송했습니다. 이메일을 확인해주세요.");
            
        } catch (Exception e) {
            log.error("인증 코드 발송 오류: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("인증번호 발송에 실패했습니다: " + e.getMessage());
        }
    }

    // 2. 인증번호 검증
    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestParam String email, @RequestParam String code) {
        try {
            log.info("인증 코드 검증 요청 - 이메일: {}, 코드: {}", email, code);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("이메일을 입력해주세요.");
            }
            
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("인증번호를 입력해주세요.");
            }
            
            boolean result = verificationService.verifyCode(email, code);
            if (result) {
                log.info("✅ 이메일 인증 성공 - 이메일: {}", email);
                return ResponseEntity.ok("이메일 인증이 완료되었습니다!");
            } else {
                log.warn("❌ 이메일 인증 실패 - 이메일: {}, 코드: {}", email, code);
                return ResponseEntity.badRequest().body("인증번호가 올바르지 않거나 만료되었습니다.");
            }
            
        } catch (Exception e) {
            log.error("인증 코드 검증 오류: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("인증 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 3. 이메일 인증 상태 확인
    @GetMapping("/verify-status")
    public ResponseEntity<?> checkVerificationStatus(@RequestParam String email) {
        try {
            boolean isVerified = verificationService.isVerified(email);
            return ResponseEntity.ok(java.util.Map.of(
                "email", email,
                "verified", isVerified,
                "message", isVerified ? "인증 완료" : "인증 필요"
            ));
        } catch (Exception e) {
            log.error("인증 상태 확인 오류: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("인증 상태 확인 중 오류가 발생했습니다.");
        }
    }

    /**
     * 이메일 형식 검증
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }
}
