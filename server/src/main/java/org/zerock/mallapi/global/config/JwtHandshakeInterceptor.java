package org.zerock.mallapi.global.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.zerock.mallapi.global.util.JWTUtil;

import java.util.Map;

@Component
@Log4j2
public class JwtHandshakeInterceptor implements HandshakeInterceptor {    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                 WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        // 🔒 운영 환경에서는 로그 최소화
        log.debug("WebSocket handshake started: {}", request.getURI().getPath());
          try {
            String token = null;
            
            // 1. Authorization 헤더에서 JWT 토큰 추출 시도
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
                log.debug("JWT token found in header");
            }
            
            // 2. 쿼리 파라미터에서 JWT 토큰 추출 시도
            if (token == null) {
                String query = request.getURI().getQuery();
                if (query != null && query.contains("access_token=")) {
                    String[] params = query.split("&");
                    for (String param : params) {
                        if (param.startsWith("access_token=")) {
                            token = param.substring("access_token=".length());
                            log.debug("JWT token found in query parameter");
                            break;
                        }
                    }
                }
            }
            
            if (token != null) {
                // JWT 토큰 검증
                Map<String, Object> claims = JWTUtil.validateToken(token);
                if (claims != null) {
                    log.debug("JWT token validation successful for user: {}", claims.get("email"));
                    // 검증된 사용자 정보를 WebSocket 세션에 저장
                    attributes.put("memberNo", claims.get("memberNo"));
                    attributes.put("email", claims.get("email"));
                    attributes.put("roleNames", claims.get("roleNames"));
                    return true;
                }            }
            
            log.warn("JWT token missing or invalid for WebSocket connection");
            return false;
            
        } catch (Exception e) {
            log.error("WebSocket handshake error: ", e);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                             WebSocketHandler wsHandler, Exception exception) {
        // 🔒 운영 환경에서는 에러만 기록
        if (exception != null) {
            log.error("WebSocket handshake failed: ", exception);
        }
    }
}
