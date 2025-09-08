package org.zerock.mallapi.global.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.zerock.mallapi.domain.admin.member.dto.BannedDTO;
import org.zerock.mallapi.domain.admin.member.service.AdminService;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.entity.MemberStatus;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.global.exception.BannedMemberException;

import java.util.List;

@Component
@Log4j2
@RequiredArgsConstructor
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final MemberRepository memberRepository;
    private final AdminService adminService;
    private final PasswordEncoder passwordEncoder;    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = (String) authentication.getCredentials();

        log.info("Custom Authentication Provider - username: {}", username);

        // 먼저 ACTIVE 상태로 조회
        Member member = memberRepository.getWithRoles(username);
          if (member == null) {
            // ACTIVE 상태가 아닌 경우 BANNED 상태 확인
            log.info("ACTIVE 상태 회원을 찾지 못함, BANNED 상태 확인: {}", username);
            Member bannedMember = memberRepository.getWithRoles(username, MemberStatus.BANNED).orElse(null);
            if (bannedMember != null) {
                log.info("BANNED 회원 발견: {}", username);
                
                // 비밀번호 먼저 검증
                if (!passwordEncoder.matches(password, bannedMember.getPw())) {
                    log.info("BANNED 회원의 비밀번호 불일치: {}", username);
                    throw new BadCredentialsException("Invalid credentials");
                }
                  log.info("BANNED 회원의 비밀번호 일치, 정지 정보 조회: {}", username);
                // BANNED 회원인 경우 정지 정보와 함께 예외 발생
                BannedDTO banInfo = adminService.getCurrentBanInfo(username);
                log.info("DB에서 조회한 정지 정보: {}", banInfo);
                
                if (banInfo != null) {
                    log.info("정지 정보 상세:");
                    log.info("  - no: {}", banInfo.getNo());
                    log.info("  - memberNo: {}", banInfo.getMemberNo());
                    log.info("  - bannedAt: {}", banInfo.getBannedAt());
                    log.info("  - bannedUntil: {}", banInfo.getBannedUntil());
                    log.info("  - reason: {}", banInfo.getReason());
                    log.info("  - bannedBy: {}", banInfo.getBannedBy());
                }
                
                BannedMemberException bannedException = new BannedMemberException("정지된 회원입니다. 관리자에게 문의하세요.", banInfo);
                log.info("BannedMemberException 생성:");
                log.info("  - message: {}", bannedException.getMessage());
                log.info("  - banInfo: {}", bannedException.getBanInfo());
                if (bannedException.getBanInfo() != null) {
                    log.info("  - banInfo.bannedUntil: {}", bannedException.getBanInfo().getBannedUntil());
                }
                log.info("BannedMemberException을 던집니다!");
                throw bannedException;
            }
            log.info("회원을 찾을 수 없음: {}", username);
            throw new BadCredentialsException("Invalid credentials");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, member.getPw())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // MemberDTO 생성
        MemberDTO memberDTO = new MemberDTO(
                member.getMemberNo(),
                member.getEmail(),
                member.getPw(),
                member.getNickname(),
                member.getPhone(),
                member.getPostalCode(),
                member.getRoadAddress(),
                member.getDetailAddress(),
                member.getActive(),
                member.getRole(),
                member.getRoleCode(),
                member.getSocial() != null ? member.getSocial() : false,
                member.getModifiedDate(),
                member.getJoinedDate(),
                List.of(member.getRole().name())
        );

        return new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
