package org.zerock.mallapi.global.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Log4j2
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final WebSocketChannelInterceptor webSocketChannelInterceptor;    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 메시지 브로커 설정
        config.enableSimpleBroker("/topic", "/queue"); // 클라이언트가 구독할 주제
        config.setApplicationDestinationPrefixes("/app"); // 클라이언트에서 메시지를 보낼 때 사용할 prefix
        log.info("Message broker configured: /topic, /queue subscriptions enabled, /app prefix");
    }
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // 웹소켓 메시지 처리 시 인증 정보 설정을 위한 인터셉터 추가
        registration.interceptors(webSocketChannelInterceptor);
        log.info("WebSocket channel interceptor registered for authentication");
    }@Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 엔드포인트 등록
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // CORS 설정
                .addInterceptors(jwtHandshakeInterceptor); // JWT 인터셉터 추가
        
        log.info("WebSocket endpoint registered: /ws with JWT interceptor");
    }
}
