package org.zerock.mallapi.domain.verify.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;

/**
 * 비밀번호 재설정 서비스
 * - 기존 VerificationService를 활용하여 인증 코드 관리
 * - 비밀번호 변경 기능 추가
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class PasswordResetService {

    private final VerificationService verificationService;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    /**
     * 비밀번호 재설정을 위한 인증번호 발송
     */
    public void sendResetCode(String email) {
        log.info("비밀번호 재설정 인증번호 발송 시작 - 이메일: {}", email);
        
        // 회원 존재 확인
        if (!memberRepository.existsByEmail(email)) {
            throw new RuntimeException("가입되지 않은 이메일입니다.");
        }
        
        // 소셜 로그인 회원 확인
        Member member = memberRepository.findByEmailAndActiveStatus(email)
            .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));
            
        if (member.getSocial() != null && member.getSocial()) {
            throw new RuntimeException("소셜 로그인 회원은 비밀번호 재설정을 할 수 없습니다.");
        }
        
        // 기존 VerificationService 활용
        verificationService.sendCode(email);
        
        log.info("✅ 비밀번호 재설정 인증번호 발송 완료 - 이메일: {}", email);
    }

    /**
     * 비밀번호 재설정을 위한 인증번호 검증
     */
    public boolean verifyResetCode(String email, String code) {
        log.info("비밀번호 재설정 인증번호 검증 시작 - 이메일: {}", email);
        
        // 기존 VerificationService 활용
        boolean result = verificationService.verifyCode(email, code);
        
        log.info("비밀번호 재설정 인증번호 검증 결과: {}", result);
        return result;
    }    /**
     * 비밀번호 재설정 (인증 완료 상태 확인 후 변경)
     */
    @Transactional
    public boolean resetPassword(String email, String code, String newPassword) {
        log.info("비밀번호 재설정 시작 - 이메일: {}", email);
        
        try {
            // 인증 완료 상태 확인 (인증번호는 이미 검증 완료되어 삭제됨)
            if (!verificationService.isVerified(email)) {
                log.warn("비밀번호 재설정 실패 - 이메일 인증이 완료되지 않음: {}", email);
                return false;
            }
            
            // 회원 조회
            Member member = memberRepository.findByEmailAndActiveStatus(email)
                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));
            
            // 소셜 로그인 회원 체크
            if (member.getSocial() != null && member.getSocial()) {
                throw new RuntimeException("소셜 로그인 회원은 비밀번호 재설정을 할 수 없습니다.");
            }
            
            // 새 비밀번호 암호화
            String encodedPassword = passwordEncoder.encode(newPassword);
            
            // 비밀번호 업데이트
            member.changePw(encodedPassword);
            memberRepository.save(member);
            
            // 사용된 인증번호 삭제
            verificationService.deleteVerificationCode(email);
            
            // 비밀번호 변경 완료 이메일 발송 (선택사항)
            try {
                emailService.sendPasswordResetConfirmEmail(email, member.getNickname());
            } catch (Exception e) {
                log.warn("비밀번호 변경 완료 이메일 발송 실패 (서비스 정상): {}", e.getMessage());
            }
            
            log.info("✅ 비밀번호 재설정 완료 - 이메일: {}", email);
            return true;
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 오류: {}", e.getMessage(), e);
            throw new RuntimeException("비밀번호 재설정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
