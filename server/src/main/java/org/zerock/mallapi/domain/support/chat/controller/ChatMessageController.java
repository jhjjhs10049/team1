package org.zerock.mallapi.domain.support.chat.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.support.chat.dto.ChatMessageDTO;
import org.zerock.mallapi.domain.support.chat.entity.ChatMessage;
import org.zerock.mallapi.domain.support.chat.service.ChatMessageService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support/chat-message")
@RequiredArgsConstructor
@Log4j2
public class ChatMessageController {

    private final ChatMessageService chatMessageService;    // 메시지 전송
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        Long chatRoomNo = Long.valueOf(request.get("chatRoomNo").toString());
        String message = request.get("message").toString();
        String messageTypeStr = request.get("messageType").toString();
        
        ChatMessage.MessageType messageType = ChatMessage.MessageType.valueOf(messageTypeStr);
        
        log.info("메시지 전송 요청 - roomNo: {}, senderNo: {}, messageType: {}", 
                chatRoomNo, memberDTO.getMemberNo(), messageType);

        ChatMessageDTO sentMessage = chatMessageService.sendMessage(
                chatRoomNo, memberDTO.getMemberNo(), message, messageType);

        log.info("메시지 전송 완료 - messageNo: {}", sentMessage.getNo());
        return ResponseEntity.ok(sentMessage);
    }    // 채팅방의 모든 메시지 조회
    @GetMapping("/room/{chatRoomNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<ChatMessageDTO>> getMessagesByChatRoom(
            @PathVariable Long chatRoomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("채팅방 메시지 목록 조회 요청 - roomNo: {}, memberNo: {}", chatRoomNo, memberDTO.getMemberNo());

        List<ChatMessageDTO> messages = chatMessageService.getMessagesByChatRoomNo(chatRoomNo);
        
        log.info("채팅방 메시지 목록 조회 완료 - roomNo: {}, 메시지 수: {}", chatRoomNo, messages.size());
        return ResponseEntity.ok(messages);
    }    // 채팅방의 읽지 않은 메시지 수 조회
    @GetMapping("/room/{chatRoomNo}/unread-count")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Long>> getUnreadMessageCount(
            @PathVariable Long chatRoomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("읽지 않은 메시지 수 조회 요청 - roomNo: {}, memberNo: {}", chatRoomNo, memberDTO.getMemberNo());

        Long unreadCount = chatMessageService.getUnreadMessageCount(chatRoomNo, memberDTO.getMemberNo());
        
        log.info("읽지 않은 메시지 수 조회 완료 - roomNo: {}, unreadCount: {}", chatRoomNo, unreadCount);
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }    // 메시지 읽음 처리
    @PostMapping("/room/{chatRoomNo}/mark-as-read")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long chatRoomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("메시지 읽음 처리 요청 - roomNo: {}, memberNo: {}", chatRoomNo, memberDTO.getMemberNo());

        chatMessageService.markMessagesAsRead(chatRoomNo, memberDTO.getMemberNo());
        
        log.info("메시지 읽음 처리 완료 - roomNo: {}", chatRoomNo);
        return ResponseEntity.ok().build();
    }    // 메시지 삭제
    @DeleteMapping("/{messageNo}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageNo) {
        
        log.info("메시지 삭제 요청 - messageNo: {}", messageNo);

        chatMessageService.deleteMessage(messageNo);
        
        log.info("메시지 삭제 완료 - messageNo: {}", messageNo);
        return ResponseEntity.ok().build();
    }    // 시스템 메시지 전송 (관리자만)
    @PostMapping("/system")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ChatMessageDTO> sendSystemMessage(@RequestBody Map<String, Object> request) {
        
        Long chatRoomNo = Long.valueOf(request.get("chatRoomNo").toString());
        String message = request.get("message").toString();
        
        log.info("시스템 메시지 전송 요청 - roomNo: {}, message: {}", chatRoomNo, message);

        ChatMessageDTO systemMessage = chatMessageService.sendSystemMessage(chatRoomNo, message);
        
        log.info("시스템 메시지 전송 완료 - messageNo: {}", systemMessage.getNo());
        return ResponseEntity.ok(systemMessage);
    }
}
