package org.zerock.mallapi.domain.board.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.zerock.mallapi.domain.board.entity.Board;
import org.zerock.mallapi.domain.board.entity.BoardImage;

import java.util.List;

public interface BoardService {

    Page<Board> list(String keyword, Pageable pageable);

    Board get(Long boardId);

    Long create(Long writerId, String title, String content, List<String> imageFileNames);

    // 수정: 작성자만 가능 -> currentUserId만 전달
    void update(Long boardId, String title, String content, java.util.List<String> imageFileNames,
            Long currentUserId);

    // 삭제: 작성자 또는 관리자 가능 -> isAdmin도 전달
    void delete(Long boardId, Long currentUserId, boolean isAdmin);

    List<BoardImage> getImages(Long boardId);

    Page<Board> list(int page, int size, String keyword);
    
    // 검색 타입을 포함한 새로운 메서드
    Page<Board> list(int page, int size, String keyword, String type);
    
    // 조회수 증가
    void increaseViewCount(Long boardId);
    
    // 공지사항 생성 (관리자/매니저만 가능)
    Long createNotice(Long writerId, String title, String content, List<String> imageFileNames);
    
    // 광고 생성 (관리자/매니저만 가능)
    Long createAd(Long writerId, String title, String content, List<String> imageFileNames);
    
    // 공지사항 목록 조회
    List<Board> getNotices();
    
    // 광고 목록 조회
    List<Board> getAds();
}