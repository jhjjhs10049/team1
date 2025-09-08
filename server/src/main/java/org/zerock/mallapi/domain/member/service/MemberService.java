package org.zerock.mallapi.domain.member.service;

import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.dto.MemberJoinDTO;
import org.zerock.mallapi.domain.member.dto.MemberModifyDTO;
import org.zerock.mallapi.domain.member.entity.Member;

import java.util.List;

@Transactional
public interface MemberService {

    // 회원가입
    void join(MemberJoinDTO memberJoinDTO);
    
    // 카카오 회원
    MemberDTO getKakaoMember(String accessToken);

    // 회원 정보 수정
    void modifyMember(MemberModifyDTO memberModifyDTO);

    // 이메일 중복 체크
    boolean isEmailDuplicate(String email);
    
    // 닉네임 중복 체크
    boolean isNicknameDuplicate(String nickname);    
    
    // 이메일로 회원 정보 조회
    MemberDTO getMemberByEmail(String email);
      
    // 회원탈퇴
    void withdrawMember(String email);
      
    // 비밀번호 확인
    boolean verifyPassword(String email, String password);
      
    // MANAGER 역할 코드 생성
    String generateManagerCode();
      
    // 기존 MANAGER들에게 roleCode 부여
    void assignRoleCodeToExistingManagers();
    
    // 특정 회원을 MANAGER로 승격 (roleCode 자동 생성)
    void promoteToManager(String email);
    
    // 특정 회원의 MANAGER 권한 해제
    void demoteFromManager(String email);
    
    //회원 정보는 MemberDTO 타입으로 처리되어야 하므로 Member 엔티티 객체를 MemberDTO 객체로 변환
    default MemberDTO entityToDTO(Member member){
        MemberDTO dto = new MemberDTO(
                member.getEmail(),
                member.getPw(),
                member.getNickname(),
                member.getSocial(),
                List.of(member.getRole().name())); // 단일 역할을 List로 변환
        dto.setMemberNo(member.getMemberNo());        
        dto.setPhone(member.getPhone());
        dto.setPostalCode(member.getPostalCode());
        dto.setRoadAddress(member.getRoadAddress());
        dto.setDetailAddress(member.getDetailAddress());        
        dto.setActive(member.getActive());
        dto.setRole(member.getRole());
        dto.setRoleCode(member.getRoleCode());
        dto.setModifiedDate(member.getModifiedDate());
        dto.setJoinedDate(member.getJoinedDate());

        return dto;
    }
}
