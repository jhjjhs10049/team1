package org.zerock.mallapi.domain.admin.member.service;

import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.admin.member.dto.AdminMemberDTO;
import org.zerock.mallapi.domain.admin.member.dto.BanRequestDTO;
import org.zerock.mallapi.domain.admin.member.dto.BannedDTO;
import org.zerock.mallapi.domain.member.entity.MemberRole;

import java.util.List;

@Transactional
public interface AdminService {    /**
     * 회원 목록 조회 (관리자/매니저 권한에 따라 필터링)
     * ADMIN: USER + MANAGER 조회 가능
     * MANAGER: USER만 조회 가능
     */
    List<AdminMemberDTO> getAllMembers(MemberRole adminRole);

    /**
     * 회원 목록 조회 (검색 기능 포함)
     * ADMIN: USER + MANAGER 조회 가능
     * MANAGER: USER만 조회 가능
     */
    List<AdminMemberDTO> getAllMembers(MemberRole adminRole, String keyword, String searchType);
    
    /**
     * 회원 정지
     */
    void banMember(BanRequestDTO banRequest);
    
    /**
     * 회원 정지 해제
     */
    void unbanMember(Long memberNo, String adminRoleCode);
    
    /**
     * 삭제된 계정 복구
     */
    void restoreMember(Long memberNo);
    
    /**
     * 회원 권한 변경 (ADMIN만 가능)
     */
    void changeMemberRole(Long memberNo, MemberRole newRole);
    
    /**
     * 회원의 정지 내역 조회
     */
    List<BannedDTO> getBanHistory(Long memberNo);
    
    /**
     * 현재 정지된 회원 목록 조회
     */
    List<AdminMemberDTO> getCurrentlyBannedMembers();
      /**
     * 관리자별 조치 내역 조회 (roleCode로 검색)
     */
    List<BannedDTO> getAdminActionsByRoleCode(String adminRoleCode);
    
    /**
     * 특정 회원의 현재 정지 상태 확인
     */
    boolean isMemberCurrentlyBanned(String email);
    
    /**
     * 특정 회원의 현재 정지 정보 조회
     */
    BannedDTO getCurrentBanInfo(String email);
}
