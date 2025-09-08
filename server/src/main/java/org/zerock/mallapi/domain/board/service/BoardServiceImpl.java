package org.zerock.mallapi.domain.board.service;

import lombok.RequiredArgsConstructor;
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
    public Long create(Long writerId, String title, String content, List<String> imageFileNames) {
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("작성자(Member)가 없습니다. id=" + writerId));

        Board board = Board.builder()
                .writer(writer)
                .title(title)
                .content(content)
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
            Long currentUserId) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + boardId));

        // 작성자 본인만 수정 가능 (관리자도 수정 불가)
        if (!board.getWriter().getMemberNo().equals(currentUserId)) {
            throw new AccessDeniedException("본인 글만 수정할 수 있습니다.");
        }

        board.setTitle(title);
        board.setContent(content);

        // 이미지 교체 (이미지는 게시글 소유자만 수정 가능)
        boardImageRepository.deleteByBoard(board);
        if (imageFileNames != null && !imageFileNames.isEmpty()) {
            for (int i = 0; i < imageFileNames.size(); i++) {
                BoardImage img = BoardImage.builder()
                        .board(board)
                        .fileName(imageFileNames.get(i))
                        .ord(i)
                        .build();
                boardImageRepository.save(img);
            }
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
    public void increaseViewCount(Long boardId) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + boardId));
        
        if (board.getViewCount() == null) {
            board.setViewCount(1);
        } else {
            board.setViewCount(board.getViewCount() + 1);
        }
        boardRepository.save(board);
    }
      @Override
    public Long createNotice(Long writerId, String title, String content, List<String> imageFileNames) {
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("작성자(Member)가 없습니다. id=" + writerId));

        Board board = Board.builder()
                .writer(writer)
                .title(title)
                .content(content)
                .postType(Board.PostType.ANN)  // 공지사항으로 설정
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
    public Long createAd(Long writerId, String title, String content, List<String> imageFileNames) {
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("작성자(Member)가 없습니다. id=" + writerId));

        Board board = Board.builder()
                .writer(writer)
                .title(title)
                .content(content)
                .postType(Board.PostType.AD)  // 광고로 설정
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
