package org.zerock.mallapi.domain.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.dto.MemberJoinDTO;
import org.zerock.mallapi.domain.member.dto.MemberModifyDTO;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.entity.MemberRole;
import org.zerock.mallapi.domain.member.entity.MemberStatus;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.global.util.DateTimeUtil;

import java.util.LinkedHashMap;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberServiceImpl implements MemberService{

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void join(MemberJoinDTO memberJoinDTO) {
        // 이메일 중복 체크
        if (memberRepository.existsByEmail(memberJoinDTO.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }        // 닉네임 중복 체크
        if (memberRepository.existsByNickname(memberJoinDTO.getNickname())) {
            throw new RuntimeException("이미 존재하는 닉네임입니다.");
        }

        // 회원가입은 모두 USER 역할로 고정
        Member member = Member.builder()
                .email(memberJoinDTO.getEmail())
                .pw(passwordEncoder.encode(memberJoinDTO.getPw()))
                .nickname(memberJoinDTO.getNickname())
                .phone(memberJoinDTO.getPhone())
                .postalCode(memberJoinDTO.getPostalCode())
                .roadAddress(memberJoinDTO.getRoadAddress())
                .detailAddress(memberJoinDTO.getDetailAddress())
                .active(MemberStatus.ACTIVE)
                .role(MemberRole.USER) // 모든 가입자는 USER로 고정
                .social(false)
                .joinedDate(DateTimeUtil.getJoinedTime())
                .build();

        memberRepository.save(member);
    }

    @Override
    public boolean isEmailDuplicate(String email) {
        return memberRepository.existsByEmail(email);
    }

    @Override
    public boolean isNicknameDuplicate(String nickname) {
        return memberRepository.existsByNickname(nickname);
    }

    @Override
    public MemberDTO getKakaoMember(String accessToken) {
        // 카카오에 accessToken 을 전송하고 사용자 정보를 받아온다.
        String email = getEmailFromKakaoAccessToken(accessToken);

        log.info("email:" + email);

        Optional<Member> result = memberRepository.findByEmailAndActiveStatus(email);

        //기존의 회원
        if(result.isPresent()){ //result 에 값이 들어있으면
            // Member -> MemberDTO
            MemberDTO memberDTO = entityToDTO(result.get());
            return memberDTO;
        }
        
        //회원이 아니었다면
        //닉네임은 '소셜회원' 으로
        //패스워드는 임의로 생성
        Member socialmember = makeSocialmember(email);//DB에 없는 유저인 경우 소셜유저를 하나 생성
        memberRepository.save(socialmember); // 소셜 유저를 DB에 저장

        MemberDTO memberDTO = entityToDTO(socialmember);
        return memberDTO;
    }
    
    // 카카오에 accessToken 을 전송하고 사용자 정보를 받아온다.
    private String getEmailFromKakaoAccessToken(String accessToken){
        // accessToken 을 전송할 kakao 주소
        String kakaoGetUserURL = "https://kapi.kakao.com/v2/user/me";

        if(accessToken == null){
            throw new RuntimeException("Access Token is null");
        }

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-Type", "application/x-www-form-urlencoded");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        UriComponents uriBuilder = UriComponentsBuilder.fromUriString(kakaoGetUserURL).build();

        ResponseEntity<LinkedHashMap<String, Object>> response = restTemplate.exchange(
                uriBuilder.toString(),
                HttpMethod.GET,
                entity,
                new org.springframework.core.ParameterizedTypeReference<LinkedHashMap<String, Object>>() {});

        log.info(response);
        LinkedHashMap<String, Object> bodyMap = response.getBody();

        log.info("-------------------------------");
        log.info(bodyMap);

        Object kakaoAccountObj = bodyMap.get("kakao_account");
        LinkedHashMap<String, Object> kakaoAccount = null;
        if (kakaoAccountObj instanceof LinkedHashMap) {
            @SuppressWarnings("unchecked")
            LinkedHashMap<String, Object> temp = (LinkedHashMap<String, Object>) kakaoAccountObj;
            kakaoAccount = temp;
        } else {
            throw new RuntimeException("kakao_account is not a LinkedHashMap");
        }

        log.info("kakaoAccount: " + kakaoAccount);

        return (String) kakaoAccount.get("email");
    }

    //소셜 로그인 후 임시 비밀번호를 랜덤으로 생성
    private String makeTempPassword(){
        StringBuffer buffer = new StringBuffer();

        for(int i=0; i<10; i++){
            buffer.append( (char) ( (int)(Math.random()*55) + 65 ));
        }

        return buffer.toString();
    }
    
    //소셜 로그인을 했는데 기존 유저(DB에 있는 유저)가 아닌경우 소셜회원을 하나 만든다.
    private Member makeSocialmember(String email){
        // 랜덤으로 만든 임시 비밀번호(사용자도 관리자도 알수 없다.)
        String tempPassword = makeTempPassword();

        log.info("tempPassword: " + tempPassword);

        // 이메일의 @ 앞부분을 닉네임으로 사용 (중복 체크 후 고유한 닉네임 생성)
        String baseNickname = email.substring(0, email.indexOf("@"));
        String nickname = generateUniqueNickname(baseNickname);
        log.info("자동 생성된 닉네임: " + nickname);

        Member member = Member.builder()
                .email(email)
                .pw(passwordEncoder.encode(tempPassword))
                .nickname(nickname)                .active(MemberStatus.ACTIVE)                .role(MemberRole.USER)
                .social(true) // 소셜 회원으로 설정
                .joinedDate(DateTimeUtil.getJoinedTime())
                .build();

        return member;
    }
    
    // 고유한 닉네임 생성
    private String generateUniqueNickname(String baseNickname) {
        String nickname = baseNickname;
        int count = 1;
        
        while (memberRepository.existsByNickname(nickname)) {
            nickname = baseNickname + count;
            count++;
        }
        
        return nickname;
    }    
    
    @Override
    public void modifyMember(MemberModifyDTO memberModifyDTO) {
        Optional<Member> result = memberRepository.findByEmailAndActiveStatus(memberModifyDTO.getEmail());

        Member member = result.orElseThrow(() -> 
            new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다: " + memberModifyDTO.getEmail()));
        
        // 비밀번호 변경 (값이 있을 때만)
        if (memberModifyDTO.getPw() != null && !memberModifyDTO.getPw().isEmpty()) {
            member.changePw(passwordEncoder.encode(memberModifyDTO.getPw()));
        }
        
        // 닉네임 변경 (값이 있을 때만)
        if (memberModifyDTO.getNickname() != null && !memberModifyDTO.getNickname().isEmpty()) {
            // 현재 닉네임과 다를 때만 중복 체크
            if (!member.getNickname().equals(memberModifyDTO.getNickname())) {
                if (memberRepository.existsByNickname(memberModifyDTO.getNickname())) {
                    throw new RuntimeException("이미 존재하는 닉네임입니다.");
                }
            }
            member.changeNickname(memberModifyDTO.getNickname());
        }
        
        // 전화번호 변경
        if (memberModifyDTO.getPhone() != null) {
            member.changePhone(memberModifyDTO.getPhone());
        }
          // 주소 변경
        if (memberModifyDTO.getPostalCode() != null || memberModifyDTO.getRoadAddress() != null || memberModifyDTO.getDetailAddress() != null) {
            member.changeAddress(
                memberModifyDTO.getPostalCode(), 
                memberModifyDTO.getRoadAddress(),
                memberModifyDTO.getDetailAddress()
            );
        }

        memberRepository.save(member); // 회원 정보 수정
    }      
    
    @Override
    public MemberDTO getMemberByEmail(String email) {
        Optional<Member> result = memberRepository.findByEmailAndActiveStatus(email);
        
        Member member = result.orElseThrow(() -> 
            new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다: " + email));
        
        return entityToDTO(member);
    }
      
    @Override
    public void withdrawMember(String email) {
        log.info("회원탈퇴 요청: " + email);
        
        Optional<Member> result = memberRepository.findByEmailAndActiveStatus(email);
        
        Member member = result.orElseThrow(() -> 
            new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다: " + email));
        
        // 소셜 로그인 사용자는 탈퇴할 수 없음
        if (member.getSocial() != null && member.getSocial()) {
            throw new RuntimeException("소셜 로그인 회원은 회원탈퇴를 할 수 없습니다.");
        }
        
        // active 상태를 DELETED로 변경 (소프트 삭제)
        member.changeActive(MemberStatus.DELETED);
          memberRepository.save(member);
        
        log.info("회원탈퇴 완료: " + email);
    }
    
    @Override
    public boolean verifyPassword(String email, String password) {
        log.info("비밀번호 확인 요청: " + email);
        
        Optional<Member> result = memberRepository.findByEmailAndActiveStatus(email);
        
        Member member = result.orElseThrow(() -> 
            new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다: " + email));
        
        // 소셜 로그인 사용자는 비밀번호 확인 불가
        if (member.getSocial() != null && member.getSocial()) {
            throw new RuntimeException("소셜 로그인 회원은 비밀번호 확인을 할 수 없습니다.");
        }
        
        // 입력된 비밀번호와 저장된 암호화된 비밀번호 비교
        boolean matches = passwordEncoder.matches(password, member.getPw());
        
        log.info("비밀번호 확인 결과: " + matches);
          return matches;
    }
    
    @Override
    public String generateManagerCode() {
        log.info("MANAGER 코드 생성 요청");
        
        // 기존 MANAGER 코드 중 가장 큰 값 조회
        Optional<String> latestCodeOpt = memberRepository.findLatestManagerCode();
        
        String newCode;
        if (latestCodeOpt.isPresent()) {
            String latestCode = latestCodeOpt.get();
            log.info("기존 최신 MANAGER 코드: " + latestCode);
            
            try {
                // 기존 코드에서 숫자 부분을 추출하여 1 증가
                int currentNumber = Integer.parseInt(latestCode);
                int nextNumber = currentNumber + 1;
                newCode = String.format("%04d", nextNumber); // 4자리로 포맷팅
                
                // 중복 확인 (혹시나 해서)
                while (memberRepository.existsByRoleCode(newCode)) {
                    nextNumber++;
                    newCode = String.format("%04d", nextNumber);
                }
            } catch (NumberFormatException e) {
                log.warn("기존 코드 파싱 실패, 기본값으로 설정: " + latestCode);
                newCode = "1001"; // 파싱 실패 시 기본값
            }
        } else {
            // 첫 번째 MANAGER인 경우
            newCode = "1001";
            log.info("첫 번째 MANAGER, 코드: " + newCode);
        }
          log.info("생성된 MANAGER 코드: " + newCode);
        return newCode;
    }
    
    @Override
    public void assignRoleCodeToExistingManagers() {
        log.info("기존 MANAGER들에게 roleCode 부여 시작");
        
        // roleCode가 없는 MANAGER들 조회
        java.util.List<Member> managersWithoutCode = memberRepository.findManagersWithoutRoleCode();
        
        if (managersWithoutCode.isEmpty()) {
            log.info("roleCode가 필요한 MANAGER가 없습니다.");
            return;
        }
        
        log.info("roleCode 부여 대상 MANAGER 수: " + managersWithoutCode.size());
        
        for (Member manager : managersWithoutCode) {
            String newCode = generateManagerCode();
            manager.changeRoleCode(newCode);
            memberRepository.save(manager);
            
            log.info("MANAGER {} (가입일: {})에게 코드 {} 부여", 
                manager.getEmail(), 
                manager.getJoinedDate(), 
                newCode);
        }
          log.info("기존 MANAGER들에게 roleCode 부여 완료");
    }
    
    @Override
    public void promoteToManager(String email) {
        log.info("MANAGER 승격 요청: " + email);
        
        Member member = memberRepository.findByEmailAndActiveStatus(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다: " + email));
        
        // 이미 MANAGER인 경우 예외 처리
        if (member.getRole() == MemberRole.MANAGER) {
            throw new RuntimeException("이미 MANAGER 권한을 가진 회원입니다: " + email);
        }
        
        // MANAGER 역할로 변경 및 코드 생성
        String roleCode = generateManagerCode();
        member.changeRole(MemberRole.MANAGER);
        member.changeRoleCode(roleCode);
        
        memberRepository.save(member);
        
        log.info("MANAGER 승격 완료: {} (코드: {})", email, roleCode);
    }
    
    @Override
    public void demoteFromManager(String email) {
        log.info("MANAGER 권한 해제 요청: " + email);
        
        Member member = memberRepository.findByEmailAndActiveStatus(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일의 회원을 찾을 수 없습니다: " + email));
        
        // MANAGER가 아닌 경우 예외 처리
        if (member.getRole() != MemberRole.MANAGER) {
            throw new RuntimeException("MANAGER 권한이 없는 회원입니다: " + email);
        }
        
        // USER 역할로 변경 및 roleCode 제거
        member.changeRole(MemberRole.USER);
        member.changeRoleCode(null);
        
        memberRepository.save(member);
        
        log.info("MANAGER 권한 해제 완료: " + email);
    }
}
