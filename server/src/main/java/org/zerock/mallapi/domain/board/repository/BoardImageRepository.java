package org.zerock.mallapi.domain.board.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.mallapi.domain.board.entity.Board;
import org.zerock.mallapi.domain.board.entity.BoardImage;

import java.util.List;
import java.util.Optional;

public interface BoardImageRepository extends JpaRepository<BoardImage, Long> {

    // 해당 게시글 이미지 순서대로
    List<BoardImage> findByBoardOrderByOrdAsc(Board board);

    // 보드 삭제 전 이미지 일괄 삭제
    void deleteByBoard(Board board);

    // 썸네일 한 장만 필요할 때 (가장 낮은 ord)
    Optional<BoardImage> findFirstByBoardOrderByOrdAsc(Board board);
}