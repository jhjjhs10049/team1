package org.zerock.mallapi.global.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.StringRedisSerializer;



/********************************************************************************************************
 * 먼저 이메일을 보내기 위해서는 SMTP 서비스를 이용해야한다.
 * SMTP란 인터넷을 통해 이메일을 주고 받을 때 사용하는 기능이다.
 * 구글의 SMTP 서비스를 이용 해서 구현 하였다.
 * 이메일 인증에서는 인증번호를 저장하고 검증하는 과정이 필수이다.
 * 이를 위해 관계형 데이터베이스 대신 레디스(Redis)를 사용 하였다.
 * 레디스는 인메모리 데이터베이스로, 인증번호와 같은 단기 데이터를 저장하고 빠르게 조회하는 데 적합합니다.
 * 왜 레디스를 사용했는가?
 * 속도: 인증번호 검증은 빈번히 발생하며 빠른 처리가 요구됩니다. 레디스는 관계형 데이터베이스보다 빠르게 처리할 수 있습니다.
 * TTL(Time-To-Live): 레디스를 사용하면 인증번호의 유효기간을 설정할 수 있어, 만료된 데이터를 자동으로 제거할 수 있습니다.
 *********************************************************************************************************/


/*********************************************************************************
 * 인증 흐름 ?
 * 회원가입 폼(RegisterForm) → 이메일 + 비밀번호 입력 → 서버에 저장 & 인증번호 발송
 * 인증번호 입력 폼(VerifyForm) → 이메일 + 인증번호 입력 → 서버 검증
 * 회원가입은 이미 진행된 상태고, 인증은 "계정 활성화(enabled=true)" 단계
 * 인증 성공 후 다시 회원가입 폼으로 가는 게 아니라 → 로그인 폼(LoginForm) 으로 가는 게 일반적
 *********************************************************************************/




@Configuration
@EnableRedisRepositories
public class RedisConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}


