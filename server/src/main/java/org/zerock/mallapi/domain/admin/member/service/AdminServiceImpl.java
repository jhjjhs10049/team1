package org.zerock.mallapi.domain.admin.member.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.zerock.mallapi.domain.admin.member.dto.AdminMemberDTO;
import org.zerock.mallapi.domain.admin.member.dto.BanRequestDTO;
import org.zerock.mallapi.domain.admin.member.dto.BannedDTO;
import org.zerock.mallapi.domain.admin.member.entity.Banned;
import org.zerock.mallapi.domain.admin.member.repository.BannedRepository;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.entity.MemberRole;
import org.zerock.mallapi.domain.member.entity.MemberStatus;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.member.service.MemberNotificationService;
import org.zerock.mallapi.global.util.DateTimeUtil;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class AdminServiceImpl implements AdminService {
    
    private final MemberRepository memberRepository;
    private final BannedRepository bannedRepository;
    private final MemberNotificationService memberNotificationService;@Override
    public List<AdminMemberDTO> getAllMembers(MemberRole adminRole) {
        log.info("회원 목록 조회 요청: adminRole = {}", adminRole);
        
        List<Member> members;
        
        // ADMIN이면 MANAGER도 포함, MANAGER면 USER만
        if (adminRole == MemberRole.ADMIN) {
            members = memberRepository.findAllUsersAndManagers();
        } else {
            members = memberRepository.findAllUsers();
        }
        
        log.info("조회된 회원 수: {}", members.size());
        
        return members.stream()
                .map(this::convertToAdminMemberDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdminMemberDTO> getAllMembers(MemberRole adminRole, String keyword, String searchType) {
        log.info("회원 검색 요청: adminRole = {}, keyword = {}, searchType = {}", adminRole, keyword, searchType);
        
        // 검색어가 없으면 전체 조회
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllMembers(adminRole);
        }
        
        List<Member> members;
        
        // ADMIN이면 MANAGER도 포함, MANAGER면 USER만
        if (adminRole == MemberRole.ADMIN) {
            members = memberRepository.findAllUsersAndManagers();
        } else {
            members = memberRepository.findAllUsers();
        }
        
        // 검색 필터링
        String searchKeyword = keyword.trim().toLowerCase();
        List<Member> filteredMembers = members.stream()
                .filter(member -> matchesSearchCriteria(member, searchKeyword, searchType))
                .collect(Collectors.toList());
        
        log.info("검색 결과: {} 건 (전체 {} 건 중)", filteredMembers.size(), members.size());
        
        return filteredMembers.stream()
                .map(this::convertToAdminMemberDTO)
                .collect(Collectors.toList());
    }

    // 검색 조건 매칭 헬퍼 메서드
    private boolean matchesSearchCriteria(Member member, String keyword, String searchType) {
        if (searchType == null) {
            searchType = "all";
        }
        
        switch (searchType.toLowerCase()) {
            case "email":
                return member.getEmail() != null && 
                       member.getEmail().toLowerCase().contains(keyword);
            case "nickname":
                return member.getNickname() != null && 
                       member.getNickname().toLowerCase().contains(keyword);
            case "phone":
                return member.getPhone() != null && 
                       member.getPhone().toLowerCase().contains(keyword);
            case "status":
                return member.getActive() != null && 
                       member.getActive().toString().toLowerCase().contains(keyword);
            case "role":
                return (member.getRole() != null && 
                        member.getRole().toString().toLowerCase().contains(keyword)) ||
                       (member.getRoleCode() != null && 
                        member.getRoleCode().toLowerCase().contains(keyword));
            case "all":
            default:
                // 전체 검색
                return (member.getEmail() != null && member.getEmail().toLowerCase().contains(keyword)) ||
                       (member.getNickname() != null && member.getNickname().toLowerCase().contains(keyword)) ||
                       (member.getPhone() != null && member.getPhone().toLowerCase().contains(keyword)) ||
                       (member.getActive() != null && member.getActive().toString().toLowerCase().contains(keyword)) ||
                       (member.getRole() != null && member.getRole().toString().toLowerCase().contains(keyword)) ||
                       (member.getRoleCode() != null && member.getRoleCode().toLowerCase().contains(keyword));
        }    }
      @Override
    public void banMember(BanRequestDTO banRequest) {
        log.info("회원 정지 요청: {}", banRequest);
        
        // 유효성 검증
        if (!banRequest.isValid()) {
            throw new IllegalArgumentException("정지 요청 데이터가 유효하지 않습니다.");
        }
        
        Member member = memberRepository.findById(banRequest.getMemberNo())
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다: " + banRequest.getMemberNo()));
        
        // 이미 정지된 회원인지 확인
        Optional<Banned> activeBan = bannedRepository.findActiveBanByMemberNo(banRequest.getMemberNo());
        if (activeBan.isPresent()) {
            throw new RuntimeException("이미 정지된 회원입니다.");
        }
        
        // 회원 상태를 BANNED로 변경
        member.changeActive(MemberStatus.BANNED);
        memberRepository.save(member);
        
        // 정지 내역 저장
        Banned banned = Banned.builder()
                .memberNo(banRequest.getMemberNo())
                .bannedAt(DateTimeUtil.getModifiedTime())
                .bannedUntil(banRequest.getBannedUntil())
                .reason(banRequest.getReason())
                .bannedBy(banRequest.getBannedBy())
                .build();
        
        bannedRepository.save(banned);
        
        // 웹소켓을 통한 강제 로그아웃 알림 전송
        memberNotificationService.notifyMemberStatusChange(
            banRequest.getMemberNo(),
            "BAN",
            banRequest.getReason(),
            banRequest.getBannedBy()
        );
        
        log.info("회원 정지 완료: memberNo = {}, reason = {}", banRequest.getMemberNo(), banRequest.getReason());
    }      @Override
    public void unbanMember(Long memberNo, String adminRoleCode) {
        log.info("회원 정지 해제 요청: memberNo = {}, adminRoleCode = {}", memberNo, adminRoleCode);
        
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다: " + memberNo));
        
        // 활성 정지 내역 조회
        Banned activeBan = bannedRepository.findActiveBanByMemberNo(memberNo)
                .orElseThrow(() -> new RuntimeException("정지된 상태가 아닙니다."));
          // 회원 상태를 ACTIVE로 변경
        member.changeActive(MemberStatus.ACTIVE);
        memberRepository.save(member);
          // 정지 해제 처리
        activeBan.unban(adminRoleCode);
        bannedRepository.save(activeBan);
        
        // 정지 해제는 이미 로그아웃된 상태이므로 강제 로그아웃 알림 불필요
        
        log.info("회원 정지 해제 완료: memberNo = {}", memberNo);
    }
      @Override
    public void restoreMember(Long memberNo) {
        log.info("계정 복구 요청: memberNo = {}", memberNo);
        
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다: " + memberNo));
        
        if (member.getActive() != MemberStatus.DELETED) {
            throw new RuntimeException("삭제된 계정이 아닙니다.");
        }
        
        // 계정 상태를 ACTIVE로 복구
        member.changeActive(MemberStatus.ACTIVE);
        memberRepository.save(member);
        
        // 웹소켓을 통한 강제 로그아웃 알림 전송 (계정 복구)
        memberNotificationService.notifyMemberStatusChange(
            memberNo,
            "STATUS_CHANGE",
            "계정 복구",
            "SYSTEM"
        );
        
        log.info("계정 복구 완료: memberNo = {}", memberNo);
    }
    
    @Override
    public void changeMemberRole(Long memberNo, MemberRole newRole) {
        log.info("회원 권한 변경 요청: memberNo = {}, newRole = {}", memberNo, newRole);
        
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new RuntimeException("해당 회원을 찾을 수 없습니다: " + memberNo));
          // MANAGER로 변경시 roleCode 생성
        if (newRole == MemberRole.MANAGER) {
            String roleCode = generateManagerCode();
            member.changeRole(newRole);
            member.changeRoleCode(roleCode);
        } else {
            member.changeRole(newRole);
            member.changeRoleCode(null); // USER나 ADMIN은 roleCode 없음
        }
        
        memberRepository.save(member);
        
        // 웹소켓을 통한 강제 로그아웃 알림 전송 (권한 변경)
        memberNotificationService.notifyMemberStatusChange(
            memberNo,
            "ROLE_CHANGE",
            "권한이 " + newRole + "로 변경됨",
            "SYSTEM"
        );
        
        log.info("회원 권한 변경 완료: memberNo = {}, newRole = {}", memberNo, newRole);
    }
    
    @Override
    public List<BannedDTO> getBanHistory(Long memberNo) {
        log.info("정지 내역 조회 요청: memberNo = {}", memberNo);
        
        List<Banned> banHistory = bannedRepository.findAllBansByMemberNo(memberNo);
        
        return banHistory.stream()
                .map(this::convertToBannedDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AdminMemberDTO> getCurrentlyBannedMembers() {
        log.info("현재 정지된 회원 목록 조회 요청");
        
        List<Banned> currentBans = bannedRepository.findCurrentlyBannedMembers();
        
        return currentBans.stream()
                .map(banned -> {
                    Optional<Member> memberOpt = memberRepository.findById(banned.getMemberNo());
                    if (memberOpt.isPresent()) {
                        AdminMemberDTO dto = convertToAdminMemberDTO(memberOpt.get());
                        dto.setCurrentBan(convertToBannedDTO(banned));
                        return dto;
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
      @Override
    public List<BannedDTO> getAdminActionsByRoleCode(String adminRoleCode) {
        log.info("관리자 조치 내역 조회 요청: adminRoleCode = {}", adminRoleCode);
        
        List<Banned> actions = bannedRepository.findBansByAdminRoleCode(adminRoleCode);
        
        return actions.stream()
                .map(this::convertToBannedDTO)
                .collect(Collectors.toList());
    }
    
    // ========== 변환 메서드들 ==========

    @Override
    public boolean isMemberCurrentlyBanned(String email) {
        log.info("회원 정지 상태 확인: email = {}", email);
        
        Optional<Member> memberOpt = memberRepository.findByEmailAndActiveStatus(email);
        if (memberOpt.isEmpty()) {
            return false;
        }
        
        Long memberNo = memberOpt.get().getMemberNo();
        Optional<Banned> activeBan = bannedRepository.findActiveBanByMemberNo(memberNo);
        
        boolean isBanned = activeBan.isPresent();
        log.info("정지 상태 확인 결과: email = {}, isBanned = {}", email, isBanned);
        
        return isBanned;
    }
    
    @Override
    public BannedDTO getCurrentBanInfo(String email) {
        log.info("회원 정지 정보 조회: email = {}", email);
        
        // BANNED 상태의 회원 조회로 변경
        Optional<Member> memberOpt = memberRepository.getWithRoles(email, MemberStatus.BANNED);
        if (memberOpt.isEmpty()) {
            log.info("BANNED 상태의 회원을 찾을 수 없음: email = {}", email);
            return null;
        }
        
        Long memberNo = memberOpt.get().getMemberNo();
        log.info("BANNED 회원 번호: {}", memberNo);
        Optional<Banned> activeBan = bannedRepository.findActiveBanByMemberNo(memberNo);
        
        if (activeBan.isPresent()) {
            BannedDTO banInfo = convertToBannedDTO(activeBan.get());
            log.info("정지 정보 조회 결과: {}", banInfo);
            return banInfo;
        }
        
        log.info("활성 정지 정보를 찾을 수 없음: memberNo = {}", memberNo);
        return null;
    }
    
    private AdminMemberDTO convertToAdminMemberDTO(Member member) {
        // 현재 정지 상태 확인
        BannedDTO currentBan = null;
        Optional<Banned> activeBan = bannedRepository.findActiveBanByMemberNo(member.getMemberNo());
        if (activeBan.isPresent()) {
            currentBan = convertToBannedDTO(activeBan.get());
        }
        
        // 전체 정지 횟수 계산
        int totalBanCount = bannedRepository.findAllBansByMemberNo(member.getMemberNo()).size();
        
        return AdminMemberDTO.builder()
                .memberNo(member.getMemberNo())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .phone(member.getPhone())
                .postalCode(member.getPostalCode())
                .roadAddress(member.getRoadAddress())
                .detailAddress(member.getDetailAddress())
                .active(member.getActive())
                .role(member.getRole())
                .roleCode(member.getRoleCode())
                .social(member.getSocial())
                .joinedDate(member.getJoinedDate())
                .modifiedDate(member.getModifiedDate())
                .currentBan(currentBan)
                .totalBanCount(totalBanCount)
                .build();
    }
      private BannedDTO convertToBannedDTO(Banned banned) {
        return BannedDTO.builder()
                .no(banned.getNo())
                .memberNo(banned.getMemberNo())
                .bannedAt(banned.getBannedAt())
                .bannedUntil(banned.getBannedUntil())
                .reason(banned.getReason())
                .bannedBy(banned.getBannedBy())
                .unbannedAt(banned.getUnbannedAt())
                .unbannedBy(banned.getUnbannedBy())
                .build();
    }
    
    // MANAGER 역할 코드 생성
    private String generateManagerCode() {
        log.info("MANAGER 코드 생성 요청");
        
        // 기존 MANAGER 코드 중 가장 큰 값 조회
        Optional<String> latestCodeOpt = memberRepository.findLatestManagerCode();
        
        String newCode;
        if (latestCodeOpt.isPresent()) {
            String latestCode = latestCodeOpt.get();
            log.info("기존 최신 MANAGER 코드: {}", latestCode);
            
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
                log.warn("기존 코드 파싱 실패, 기본값으로 설정: {}", latestCode);
                newCode = "1001"; // 파싱 실패 시 기본값
            }
        } else {
            // 첫 번째 MANAGER인 경우
            newCode = "1001";
            log.info("첫 번째 MANAGER, 코드: {}", newCode);
        }
        
        log.info("생성된 MANAGER 코드: {}", newCode);
        return newCode;
    }
}
