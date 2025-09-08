package org.zerock.mallapi.domain.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.mallapi.global.util.CustomJWTException;
import org.zerock.mallapi.global.util.JWTUtil;
import org.zerock.mallapi.global.config.TokenConfig;

import java.util.Date;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2

//기능 구현
//Access Token 과 Refresh Token 을 검증하고
//1. Access Token 이 없거나 잘못된 JWT 인 경우 -> 예외 메세지 발생
//2. Access Token 의 유효기간이 남아있는 경우 -> 전달된 토큰을 그대로 전송
//3. Access Token 은 만료, Refresh Token 은 만료되지 않은 경우 -> 새로운 Access Token
//4. Refresh Token 의 유효기간이 얼마 남지 않은 경우 -> 새로운 Refresh Token
//5. Refresh Token 의 유효기간이 충분히 남은 경우 -> 기존의 Refresh Token

//APIRefreshController 는 문제가 발생하면 CustomJWTException 을 반환하므로
//CustomControllerAdvice 를 사용해서 handleJWTException 에서 처리 하도록 구성
public class APIRefreshController {

    @RequestMapping("/api/member/refresh")
    public Map<String, String> refresh(
            @RequestHeader("Authorization") String authHeader, String refreshToken){

        if(refreshToken == null){
            throw new CustomJWTException("NULL_REFRESH");
        }
        //authHeader = Bearer + 공백문자1개 가 들어있다.(그 뒤에 토큰의 값이 저장된다.)
        if(authHeader == null || authHeader.length() < 7) {
            throw new CustomJWTException("INVALID_STRING");
        }
        //authHeader = Bearer + 공백문자1개 + token
        // accessToken 에는 token 만 저장된다.
        String accessToken = authHeader.substring(7);

        //Access 토큰이 만료되지 않았다면
        if(checkExpiredToken(accessToken) == false){
            return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
        }

        //Refresh 토큰 검증
        Map<String, Object> claims = JWTUtil.validateToken(refreshToken);

        log.info("refresh ... claims: " + claims);        //accessToken 이 만료 되었다면 새로운 accessToken을 생성
        String newAccessToken = JWTUtil.generateToken(claims, TokenConfig.ACCESS_TOKEN_MINUTES); // 설정파일에서 관리
        //checkTime 이 true 이면 시간이 1시간도 안남은 거니까 refreshToken 을 만든다.
        String newRefreshToken = checkTime((Integer)claims.get("exp")) == true ?
                JWTUtil.generateToken(claims, TokenConfig.REFRESH_TOKEN_MINUTES) : refreshToken; // 설정파일에서 관리

        return Map.of("accessToken", newAccessToken,
                "refreshToken", newRefreshToken);
    }



    //시간이 1시간 미만으로 남았다면
    private boolean checkTime(Integer exp){
        //JWT exp 를 날짜로 변환
        //Date 생성자는 밀리초 단위값을 받는다.
        //따라서 초 단위를 밀리초 단위로 변경 하려면 1000을 곱해줘야 한다.
        Date expDate = new Date((long)exp * (1000));

        //현재 시간과의 차이 계산 - 밀리 세컨즈
        long gap = expDate.getTime() - System.currentTimeMillis();

        //분단위 계산
        long leftMin = gap / (1000 * 60);        //1시간도 안남앗는지..
        return leftMin < TokenConfig.REFRESH_THRESHOLD_MINUTES; // 설정파일에서 관리
    }

    private boolean checkExpiredToken(String token) {
        try{
            JWTUtil.validateToken(token);
        }catch (CustomJWTException ex){
            if(ex.getMessage().equals("Expired")) {
                return true;
            }
        }

        return false;
    }
}
