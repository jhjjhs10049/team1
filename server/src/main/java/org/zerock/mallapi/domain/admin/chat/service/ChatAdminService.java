package org.zerock.mallapi.domain.admin.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.admin.chat.repository.ChatRoomAdminRepository;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.support.chat.controller.ChatWebSocketController;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class ChatAdminService {

    private final ChatRoomAdminRepository chatRoomAdminRepository;
    private final ChatWebSocketController chatWebSocketController;
    private final MemberRepository memberRepository;

    // 채팅방 목록 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<ChatRoom> getChatRoomList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return chatRoomAdminRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    // 상태별 채팅방 조회
    @Transactional(readOnly = true)
    public Page<ChatRoom> getChatRoomListByStatus(int page, int size, ChatRoom.ChatStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        return chatRoomAdminRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }    // 관리자 권한 검증 메서드
    private void validateAdminAccess(ChatRoom chatRoom, Long currentAdminNo) {
        // 이미 다른 관리자가 배정된 경우 접근 불가
        if (chatRoom.getAdmin() != null && !chatRoom.getAdmin().getMemberNo().equals(currentAdminNo)) {
            String assignedAdminNickname = chatRoom.getAdmin().getNickname();
            throw new RuntimeException("이 채팅방은 다른 관리자(" + assignedAdminNickname + ")가 담당하고 있습니다. 접근이 제한됩니다.");
        }
    }

    // 채팅방 상태 변경 (관리자 입장/종료)
    public ChatRoom updateChatRoomStatus(Long chatRoomId, ChatRoom.ChatStatus status, Long adminNo) {
        Optional<ChatRoom> result = chatRoomAdminRepository.findById(chatRoomId);
        
        if (result.isEmpty()) {
            throw new RuntimeException("채팅방을 찾을 수 없습니다.");
        }

        ChatRoom chatRoom = result.get();
        
        // 관리자 권한 검증 (WAITING 상태가 아닌 경우에만)
        if (chatRoom.getStatus() != ChatRoom.ChatStatus.WAITING) {
            validateAdminAccess(chatRoom, adminNo);
        }        
        // 관리자 정보 조회
        Member admin = memberRepository.findById(adminNo)
                .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다: " + adminNo));        if (status == ChatRoom.ChatStatus.ACTIVE) {
            // 관리자가 채팅방에 입장 - 관리자 배정
            chatRoom.startChat(admin);
        } else if (status == ChatRoom.ChatStatus.ENDED) {
            // 채팅 종료
            chatRoom.endChat();
        }        ChatRoom savedChatRoom = chatRoomAdminRepository.save(chatRoom);
          // 웹소켓을 통해 채팅방 상태 변경 알림 전송
        try {
            chatWebSocketController.notifyStatusChange(
                savedChatRoom.getNo(),
                savedChatRoom.getStatus().toString(),
                admin.getNickname(),
                null
            );
        } catch (Exception e) {
            log.error("❌ 채팅방 상태 변경 알림 전송 실패 - roomNo: {}", savedChatRoom.getNo(), e);
        }
        
        return savedChatRoom;
    }    // 채팅방 거절 (사유 포함)
    public ChatRoom rejectChatRoom(Long chatRoomId, String rejectionReason, Long adminNo) {
        Optional<ChatRoom> result = chatRoomAdminRepository.findById(chatRoomId);
        
        if (result.isEmpty()) {
            throw new RuntimeException("채팅방을 찾을 수 없습니다.");
        }

        ChatRoom chatRoom = result.get();
        
        // 관리자 권한 검증 (WAITING 상태가 아닌 경우에만)
        if (chatRoom.getStatus() != ChatRoom.ChatStatus.WAITING) {
            validateAdminAccess(chatRoom, adminNo);
        }
          // 관리자 정보 조회
        Member admin = memberRepository.findById(adminNo)
                .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다: " + adminNo));
        
        // 관리자 정보와 함께 거절 처리
        chatRoom.rejectChat(admin, rejectionReason);
        ChatRoom savedChatRoom = chatRoomAdminRepository.save(chatRoom);
        
        // 웹소켓을 통해 채팅방 상태 변경 알림 전송
        try {
            chatWebSocketController.notifyStatusChange(
                savedChatRoom.getNo(),
                savedChatRoom.getStatus().toString(),
                admin.getNickname(),
                rejectionReason
            );
        } catch (Exception e) {
            log.error("채팅방 거절 알림 전송 실패 - roomNo: {}", savedChatRoom.getNo(), e);
        }
        
        return savedChatRoom;
    }    // 채팅방 삭제 (물리적 삭제)
    public void deleteChatRoom(Long chatRoomId, Long adminNo) {
        Optional<ChatRoom> result = chatRoomAdminRepository.findById(chatRoomId);
        
        if (result.isPresent()) {
            ChatRoom chatRoom = result.get();
            
            // 관리자 권한 검증 (배정된 관리자가 있는 경우에만)
            if (chatRoom.getAdmin() != null) {
                validateAdminAccess(chatRoom, adminNo);
            }
            
            // 물리적 삭제 수행
            chatRoomAdminRepository.delete(chatRoom);
            
            // 웹소켓을 통해 채팅방 삭제 알림 전송
            try {
                Member admin = memberRepository.findById(adminNo)
                        .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다: " + adminNo));
                  chatWebSocketController.notifyStatusChange(
                    chatRoomId, // 삭제된 후라 savedChatRoom이 없으므로 chatRoomId 사용
                    "DELETED",
                    admin.getNickname(),
                    null
                );
            } catch (Exception e) {
                log.error("채팅방 삭제 알림 전송 실패 - roomNo: {}", chatRoomId, e);
            }
        }
    }    // 이메일로 검색 (member 테이블과 조인)
    @Transactional(readOnly = true)
    public Page<ChatRoom> searchByEmail(int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        return chatRoomAdminRepository.findByMemberEmailContainingOrderByCreatedAtDesc(email, pageable);
    }

    // 관리자 이메일로 검색 (admin 테이블과 조인)
    @Transactional(readOnly = true)
    public Page<ChatRoom> searchByAdminEmail(int page, int size, String adminEmail) {
        Pageable pageable = PageRequest.of(page, size);
        return chatRoomAdminRepository.findByAdminEmailContainingOrderByCreatedAtDesc(adminEmail, pageable);
    }    // 닉네임으로 검색 (member 테이블과 조인)
    @Transactional(readOnly = true)
    public Page<ChatRoom> searchByNickname(int page, int size, String nickname) {
        Pageable pageable = PageRequest.of(page, size);
        return chatRoomAdminRepository.findByMemberNicknameContainingOrderByCreatedAtDesc(nickname, pageable);
    }

    // 전체 검색 (이메일과 닉네임에서 모두 검색)
    @Transactional(readOnly = true)
    public Page<ChatRoom> searchAll(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        return chatRoomAdminRepository.findByKeywordInAllFields(keyword, pageable);
    }

    // 테스트용 더미 데이터 생성
    public void createTestData() {
        // 실제 Member 엔티티가 필요하므로 간단한 테스트 데이터만 생성
        log.info("테스트 데이터 생성은 별도의 Member 엔티티 설정이 필요합니다.");
    }
}