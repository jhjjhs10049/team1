package org.zerock.mallapi.domain.support.prequestion.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.support.prequestion.dto.ChatQuestionDTO;
import org.zerock.mallapi.domain.support.prequestion.service.ChatQuestionService;
import org.zerock.mallapi.domain.member.dto.MemberDTO;

import java.util.List;

@RestController
@RequestMapping("/api/support/chat-question")
@RequiredArgsConstructor
@Log4j2
public class ChatQuestionController {

    private final ChatQuestionService chatQuestionService;

    // 채팅 질문 답변 등록 (로그인 필요)
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ChatQuestionDTO> createChatQuestion(
            @RequestBody ChatQuestionDTO chatQuestionDTO,
            @AuthenticationPrincipal MemberDTO memberDTO) {

        log.info("채팅 질문 답변 등록 요청 - memberNo: {}", memberDTO.getMemberNo());

        // 현재 로그인한 사용자의 정보로 설정
        chatQuestionDTO.setMemberNo(memberDTO.getMemberNo());

        ChatQuestionDTO result = chatQuestionService.createChatQuestion(chatQuestionDTO);

        return ResponseEntity.ok(result);
    }

    // 모든 채팅 질문 조회 (관리자용)
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ChatQuestionDTO>> getAllChatQuestions() {
        log.info("모든 채팅 질문 조회 요청");

        List<ChatQuestionDTO> result = chatQuestionService.getAllChatQuestions();

        return ResponseEntity.ok(result);
    }

    // 채팅 질문 목록 조회 (페이징, 관리자용)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<ChatQuestionDTO>> getChatQuestionList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "no") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.info("채팅 질문 목록 조회 - page: {}, size: {}", page, size);

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ChatQuestionDTO> result = chatQuestionService.getChatQuestionList(pageable);

        return ResponseEntity.ok(result);
    }

    // 특정 채팅 질문 조회
    @GetMapping("/{no}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<ChatQuestionDTO> getChatQuestion(@PathVariable Long no) {
        log.info("채팅 질문 조회 - no: {}", no);

        ChatQuestionDTO result = chatQuestionService.getChatQuestion(no);

        return ResponseEntity.ok(result);
    }

    // 내 채팅 질문 조회 (로그인한 사용자)
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<ChatQuestionDTO>> getMyChatQuestions(
            @AuthenticationPrincipal MemberDTO memberDTO) {

        log.info("내 채팅 질문 조회 - memberNo: {}", memberDTO.getMemberNo());

        List<ChatQuestionDTO> result = chatQuestionService.getChatQuestionsByMember(memberDTO.getMemberNo());

        return ResponseEntity.ok(result);
    }

    // 채팅 질문 삭제 (관리자용)
    @DeleteMapping("/{no}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<String> deleteChatQuestion(@PathVariable Long no) {
        log.info("채팅 질문 삭제 요청 - no: {}", no);

        chatQuestionService.deleteChatQuestion(no);

        return ResponseEntity.ok("채팅 질문이 삭제되었습니다.");
    }
}
