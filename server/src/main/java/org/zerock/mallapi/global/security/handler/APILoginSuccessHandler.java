package org.zerock.mallapi.global.security.handler;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.global.util.JWTUtil;
import org.zerock.mallapi.global.config.TokenConfig;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;


//로그인 성공후 후처리 작업
@Log4j2
public class APILoginSuccessHandler implements AuthenticationSuccessHandler {@Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 로그인 성공시 여기로 들어온다.
        log.info("----------------------");
        log.info(authentication);//스프링 시큐리티가 만들어 놓은 Authentication 객체 (로그인하려는 사용자의 정보가 담겨있다.)
        log.info("----------------------");

        //authentication 에 로그인한 사용자의 정보가 있긴 하지만
        //우리가 필요한 타입이 아니라서 변환을 해 줄 필요가 있다.
        //getPrincipal()의 리턴 타입이 Object 라서 (MemberDTO) 로 명시적 형변환을 해주고 있다.
        MemberDTO memberDTO = (MemberDTO) authentication.getPrincipal();

        //getClaims() 로 현재 로그인한 사용자의 정보를 가져온다.(getClaims() 클릭해서 확인)
        Map<String, Object> claims = memberDTO.getClaims();        String accessToken = JWTUtil.generateToken(claims, TokenConfig.ACCESS_TOKEN_MINUTES); // 설정파일에서 관리
        String refreshToken = JWTUtil.generateToken(claims, TokenConfig.REFRESH_TOKEN_MINUTES); // 설정파일에서 관리

        claims.put("accessToken", accessToken);  
        claims.put("refreshToken", refreshToken);

        //Gson : java 객체를 JSON 으로 바꾸거나, JSON 을 자바 객체로 바꿔주는 도구
        Gson gson = new Gson();

        //자바 객체를 JSON 문자열로 변환(Map -> JSON)
        String jsonStr = gson.toJson(claims);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}
