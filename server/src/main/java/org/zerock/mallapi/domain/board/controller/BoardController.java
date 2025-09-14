package org.zerock.mallapi.domain.board.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.zerock.mallapi.domain.board.dto.BoardDetailDto;
import org.zerock.mallapi.domain.board.dto.BoardDto;
import org.zerock.mallapi.domain.board.dto.BoardImageDto;
import org.zerock.mallapi.domain.board.dto.ReplyDto;
import org.zerock.mallapi.domain.board.entity.Board;
import org.zerock.mallapi.domain.board.entity.BoardImage;
import org.zerock.mallapi.domain.board.entity.Reply;
import org.zerock.mallapi.domain.board.service.BoardService;
import org.zerock.mallapi.domain.board.service.ReplyService;
import org.zerock.mallapi.domain.board.repository.ReplyRepository;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import java.util.List;
import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board")
@Log4j2
public class BoardController {        private final BoardService boardService;
        private final ReplyService replyService;        private final MemberRepository memberRepository;
        private final ReplyRepository replyRepository;

        // 목록 (검색 q, type, page/size)
        @GetMapping
        public ResponseEntity<Page<BoardDto>> list(
                        @RequestParam(required = false) String q,
                        @RequestParam(required = false, defaultValue = "all") String type,
                        @RequestParam(defaultValue = "0") int page, // 0부터 시작
                        @RequestParam(defaultValue = "10") int size) {

                log.info("게시판 목록 요청 - q: {}, type: {}, page: {}, size: {}", q, type, page, size);
                Page<Board> result = boardService.list(page, size, q, type);
                Page<BoardDto> body = result.map(
                                b -> toBoardDto(b, boardService.getImages(b.getId())));
                log.info("게시판 목록 응답 - 총 {}개", body.getTotalElements());
                return ResponseEntity.ok(body);
        }

        // 단건
        @GetMapping("/{boardId}")
        public ResponseEntity<BoardDetailDto> get(@PathVariable Long boardId) {
                Board b = boardService.get(boardId);
                List<BoardImage> images = boardService.getImages(boardId); // ord ASC
                List<Reply> replies = replyService.listAll(boardId); // createdAt ASC

                BoardDetailDto dto = toBoardDetailDto(b, images, replies);
                
                return ResponseEntity.ok(dto);
        }

        // 생성요청 바디
        public record CreateBoardRequest(String title, String content, List<String> images, 
                                       Double locationLat, Double locationLng, String locationAddress) {
        }        
        @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
        @PostMapping
        public ResponseEntity<Void> create(
                        @RequestBody CreateBoardRequest req,
                        @AuthenticationPrincipal MemberDTO me) {

                log.info("=== 게시글 생성 요청 ===");
                log.info("요청자: {}, 제목: {}", me.getEmail(), req.title());

                Long writerId = memberRepository.findByEmail(me.getEmail())
                                .map(Member::getMemberNo)
                                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

                Long id = boardService.create(
                                writerId,
                                req.title(),
                                req.content(),
                                req.images() == null ? List.of() : req.images(),
                                req.locationLat(),
                                req.locationLng(),
                                req.locationAddress());
                
                log.info("=== 게시글 생성 완료, ID: {} ===", id);
                return ResponseEntity.created(URI.create("/api/boards/" + id)).build();
        }

        public record UpdateBoardRequest(String title, String content, List<String> images,
                                        Double locationLat, Double locationLng, String locationAddress) {
        }        
          @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
        @PutMapping("/{boardId}")
        public ResponseEntity<Void> update(
                        @PathVariable Long boardId,
                        @RequestBody UpdateBoardRequest req,
                        @AuthenticationPrincipal MemberDTO me) {

                log.info("=== 게시글 수정 요청 ===");
                log.info("boardId: {}", boardId);
                log.info("요청자: {}", me.getEmail());
                log.info("요청 데이터: title={}, content={}, images={}", req.title(), req.content(), req.images());

                try {
                        Long currentUserId = memberRepository.findByEmail(me.getEmail())
                                        .map(Member::getMemberNo)
                                        .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

                        log.info("현재 사용자 ID: {}", currentUserId);

                        boardService.update(
                                        boardId,
                                        req.title(),
                                        req.content(),
                                        req.images() == null ? List.of() : req.images(),
                                        currentUserId,
                                        req.locationLat(),
                                        req.locationLng(),
                                        req.locationAddress());
                        
                        log.info("=== 게시글 수정 완료 ===");
                        return ResponseEntity.noContent().build();
                } catch (Exception e) {
                        log.error("=== 게시글 수정 실패 ===", e);
                        throw e;
                }
        }
        
        @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
        @DeleteMapping("/{boardId}")
        public ResponseEntity<Void> delete(
                        @PathVariable Long boardId,
                        @AuthenticationPrincipal MemberDTO me) {

                // [김정오 수정] email → memberNo 조회 (기존 me.getMemberNo() 사용 제거)
                Long currentUserId = memberRepository.findByEmail(me.getEmail())
                                .map(Member::getMemberNo)
                                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

                boolean isAdmin = me.getAuthorities().stream()
                                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

                boardService.delete(boardId, currentUserId, isAdmin);
                return ResponseEntity.noContent().build();
        }        private BoardDto toBoardDto(Board b, List<BoardImage> images) {
                List<BoardImageDto> imageDtos = images.stream()
                                .map(img -> new BoardImageDto(img.getId(), img.getFileName(), img.getOrd()))
                                .toList();                // 댓글 개수 계산 (삭제되지 않은 댓글만)
                Long replyCount = replyRepository.countByBoardAndIsDeletedFalse(b);
                
                return new BoardDto(
                        b.getId(), // bno
                        b.getWriter().getMemberNo(), // writerId
                        b.getTitle(), // title
                        b.getContent(), // content
                        b.getWriter().getEmail(), // writerEmail
                        b.getWriter().getNickname(), // writerName
                        b.getViewCount(), // viewCount
                        replyCount, // replyCount
                        b.getPostType(), // postType으로 변경
                        imageDtos, // images
                        b.getCreatedAt(), // regDate
                        b.getUpdatedAt(), // modDate
                        b.getLocationLat(), // locationLat
                        b.getLocationLng(), // locationLng
                        b.getLocationAddress() // locationAddress
                );
        }

        private BoardDetailDto toBoardDetailDto(Board b, List<BoardImage> images, List<Reply> replies) {
                List<BoardImageDto> imageDtos = images.stream()
                                .map(img -> new BoardImageDto(img.getId(), img.getFileName(), img.getOrd()))
                                .toList();

                List<ReplyDto> replyDtos = replies.stream()
                                .map(r -> new ReplyDto(
                                                r.getId(), // id
                                                b.getId(), // boardId
                                                r.getWriter().getMemberNo(), // writerId
                                                r.getWriter().getEmail(), // writerEmail
                                                r.getContent(), // content
                                                r.getCreatedAt(), // createdAt
                                                r.getUpdatedAt() // updatedAt
                                ))
                                .toList();                return new BoardDetailDto(
                                b.getId(),
                                b.getWriter().getMemberNo(),
                                b.getWriter().getEmail(),
                                b.getTitle(),
                                b.getContent(),
                                b.getWriter().getNickname(), // writerName 필드 채움
                                b.getViewCount(), // viewCount 추가
                                b.getPostType(), // postType으로 변경
                                imageDtos,
                                replyDtos,
                                b.getCreatedAt(),
                                b.getUpdatedAt(),
                                b.getLocationLat(), // locationLat
                                b.getLocationLng(), // locationLng
                                b.getLocationAddress() // locationAddress
                );
        }        
        
        // 조회수 증가
        @PostMapping("/{boardId}/view")
        public ResponseEntity<Void> increaseViewCount(@PathVariable Long boardId) {
                log.info("조회수 증가 요청 - boardId: {}", boardId);
                try {
                        boardService.increaseViewCount(boardId);
                        log.info("조회수 증가 완료 - boardId: {}", boardId);
                        return ResponseEntity.ok().build();
                } catch (Exception e) {
                        log.error("조회수 증가 실패 - boardId: {}, error: {}", boardId, e.getMessage());
                        return ResponseEntity.notFound().build();
                }
        }
          // 공지사항 생성 - 관리자/매니저만 가능
        public record CreateNoticeRequest(String title, String content, List<String> images, String type) {
        }
        
        @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
        @PostMapping("/notice")
        public ResponseEntity<Void> createNotice(
                        @RequestBody CreateNoticeRequest req,
                        @AuthenticationPrincipal MemberDTO me) {

                log.info("=== 공지/광고 생성 요청 ===");
                log.info("요청자: {}, 제목: {}, 타입: {}", me.getEmail(), req.title(), req.type());

                Long writerId = memberRepository.findByEmail(me.getEmail())
                                .map(Member::getMemberNo)
                                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

                Long id;
                if ("AD".equals(req.type())) {
                        id = boardService.createAd(
                                        writerId,
                                        req.title(),
                                        req.content(),
                                        req.images() == null ? List.of() : req.images());
                } else {
                        id = boardService.createNotice(
                                        writerId,
                                        req.title(),
                                        req.content(),
                                        req.images() == null ? List.of() : req.images());
                }
                
                log.info("=== 공지/광고 생성 완료, ID: {}, 타입: {} ===", id, req.type());
                return ResponseEntity.created(URI.create("/api/board/notice/" + id)).build();
        }
        
        // 공지사항 목록 조회
        @GetMapping("/notices")
        public ResponseEntity<List<BoardDto>> getNotices() {
                log.info("공지사항 목록 요청");
                List<Board> notices = boardService.getNotices();
                List<BoardDto> noticeDtos = notices.stream()
                        .map(board -> toBoardDto(board, boardService.getImages(board.getId())))
                        .toList();
                
                log.info("공지사항 목록 응답 - 총 {}개", noticeDtos.size());
                return ResponseEntity.ok(noticeDtos);
        }
        
        // 광고 목록 조회
        @GetMapping("/ads")
        public ResponseEntity<List<BoardDto>> getAds() {
                log.info("광고 목록 요청");
                List<Board> ads = boardService.getAds();
                List<BoardDto> adDtos = ads.stream()
                        .map(board -> toBoardDto(board, boardService.getImages(board.getId())))
                        .toList();
                
                log.info("광고 목록 응답 - 총 {}개", adDtos.size());
                return ResponseEntity.ok(adDtos);
        }
}
