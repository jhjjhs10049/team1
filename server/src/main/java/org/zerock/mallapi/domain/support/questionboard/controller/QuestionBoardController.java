package org.zerock.mallapi.domain.support.questionboard.controller;

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
import org.zerock.mallapi.domain.support.questionboard.dto.QuestionBoardDTO;
import org.zerock.mallapi.domain.support.questionboard.service.QuestionBoardService;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/support/faq")
@Log4j2
public class QuestionBoardController {

    private final QuestionBoardService questionBoardService;
    private final MemberRepository memberRepository;

    // FAQ 목록 조회 (페이징)
    @GetMapping
    public ResponseEntity<Page<QuestionBoardDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        
        log.info("FAQ 목록 요청 - page: {}, size: {}, keyword: {}", page, size, keyword);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<QuestionBoardDTO> result;
        if (keyword != null && !keyword.trim().isEmpty()) {
            result = questionBoardService.searchQuestions(keyword.trim(), pageable);
        } else {
            result = questionBoardService.getQuestionList(pageable);
        }
        
        log.info("FAQ 목록 응답 - 총 {}개", result.getTotalElements());
        return ResponseEntity.ok(result);
    }

    // FAQ 전체 목록 조회 (프론트엔드 설명판용)
    @GetMapping("/all")
    public ResponseEntity<List<QuestionBoardDTO>> listAll() {
        log.info("전체 FAQ 목록 요청");
        
        List<QuestionBoardDTO> questions = questionBoardService.getAllQuestions();
        
        log.info("전체 FAQ 목록 응답 - {}개", questions.size());
        return ResponseEntity.ok(questions);
    }    // FAQ 개별 조회
    @GetMapping("/{no}")
    public ResponseEntity<QuestionBoardDTO> get(@PathVariable Long no) {
        log.info("FAQ 개별 조회 요청 - no: {}", no);
        
        QuestionBoardDTO question = questionBoardService.getQuestion(no);
        
        return ResponseEntity.ok(question);
    }

    // FAQ 등록 (관리자용)
    public record CreateQuestionRequest(String question, String answer) {}
    
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<Void> create(
            @RequestBody CreateQuestionRequest request,
            @AuthenticationPrincipal MemberDTO me) {
        
        log.info("FAQ 등록 요청: {}", request);
        
        // 현재 사용자 정보 조회
        Long currentUserId = memberRepository.findByEmail(me.getEmail())
                .map(Member::getMemberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        
        QuestionBoardDTO questionDTO = QuestionBoardDTO.builder()
                .question(request.question())
                .answer(request.answer())
                .writerNo(currentUserId)
                .build();
        
        QuestionBoardDTO createdQuestion = questionBoardService.createQuestion(questionDTO);
        
        log.info("FAQ 등록 완료 - no: {}", createdQuestion.getNo());
        return ResponseEntity.created(URI.create("/api/support/faq/" + createdQuestion.getNo())).build();
    }

    // FAQ 수정 (관리자용)
    public record UpdateQuestionRequest(String question, String answer) {}
    
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{no}")
    public ResponseEntity<Void> update(
            @PathVariable Long no,
            @RequestBody UpdateQuestionRequest request,
            @AuthenticationPrincipal MemberDTO me) {
        
        log.info("FAQ 수정 요청 - no: {}, data: {}", no, request);
        
        // 현재 사용자 정보 조회
        Long currentUserId = memberRepository.findByEmail(me.getEmail())
                .map(Member::getMemberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
        
        QuestionBoardDTO questionDTO = QuestionBoardDTO.builder()
                .question(request.question())
                .answer(request.answer())
                .writerNo(currentUserId)
                .build();
        
        questionBoardService.updateQuestion(no, questionDTO);
        
        log.info("FAQ 수정 완료 - no: {}", no);
        return ResponseEntity.noContent().build();
    }

    // FAQ 삭제 (관리자용)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @DeleteMapping("/{no}")
    public ResponseEntity<Void> delete(@PathVariable Long no) {
        log.info("FAQ 삭제 요청 - no: {}", no);
        
        questionBoardService.deleteQuestion(no);
        
        log.info("FAQ 삭제 완료 - no: {}", no);
        return ResponseEntity.noContent().build();
    }
}
