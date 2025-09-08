package org.zerock.mallapi.domain.admin.chat.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom;
import org.zerock.mallapi.domain.admin.chat.service.ChatAdminService;
import org.zerock.mallapi.domain.member.dto.MemberDTO;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/admin/chat")
public class ChatAdminController {

    private final ChatAdminService chatAdminService;

    // 채팅방 목록 조회
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/list")
    public Page<ChatRoom> getChatRoomList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("채팅방 목록 조회 - page: " + page + ", size: " + size);
        return chatAdminService.getChatRoomList(page, size);
    }

    // 상태별 채팅방 조회 (WAITING, ACTIVE, ENDED)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/list/{status}")
    public Page<ChatRoom> getChatRoomListByStatus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable String status) {
        log.info("상태별 채팅방 조회 - 상태: " + status);
        ChatRoom.ChatStatus chatStatus = ChatRoom.ChatStatus.valueOf(status.toUpperCase());
        return chatAdminService.getChatRoomListByStatus(page, size, chatStatus);
    }    // 채팅방 상태 변경 (관리자 입장/종료)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{chatRoomId}/status")
    public ResponseEntity<ChatRoom> updateChatRoomStatus(
            @PathVariable Long chatRoomId,
            @RequestBody String status) {
        try {
            // 현재 로그인된 관리자 정보 가져오기
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            MemberDTO memberDTO = (MemberDTO) auth.getPrincipal();
            Long adminNo = memberDTO.getMemberNo();
            
            ChatRoom.ChatStatus chatStatus = ChatRoom.ChatStatus.valueOf(status.replace("\"", ""));
            ChatRoom updated = chatAdminService.updateChatRoomStatus(chatRoomId, chatStatus, adminNo);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("채팅방 상태 변경 실패 - ID: {}, 오류: {}", chatRoomId, e.getMessage());
            throw e;
        }
    }// 채팅방 거절 (사유 포함)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{chatRoomId}/reject")
    public ResponseEntity<Map<String, Object>> rejectChatRoom(
            @PathVariable Long chatRoomId,
            @RequestBody String rejectionReason) {        log.info("채팅방 거절 요청 - ID: {}", chatRoomId);
          // 현재 로그인된 관리자 정보 가져오기
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        MemberDTO memberDTO = (MemberDTO) auth.getPrincipal();
        Long adminNo = memberDTO.getMemberNo();
        
        String reason = rejectionReason.replace("\"", ""); // JSON 문자열 처리
        
        ChatRoom updated = chatAdminService.rejectChatRoom(chatRoomId, reason, adminNo);
        log.info("채팅방 거절 완료 - ID: {}", updated.getNo());
        
        // 응답 데이터를 Map으로 구성
        Map<String, Object> response = new HashMap<>();
        response.put("no", updated.getNo());
        response.put("status", updated.getStatus());
        response.put("rejectionReason", updated.getRejectionReason());
        response.put("rejectedAt", updated.getRejectedAt());
        response.put("adminNickname", updated.getAdmin() != null ? updated.getAdmin().getNickname() : null);
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }    // 채팅방 삭제 (소프트 삭제)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<String> deleteChatRoom(@PathVariable Long chatRoomId) {
        try {
            // 현재 로그인된 관리자 정보 가져오기
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            MemberDTO memberDTO = (MemberDTO) auth.getPrincipal();
            Long adminNo = memberDTO.getMemberNo();
            
            log.info("채팅방 삭제 - ID: {}, 관리자 No: {}", chatRoomId, adminNo);
            chatAdminService.deleteChatRoom(chatRoomId, adminNo);
            return ResponseEntity.ok("채팅방이 삭제되었습니다.");
        } catch (Exception e) {
            log.error("채팅방 삭제 실패 - ID: {}, 오류: {}", chatRoomId, e.getMessage());
            throw e;
        }
    }    // 검색 기능 (타입별)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/search")
    public Page<ChatRoom> search(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam String type,
            @RequestParam String keyword) {
        log.info("검색 - 타입: {}, 키워드: {}", type, keyword);
        
        switch (type.toLowerCase()) {
            case "email":
                return chatAdminService.searchByEmail(page, size, keyword);
            case "admin":
                return chatAdminService.searchByAdminEmail(page, size, keyword);
            case "nickname":
                return chatAdminService.searchByNickname(page, size, keyword);
            case "all":
            default:
                // 전체 검색 - 이메일, 닉네임에서 모두 검색
                return chatAdminService.searchAll(page, size, keyword);
        }
    }

    // 테스트용 더미 데이터 생성
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/test-data")
    public ResponseEntity<String> createTestData() {
        log.info("테스트 데이터 생성");
        chatAdminService.createTestData();
        return ResponseEntity.ok("테스트 데이터가 생성되었습니다.");
    }
}
