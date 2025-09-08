package org.zerock.mallapi.domain.board.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.board.dto.ReplyDto;
import org.zerock.mallapi.domain.board.entity.Reply;
import org.zerock.mallapi.domain.board.service.ReplyService;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board/{boardId}/replies")
@Log4j2
public class ReplyController {

    private final ReplyService replyService;
    private final MemberRepository memberRepository;    // 목록 (페이징 지원)
    @GetMapping
    public ResponseEntity<Page<ReplyDto>> list(
            @PathVariable Long boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        
        // 댓글은 생성일 기준 오름차순 정렬 (오래된 댓글부터)
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        
        Page<Reply> replyPage = replyService.list(boardId, pageable);
        Page<ReplyDto> body = replyPage.map(this::toReplyDto);
        
        return ResponseEntity.ok(body);
    }

    public record CreateReplyRequest(Long writerId, String content) {
    }    @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
    @PostMapping
    public ResponseEntity<Void> create(@PathVariable Long boardId,
            @RequestBody CreateReplyRequest req,
            @AuthenticationPrincipal MemberDTO me) {
        
        log.info("=== 댓글 생성 요청 ===");
        log.info("게시글 ID: {}, 요청자: {}, 내용: {}", boardId, me.getEmail(), req.content());
        
        // email → memberNo 조회 (req.writerId는 무시)
        Long writerId = memberRepository.findByEmail(me.getEmail())
                .map(Member::getMemberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        Long id = replyService.create(boardId, writerId, req.content());
        
        log.info("=== 댓글 생성 완료, ID: {} ===", id);
        return ResponseEntity.created(URI.create("/api/replies/" + id)).build();
    }

    public record UpdateReplyRequest(String content) {
    }

    @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
    @PutMapping("/{replyId}")
    public ResponseEntity<Void> update(@PathVariable Long boardId,
            @PathVariable Long replyId,
            @RequestBody UpdateReplyRequest req,
            @AuthenticationPrincipal MemberDTO me) {
        // email → memberNo 조회
        Long currentUserId = memberRepository.findByEmail(me.getEmail())
                .map(Member::getMemberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        replyService.update(replyId, req.content(), currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
    @DeleteMapping("/{replyId}")
    public ResponseEntity<Void> delete(@PathVariable Long boardId,
            @PathVariable Long replyId,
            @AuthenticationPrincipal MemberDTO me) {
        // email → memberNo 조회
        Long currentUserId = memberRepository.findByEmail(me.getEmail())
                .map(Member::getMemberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        boolean isAdmin = me.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        replyService.delete(replyId, currentUserId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    private ReplyDto toReplyDto(Reply r) {
        Long writerPk = r.getWriter().getMemberNo();
        Long boardPk = r.getBoard().getId();
        String writerEmail = r.getWriter().getEmail(); // 🔹 추가
        return new ReplyDto(
                r.getId(),
                boardPk,
                writerPk,
                writerEmail, // 🔹 추가
                r.getContent(),
                r.getCreatedAt(),
                r.getUpdatedAt());
    }
}
