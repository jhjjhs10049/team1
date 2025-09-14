package org.zerock.mallapi.domain.multchat.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.multchat.dto.MultChatRoomDTO;
import org.zerock.mallapi.domain.multchat.dto.MultChatMessageDTO;
import org.zerock.mallapi.domain.multchat.service.MultChatRoomService;
import org.zerock.mallapi.domain.multchat.service.MultChatMessageService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/multchat")
@RequiredArgsConstructor
@Log4j2
public class MultChatController {

    private final MultChatRoomService multChatRoomService;
    private final MultChatMessageService multChatMessageService;    // 채팅방 목록 조회 (공개/비공개 모두)
    @GetMapping("/rooms")
    public ResponseEntity<Page<MultChatRoomDTO>> getRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        Long memberNo = memberDTO != null ? memberDTO.getMemberNo() : null;
        log.info("전체 채팅방 목록 조회 - page: {}, size: {}, memberNo: {}", page, size, memberNo);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MultChatRoomDTO> rooms = multChatRoomService.getPublicChatRooms(pageable, memberNo);
            log.info("전체 채팅방 목록 조회 완료 - {} 개", rooms.getTotalElements());
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            log.error("전체 채팅방 목록 조회 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 인기 채팅방 목록 조회
    @GetMapping("/rooms/popular")
    public ResponseEntity<Page<MultChatRoomDTO>> getPopularRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        Long memberNo = memberDTO != null ? memberDTO.getMemberNo() : null;
        log.info("인기 멀티채팅방 목록 조회 - page: {}, size: {}, memberNo: {}", page, size, memberNo);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MultChatRoomDTO> rooms = multChatRoomService.getPopularChatRooms(pageable, memberNo);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            log.error("인기 멀티채팅방 목록 조회 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 최근 활성 채팅방 목록 조회
    @GetMapping("/rooms/recent")
    public ResponseEntity<Page<MultChatRoomDTO>> getRecentRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        Long memberNo = memberDTO != null ? memberDTO.getMemberNo() : null;
        log.info("최근 활성 멀티채팅방 목록 조회 - page: {}, size: {}, memberNo: {}", page, size, memberNo);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MultChatRoomDTO> rooms = multChatRoomService.getRecentActiveChatRooms(pageable, memberNo);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            log.error("최근 활성 멀티채팅방 목록 조회 오류", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 내가 참여 중인 채팅방 목록 조회 (인증 필요)
    @GetMapping("/rooms/my")
    public ResponseEntity<List<MultChatRoomDTO>> getMyChatRooms(
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("내 멀티채팅방 목록 조회 - memberNo: {}", memberDTO.getMemberNo());
        
        try {
            List<MultChatRoomDTO> myRooms = multChatRoomService.getMyChatRooms(memberDTO.getMemberNo());
            log.info("내 멀티채팅방 목록 조회 완료 - {} 개", myRooms.size());
            return ResponseEntity.ok(myRooms);
        } catch (Exception e) {
            log.error("내 멀티채팅방 목록 조회 오류 - memberNo: {}", memberDTO.getMemberNo(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 내가 생성한 채팅방 목록 조회 (인증 필요)
    @GetMapping("/rooms/created")
    public ResponseEntity<List<MultChatRoomDTO>> getMyCreatedChatRooms(
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("내가 생성한 멀티채팅방 목록 조회 - memberNo: {}", memberDTO.getMemberNo());
        
        try {
            List<MultChatRoomDTO> myCreatedRooms = multChatRoomService.getMyCreatedChatRooms(memberDTO.getMemberNo());
            log.info("내가 생성한 멀티채팅방 목록 조회 완료 - {} 개", myCreatedRooms.size());
            return ResponseEntity.ok(myCreatedRooms);
        } catch (Exception e) {
            log.error("내가 생성한 멀티채팅방 목록 조회 오류 - memberNo: {}", memberDTO.getMemberNo(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 채팅방 상세 조회
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<MultChatRoomDTO> getRoomById(
            @PathVariable Long roomId,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("멀티채팅방 상세 조회 - roomId: {}", roomId);
        
        try {
            MultChatRoomDTO room = multChatRoomService.getChatRoomById(roomId, memberDTO.getMemberNo());
            if (room != null) {
                return ResponseEntity.ok(room);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("멀티채팅방 상세 조회 오류 - roomId: {}", roomId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 채팅방 생성 (인증 필요)
    @PostMapping("/rooms")
    public ResponseEntity<MultChatRoomDTO> createRoom(
            @RequestBody MultChatRoomDTO request,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("멀티채팅방 생성 요청 - memberNo: {}, roomType: {}, hasPassword: {}", 
                memberDTO.getMemberNo(), request.getRoomType(), request.isHasPassword());
        
        try {
            MultChatRoomDTO room = multChatRoomService.createChatRoom(request, memberDTO.getMemberNo());
            log.info("멀티채팅방 생성 완료 - roomId: {}", room.getNo());
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            log.error("멀티채팅방 생성 오류 - memberNo: {}, error: {}", memberDTO.getMemberNo(), e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 채팅방 입장 (인증 필요)
    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<Map<String, Object>> joinRoom(
            @PathVariable Long roomId,
            @RequestBody(required = false) Map<String, String> request,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("멀티채팅방 입장 요청 - roomId: {}, memberNo: {}", roomId, memberDTO.getMemberNo());
        
        try {
            String password = request != null ? request.get("password") : null;
            MultChatRoomDTO room = multChatRoomService.joinChatRoom(roomId, memberDTO.getMemberNo(), password);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "채팅방에 성공적으로 입장했습니다.",
                "room", room
            ));
        } catch (Exception e) {
            log.error("멀티채팅방 입장 오류 - roomId: {}, memberNo: {}", roomId, memberDTO.getMemberNo(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // 채팅방 퇴장 (인증 필요)
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<Map<String, Object>> leaveRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("멀티채팅방 퇴장 요청 - roomId: {}, memberNo: {}", roomId, memberDTO.getMemberNo());
        
        try {
            multChatRoomService.leaveChatRoom(roomId, memberDTO.getMemberNo());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "채팅방에서 나갔습니다."
            ));
        } catch (RuntimeException e) {
            log.error("멀티채팅방 퇴장 오류 - roomId: {}, memberNo: {}", roomId, memberDTO.getMemberNo(), e);
            
            // 비즈니스 로직 에러의 경우 400 Bad Request 반환
            if (e.getMessage().contains("참가 중이지 않은") || e.getMessage().contains("찾을 수 없습니다")) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
            }
            
            // 기타 런타임 에러의 경우 500 Internal Server Error
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "서버 오류가 발생했습니다."
            ));
        } catch (Exception e) {
            log.error("멀티채팅방 퇴장 예상치 못한 오류 - roomId: {}, memberNo: {}", roomId, memberDTO.getMemberNo(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "서버 오류가 발생했습니다."
            ));
        }
    }

    // ===== 메시지 관련 API =====
    
    // 채팅방 메시지 목록 조회
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<MultChatMessageDTO>> getChatMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("채팅방 메시지 목록 조회 - roomId: {}, page: {}, size: {}", roomId, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MultChatMessageDTO> messages = multChatMessageService.getMessagesByChatRoom(roomId, memberDTO.getMemberNo(), pageable);
            log.info("채팅방 메시지 목록 조회 완료 - {} 개", messages.getTotalElements());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("채팅방 메시지 목록 조회 오류 - roomId: {}", roomId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 채팅방 최근 메시지 조회
    @GetMapping("/rooms/{roomId}/messages/recent")
    public ResponseEntity<List<MultChatMessageDTO>> getRecentMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("채팅방 최근 메시지 조회 - roomId: {}, limit: {}", roomId, limit);
        
        try {
            List<MultChatMessageDTO> messages = multChatMessageService.getRecentMessages(roomId, memberDTO.getMemberNo(), limit);
            log.info("채팅방 최근 메시지 조회 완료 - {} 개", messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("채팅방 최근 메시지 조회 오류 - roomId: {}", roomId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 읽지 않은 메시지 수 조회
    @GetMapping("/rooms/{roomId}/messages/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadMessageCount(
            @PathVariable Long roomId,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("읽지 않은 메시지 수 조회 - roomId: {}", roomId);
        
        try {
            Long unreadCount = multChatMessageService.getUnreadMessageCount(roomId, memberDTO.getMemberNo());
            return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
        } catch (Exception e) {
            log.error("읽지 않은 메시지 수 조회 오류 - roomId: {}", roomId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 메시지 읽음 처리
    @PostMapping("/rooms/{roomId}/messages/mark-read")
    public ResponseEntity<Map<String, Object>> markMessagesAsRead(
            @PathVariable Long roomId,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("메시지 읽음 처리 - roomId: {}", roomId);
        
        try {
            multChatMessageService.markMessagesAsRead(roomId, memberDTO.getMemberNo());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("메시지 읽음 처리 오류 - roomId: {}", roomId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 메시지 삭제
    @DeleteMapping("/messages/{messageNo}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable Long messageNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("메시지 삭제 - messageNo: {}", messageNo);
        
        try {
            multChatMessageService.deleteMessage(messageNo, memberDTO.getMemberNo());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("메시지 삭제 오류 - messageNo: {}", messageNo, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 사용자의 채팅방 참가 상태 확인
    @GetMapping("/rooms/{roomNo}/participation-status")
    public ResponseEntity<Map<String, Object>> getParticipationStatus(
            @PathVariable Long roomNo,
            @AuthenticationPrincipal MemberDTO memberDTO) {
        
        log.info("참가 상태 확인 - roomNo: {}, memberNo: {}", roomNo, memberDTO.getMemberNo());
        
        try {
            boolean isParticipating = multChatRoomService.isUserParticipating(roomNo, memberDTO.getMemberNo());
            return ResponseEntity.ok(Map.of(
                "isParticipating", isParticipating,
                "roomNo", roomNo,
                "memberNo", memberDTO.getMemberNo()
            ));
        } catch (Exception e) {
            log.error("참가 상태 확인 오류 - roomNo: {}, memberNo: {}", roomNo, memberDTO.getMemberNo(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
