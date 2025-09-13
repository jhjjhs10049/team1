package org.zerock.mallapi.domain.verify.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * 이메일 전송 서비스
 * - 이메일 인증 코드 전송
 * - SMTP 설정을 통한 Gmail 이용
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 이메일 인증 코드 전송
     */
    public void sendVerificationEmail(String email, String code) {
        try {
            log.info("이메일 인증 코드 전송 시작 - 수신자: {}, 코드: {}", email, code);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("🔐 FitConnect 이메일 인증 코드");
            message.setText(
                    "안녕하세요! FitConnect입니다.\n\n" +
                    "회원가입을 위해 아래 인증 코드를 입력해주세요.\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "🔑 인증 코드: " + code + "\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "⚠️ 이 코드는 5분간 유효합니다.\n" +
                    "⚠️ 타인에게 코드를 공유하지 마세요.\n\n" +
                    "감사합니다!\n" +
                    "FitConnect 팀"
            );

            javaMailSender.send(message);
            log.info("✅ 이메일 인증 코드 전송 완료 - 수신자: {}", email);

        } catch (Exception e) {
            log.error("❌ 이메일 전송 실패 - 수신자: {}, 오류: {}", email, e.getMessage(), e);
            throw new RuntimeException("이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 회원가입 완료 환영 이메일 전송 (선택사항)
     */
    public void sendWelcomeEmail(String email, String nickname) {
        try {
            log.info("환영 이메일 전송 시작 - 수신자: {}, 닉네임: {}", email, nickname);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("🎉 FitConnect 회원가입을 축하합니다!");
            message.setText(
                    nickname + "님, FitConnect에 오신 것을 환영합니다!\n\n" +
                    "회원가입이 성공적으로 완료되었습니다.\n" +
                    "이제 다양한 피트니스 서비스를 이용하실 수 있습니다.\n\n" +
                    "🏃‍♂️ 헬스장 검색 및 리뷰\n" +
                    "🏋️‍♀️ 트레이너 매칭\n" +
                    "💬 실시간 채팅 상담\n" +
                    "📊 운동 기록 관리\n\n" +
                    "건강한 피트니스 라이프를 시작해보세요!\n\n" +
                    "감사합니다!\n" +
                    "FitConnect 팀"
            );

            javaMailSender.send(message);
            log.info("✅ 환영 이메일 전송 완료 - 수신자: {}", email);        } catch (Exception e) {
            log.error("❌ 환영 이메일 전송 실패 - 수신자: {}, 오류: {}", email, e.getMessage(), e);
            // 환영 이메일은 실패해도 회원가입 프로세스에는 영향을 주지 않음
        }
    }

    /**
     * 비밀번호 변경 완료 알림 이메일 전송
     */
    public void sendPasswordResetConfirmEmail(String email, String nickname) {
        try {
            log.info("비밀번호 변경 완료 이메일 전송 시작 - 수신자: {}, 닉네임: {}", email, nickname);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("🔐 FitConnect 비밀번호 변경 완료");
            message.setText(
                    nickname + "님, 비밀번호가 성공적으로 변경되었습니다.\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                    "🔐 비밀번호 변경 완료\n" +
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                    "변경 일시: " + java.time.LocalDateTime.now().format(
                        java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    ) + "\n\n" +
                    "⚠️ 만약 본인이 변경하지 않았다면 즉시 고객센터로 연락해주세요.\n" +
                    "⚠️ 계정 보안을 위해 정기적으로 비밀번호를 변경해주세요.\n\n" +
                    "📞 고객센터: 1588-xxxx\n\n" +
                    "감사합니다!\n" +
                    "FitConnect 팀"
            );

            javaMailSender.send(message);
            log.info("✅ 비밀번호 변경 완료 이메일 전송 완료 - 수신자: {}", email);

        } catch (Exception e) {
            log.error("❌ 비밀번호 변경 완료 이메일 전송 실패 - 수신자: {}, 오류: {}", email, e.getMessage(), e);
            // 비밀번호 변경 완료 이메일은 실패해도 주요 기능에는 영향을 주지 않음
        }
    }
}
