package org.zerock.mallapi.domain.support.chat.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.support.chat.dto.ChatRoomDTO;
import org.zerock.mallapi.domain.support.chat.service.ChatRoomService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support/chat-room")
@RequiredArgsConstructor
@Log4j2
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    // 사전 질문으로부터 채팅방 생성
    @PostMapping("/create-from-question")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ChatRoomDTO> createChatRoomFromQuestion(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("사전 질문으로부터 채팅방 생성 요청 - memberNo: {}", memberDTO.getMemberNo());

        String questionType = request.get("questionType");
        String questionDetail = request.get("questionDetail");

        ChatRoomDTO chatRoom = chatRoomService.createChatRoomFromQuestion(
                memberDTO.getMemberNo(), questionType, questionDetail);

        log.info("채팅방 생성 완료 - roomNo: {}", chatRoom.getNo());
        return ResponseEntity.ok(chatRoom);
    }

    // 회원의 활성화된 채팅방 조회
    @GetMapping("/active")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ChatRoomDTO> getActiveChatRoom(@AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("활성화된 채팅방 조회 요청 - memberNo: {}", memberDTO.getMemberNo());

        ChatRoomDTO chatRoom = chatRoomService.getActiveChatRoomByMemberNo(memberDTO.getMemberNo());
        
        if (chatRoom != null) {
            log.info("활성화된 채팅방 조회 완료 - roomNo: {}", chatRoom.getNo());
            return ResponseEntity.ok(chatRoom);
        } else {
            log.info("활성화된 채팅방이 없음");
            return ResponseEntity.noContent().build();
        }
    }

    // 회원의 모든 채팅방 목록 조회
    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ChatRoomDTO>> getMyChatRooms(@AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("내 채팅방 목록 조회 요청 - memberNo: {}", memberDTO.getMemberNo());

        List<ChatRoomDTO> chatRooms = chatRoomService.getChatRoomsByMemberNo(memberDTO.getMemberNo());
        
        log.info("내 채팅방 목록 조회 완료 - 채팅방 수: {}", chatRooms.size());
        return ResponseEntity.ok(chatRooms);
    }    // 채팅방 상세 조회
    @GetMapping("/{chatRoomNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ChatRoomDTO> getChatRoomById(
            @PathVariable Long chatRoomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("채팅방 상세 조회 요청 - roomNo: {}, memberNo: {}", chatRoomNo, memberDTO.getMemberNo());

        ChatRoomDTO chatRoom = chatRoomService.getChatRoomById(chatRoomNo);
        log.info("조회된 채팅방 상태 - roomNo: {}, status: {}, rejectionReason: {}", 
                 chatRoom.getNo(), chatRoom.getStatus(), chatRoom.getRejectionReason());
        
        // 권한 체크: 해당 채팅방의 참여자인지 확인
        boolean isOwner = chatRoom.getMemberNo().equals(memberDTO.getMemberNo());
        boolean isAssignedAdmin = chatRoom.getAdminNo() != null && chatRoom.getAdminNo().equals(memberDTO.getMemberNo());
        boolean isAdmin = memberDTO.getRoleNames().contains("ADMIN");
        
        // 채팅방 소유자이거나, 배정된 관리자이거나, 관리자 권한이 있는 경우 접근 허용
        if (!isOwner && !isAssignedAdmin && !isAdmin) {
            log.warn("채팅방 접근 권한 없음 - roomNo: {}, memberNo: {}", chatRoomNo, memberDTO.getMemberNo());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("채팅방 상세 조회 완료 - roomNo: {}", chatRoom.getNo());
        return ResponseEntity.ok(chatRoom);
    }    // 채팅방 삭제
    @DeleteMapping("/{chatRoomNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteChatRoom(
            @PathVariable Long chatRoomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("채팅방 삭제 요청 - roomNo: {}, memberNo: {}", chatRoomNo, memberDTO.getMemberNo());

        // 권한 체크는 서비스에서 처리
        chatRoomService.deleteChatRoom(chatRoomNo);
        
        log.info("채팅방 삭제 완료 - roomNo: {}", chatRoomNo);
        return ResponseEntity.ok().build();
    }

    // === 관리자용 API ===    // 대기중인 채팅방 목록 조회 (관리자용)
    @GetMapping("/admin/waiting")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<ChatRoomDTO>> getWaitingChatRooms() {
        
        log.info("대기중인 채팅방 목록 조회 요청 (관리자)");

        List<ChatRoomDTO> chatRooms = chatRoomService.getWaitingChatRooms();
        
        log.info("대기중인 채팅방 목록 조회 완료 - 채팅방 수: {}", chatRooms.size());
        return ResponseEntity.ok(chatRooms);
    }    // 진행중인 채팅방 목록 조회 (관리자용)
    @GetMapping("/admin/active")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<ChatRoomDTO>> getActiveChatRooms() {
        
        log.info("진행중인 채팅방 목록 조회 요청 (관리자)");

        List<ChatRoomDTO> chatRooms = chatRoomService.getActiveChatRooms();
        
        log.info("진행중인 채팅방 목록 조회 완료 - 채팅방 수: {}", chatRooms.size());
        return ResponseEntity.ok(chatRooms);
    }    // 관리자가 담당하는 채팅방 목록 조회
    @GetMapping("/admin/my")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<ChatRoomDTO>> getAdminChatRooms(@AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("관리자 담당 채팅방 목록 조회 요청 - adminNo: {}", memberDTO.getMemberNo());

        List<ChatRoomDTO> chatRooms = chatRoomService.getChatRoomsByAdminNo(memberDTO.getMemberNo());
        
        log.info("관리자 담당 채팅방 목록 조회 완료 - 채팅방 수: {}", chatRooms.size());
        return ResponseEntity.ok(chatRooms);
    }    // 관리자가 채팅방에 입장하여 채팅 시작
    @PostMapping("/{chatRoomNo}/start")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ChatRoomDTO> startChat(
            @PathVariable Long chatRoomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("채팅 시작 요청 - roomNo: {}, adminNo: {}", chatRoomNo, memberDTO.getMemberNo());

        ChatRoomDTO chatRoom = chatRoomService.startChat(chatRoomNo, memberDTO.getMemberNo());
        
        log.info("채팅 시작 완료 - roomNo: {}", chatRoom.getNo());
        return ResponseEntity.ok(chatRoom);
    }    // 채팅방 종료
    @PostMapping("/{chatRoomNo}/end")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ChatRoomDTO> endChat(
            @PathVariable Long chatRoomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("채팅 종료 요청 - roomNo: {}, memberNo: {}", chatRoomNo, memberDTO.getMemberNo());

        ChatRoomDTO chatRoom = chatRoomService.endChat(chatRoomNo, memberDTO.getMemberNo());
        
        log.info("채팅 종료 완료 - roomNo: {}", chatRoom.getNo());
        return ResponseEntity.ok(chatRoom);
    }
}
