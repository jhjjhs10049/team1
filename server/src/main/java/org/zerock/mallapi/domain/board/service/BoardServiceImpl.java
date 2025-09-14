package org.zerock.mallapi.domain.board.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.board.entity.Board;
import org.zerock.mallapi.domain.board.entity.BoardImage;
import org.zerock.mallapi.domain.board.entity.Reply;
import org.zerock.mallapi.domain.board.repository.BoardImageRepository;
import org.zerock.mallapi.domain.board.repository.BoardRepository;
import org.zerock.mallapi.domain.board.repository.ReplyRepository;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional
@Log4j2
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final ReplyRepository replyRepository;
    private final BoardImageRepository boardImageRepository;
    private final MemberRepository memberRepository;    @Transactional(readOnly = true)
    @Override
    public Page<Board> list(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return boardRepository.findAllAndIsDeletedFalse(pageable);
        }
        return boardRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDeletedFalse(
                keyword, keyword, pageable);
    }

    @Transactional(readOnly = true)
    @Override
    public Board get(Long boardId) {
        return boardRepository.findByIdAndIsDeletedFalse(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + boardId));
    }

    @Override
    public Long create(Long writerId, String title, String content, List<String> imageFileNames,
                      Double locationLat, Double locationLng, String locationAddress) {
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("작성자(Member)가 없습니다. id=" + writerId));

        Board board = Board.builder()
                .writer(writer)
                .title(title)
                .content(content)
                .locationLat(locationLat)
                .locationLng(locationLng)
                .locationAddress(locationAddress)
                .build();

        Board saved = boardRepository.save(board);

        // 이미지 저장 (ord = 인덱스)
        if (imageFileNames != null && !imageFileNames.isEmpty()) {
            for (int i = 0; i < imageFileNames.size(); i++) {
                BoardImage img = BoardImage.builder()
                        .board(saved)
                        .fileName(imageFileNames.get(i))
                        .ord(i)
                        .build();
                boardImageRepository.save(img);
            }
        }
        return saved.getId();
    }    @Override
    public void update(Long boardId, String title, String content, java.util.List<String> imageFileNames,
            Long currentUserId, Double locationLat, Double locationLng, String locationAddress) {
        log.info("=== BoardService.update 시작 ===");
        log.info("boardId: {}, currentUserId: {}", boardId, currentUserId);
        log.info("title: {}, content length: {}, images: {}", title, content != null ? content.length() : 0, imageFileNames);

        try {
            Board board = boardRepository.findByIdAndIsDeletedFalse(boardId)
                    .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + boardId));

            log.info("게시글 조회 성공 - 작성자: {}, 제목: {}", board.getWriter().getMemberNo(), board.getTitle());

            // 작성자 본인만 수정 가능 (관리자도 수정 불가)
            if (!board.getWriter().getMemberNo().equals(currentUserId)) {
                log.error("권한 없음 - 게시글 작성자: {}, 현재 사용자: {}", board.getWriter().getMemberNo(), currentUserId);
                throw new AccessDeniedException("본인 글만 수정할 수 있습니다.");
            }

            log.info("권한 확인 완료 - 게시글 수정 진행");

            board.setTitle(title);
            board.setContent(content);
            
            // 위치 정보 업데이트
            board.setLocationLat(locationLat);
            board.setLocationLng(locationLng);
            board.setLocationAddress(locationAddress);

            log.info("게시글 내용 및 위치 정보 수정 완료");

            // 이미지 교체 (이미지는 게시글 소유자만 수정 가능)
            log.info("기존 이미지 삭제 시작");
            boardImageRepository.deleteByBoard(board);
            log.info("기존 이미지 삭제 완료");

            if (imageFileNames != null && !imageFileNames.isEmpty()) {
                log.info("새 이미지 저장 시작 - 개수: {}", imageFileNames.size());
                for (int i = 0; i < imageFileNames.size(); i++) {
                    BoardImage img = BoardImage.builder()
                            .board(board)
                            .fileName(imageFileNames.get(i))
                            .ord(i)
                            .build();
                    boardImageRepository.save(img);
                    log.info("이미지 저장 완료 - ord: {}, fileName: {}", i, imageFileNames.get(i));
                }
            } else {
                log.info("새 이미지 없음");
            }

            log.info("=== BoardService.update 완료 ===");
        } catch (Exception e) {
            log.error("=== BoardService.update 실패 ===", e);
            throw e;
        }
    }

    @Override
    public void delete(Long boardId, Long currentUserId, boolean isAdmin) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + boardId));

        boolean isOwner = board.getWriter().getMemberNo().equals(currentUserId);
        if (!(isOwner || isAdmin)) {
            throw new AccessDeniedException("본인 글 또는 관리자만 삭제할 수 있습니다.");
        }

        // 물리삭제 대신 논리삭제 사용
        board.delete();
        boardRepository.save(board);
        
        // 관련 댓글들도 논리삭제
        List<Reply> replies = replyRepository.findByBoardAndIsDeletedFalseOrderByCreatedAtAsc(board);
        for (Reply reply : replies) {
            reply.delete();
            replyRepository.save(reply);
        }
    }    @Transactional(readOnly = true)
    @Override
    public List<BoardImage> getImages(Long boardId) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + boardId));
        return boardImageRepository.findByBoardOrderByOrdAsc(board);
    }@Override
    public Page<Board> list(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (keyword == null || keyword.isBlank()) {
            return boardRepository.findAllAndIsDeletedFalse(pageable);
        }
        return boardRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDeletedFalse(
                keyword, keyword, pageable);
    }

    @Override
    public Page<Board> list(int page, int size, String keyword, String type) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // 검색어가 없으면 전체 목록 반환
        if (keyword == null || keyword.isBlank()) {
            return boardRepository.findAllAndIsDeletedFalse(pageable);
        }
        
        // 검색 타입에 따른 분기 처리
        return switch (type) {
            case "title" -> boardRepository.findByTitleContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
            case "content" -> boardRepository.findByContentContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);
            case "writer" -> boardRepository.findByWriter_EmailContainingIgnoreCaseAndIsDeletedFalse(keyword, pageable);            case "all" -> boardRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDeletedFalse(
                    keyword, keyword, pageable);
            default -> boardRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDeletedFalse(
                    keyword, keyword, pageable);
        };
    }

    @Override
    @Transactional
    public void increaseViewCount(Long boardId) {
        int updatedRows = boardRepository.incrementViewCount(boardId);
        
        if (updatedRows == 0) {
            throw new IllegalArgumentException("게시글이 없거나 삭제된 게시글입니다. id=" + boardId);
        }
    }
      @Override
    public Long createNotice(Long writerId, String title, String content, List<String> imageFileNames,
                           Double locationLat, Double locationLng, String locationAddress) {
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("작성자(Member)가 없습니다. id=" + writerId));

        Board board = Board.builder()
                .writer(writer)
                .title(title)
                .content(content)
                .postType(Board.PostType.ANN)  // 공지사항으로 설정
                .locationLat(locationLat)
                .locationLng(locationLng)
                .locationAddress(locationAddress)
                .build();

        Board saved = boardRepository.save(board);

        // 이미지 저장
        if (imageFileNames != null && !imageFileNames.isEmpty()) {
            for (int i = 0; i < imageFileNames.size(); i++) {
                BoardImage img = BoardImage.builder()
                        .board(saved)
                        .fileName(imageFileNames.get(i))
                        .ord(i)
                        .build();
                boardImageRepository.save(img);
            }
        }
        return saved.getId();
    }
    
    @Override
    public Long createAd(Long writerId, String title, String content, List<String> imageFileNames,
                        Double locationLat, Double locationLng, String locationAddress) {
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("작성자(Member)가 없습니다. id=" + writerId));

        Board board = Board.builder()
                .writer(writer)
                .title(title)
                .content(content)
                .postType(Board.PostType.AD)  // 광고로 설정
                .locationLat(locationLat)
                .locationLng(locationLng)
                .locationAddress(locationAddress)
                .build();

        Board saved = boardRepository.save(board);

        // 이미지 저장
        if (imageFileNames != null && !imageFileNames.isEmpty()) {
            for (int i = 0; i < imageFileNames.size(); i++) {
                BoardImage img = BoardImage.builder()
                        .board(saved)
                        .fileName(imageFileNames.get(i))
                        .ord(i)
                        .build();
                boardImageRepository.save(img);
            }
        }
        return saved.getId();
    }
      @Transactional(readOnly = true)
    @Override
    public List<Board> getNotices() {
        return boardRepository.findNoticesAndIsDeletedFalse();
    }
    
    @Transactional(readOnly = true)
    @Override
    public List<Board> getAds() {
        return boardRepository.findAdsAndIsDeletedFalse();
    }
}
