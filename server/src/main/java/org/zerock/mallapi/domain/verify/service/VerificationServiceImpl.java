package org.zerock.mallapi.domain.verify.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
@Log4j2
public class VerificationServiceImpl implements VerificationService{

    private final RedisTemplate<String, String> redisTemplate;
    private final EmailService emailService;

    // 인증 완료 여부 저장 (간단히 Redis 활용)
    private final String VERIFIED_PREFIX = "verified:";


    // 인증번호 발송
    @Override
    public void sendCode(String email) {
        log.info("서비스 sendCode 입장!");
        String code = String.valueOf((int)(Math.random() * 900000) + 100000);

        //Redis 에 데이터를 저장하는 코드, 인증번호를 5분후 삭제 되도록 설정
        //redisTemplate : Redis와의 통신을 위한 Spring의 템플릿 클래스
        redisTemplate.opsForValue().set("verify:" + email, code, 5, TimeUnit.MINUTES);

        log.info("생성된 인증번호: {}", code);

        emailService.sendVerificationEmail(email, code);
    }

    @Override
    public boolean verifyCode(String email, String code) {
        String savedCode = redisTemplate.opsForValue().get("verify:" + email);

        if (savedCode != null && savedCode.equals(code)) {
            // 인증 성공 → "verified:email" 키로 표시 (//"verify:"는 Redis에 저장될 데이터의 목적을 나타내는 접두사(prefix)입니다.( 다른 유형의 데이터와 충돌하지 않고 관리하기 용이))
            redisTemplate.opsForValue().set(VERIFIED_PREFIX + email, "true", 30, TimeUnit.MINUTES);
            redisTemplate.delete("verify:" + email);
            return true;
        }
        return false;
    }

    @Override
    public boolean isVerified(String email) {
        return "true".equals(redisTemplate.opsForValue().get(VERIFIED_PREFIX + email));
    }
}
