package org.zerock.mallapi.domain.member.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.dto.MemberModifyDTO;
import org.zerock.mallapi.domain.member.service.MemberService;
import org.zerock.mallapi.domain.admin.member.service.AdminService;
import org.zerock.mallapi.global.util.JWTUtil;
import org.zerock.mallapi.global.config.TokenConfig;

import java.util.Map;

/*************************************************************************
 * 리액트에서 카카오 로그인 -> 카카오 서버로 부터 인가 코드 받음
 * 인가 코드를 카카오 서버로 전송 -> 카카오 서버에서 accessToken 전송 해줌
 * accessToken 을 API 서버로 전송 -> API 서버는 카카오 서버에 accessToken 전송
 * 카카오 서버는 API 서버에 email 전송
 * API 서버는 리액트에 email 전송
 ***************************************************************************/

@RestController
@Log4j2
@RequiredArgsConstructor
public class SocialController {    private final MemberService memberService;
    private final AdminService adminService;

    @SuppressWarnings("unlikely-arg-type")
    @GetMapping("/api/member/kakao")
    public ResponseEntity<Map<String,Object>> getMemberFromKakao(String accessToken){

        log.info("카카오 로그인 요청 - accessToken: " + accessToken);

        try {
            if (accessToken == null || accessToken.trim().isEmpty()) {
                log.error("accessToken이 없습니다.");
                return ResponseEntity.badRequest().body(Map.of("error", "ACCESS_TOKEN_REQUIRED"));
            }

            // 카카오에 accessToken 을 전송하고 사용자 정보를 받아온다.
            MemberDTO memberDTO = memberService.getKakaoMember(accessToken);
            
            if (memberDTO == null) {
                log.error("카카오에서 사용자 정보를 받지 못했습니다.");
                return ResponseEntity.badRequest().body(Map.of("error", "KAKAO_USER_INFO_ERROR"));
            }            log.info("카카오 사용자 정보 조회 성공: " + memberDTO.getEmail());
            
            // 정지된 회원 체크
            if ("BANNED".equals(memberDTO.getActive())) {
                log.warn("정지된 회원의 카카오 로그인 시도: " + memberDTO.getEmail());
                
                // 실제 ban 정보를 조회해서 사용 (일반 로그인과 동일)
                Object banInfo = adminService.getCurrentBanInfo(memberDTO.getEmail());
                
                Map<String, Object> errorResponse = Map.of(
                    "error", "MEMBER_BANNED",
                    "message", "정지된 회원입니다. 관리자에게 문의하시기 바랍니다.",
                    "banInfo", banInfo
                );
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            Map<String,Object> claims = memberDTO.getClaims();            String jwtAccessToken = JWTUtil.generateToken(claims, TokenConfig.ACCESS_TOKEN_MINUTES); // 설정파일에서 관리
            String jwtRefreshToken = JWTUtil.generateToken(claims, TokenConfig.REFRESH_TOKEN_MINUTES); // 설정파일에서 관리

            claims.put("accessToken", jwtAccessToken);
            claims.put("refreshToken", jwtRefreshToken);

            log.info("JWT 토큰 생성 완료 - 사용자: " + memberDTO.getEmail());

            // 리액트의 KakaoRedirectPage 에서 "/api/member/kakao" 를 요청 하였다.
            // 그래서 KakaoRedirectPage 로 사용자 정보 전송
            return ResponseEntity.ok(claims);
            
        } catch (Exception e) {
            log.error("카카오 로그인 처리 중 오류 발생", e);
            return ResponseEntity.badRequest().body(Map.of("error", "KAKAO_LOGIN_ERROR", "message", e.getMessage()));
        }    }

    @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
    @PutMapping("/api/member/modify")
    public Map<String ,String > modify(@RequestBody MemberModifyDTO memberModifyDTO){

        log.info("member modify : " + memberModifyDTO);

        memberService.modifyMember(memberModifyDTO);

        return Map.of("result", "modified");
    }
}
