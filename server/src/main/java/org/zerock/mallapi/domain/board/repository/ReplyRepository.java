package org.zerock.mallapi.domain.board.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.board.entity.Board;
import org.zerock.mallapi.domain.board.entity.Reply;

import java.util.List;
import java.util.Optional;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    // 게시글의 댓글 페이징 (삭제되지 않은 댓글만)
    @Query("SELECT r FROM Reply r WHERE r.board = :board AND r.isDeleted = false ORDER BY r.createdAt ASC")
    Page<Reply> findByBoardAndIsDeletedFalse(@Param("board") Board board, Pageable pageable);

    // 댓글 개수 (삭제되지 않은 댓글만)
    @Query("SELECT COUNT(r) FROM Reply r WHERE r.board = :board AND r.isDeleted = false")
    long countByBoardAndIsDeletedFalse(@Param("board") Board board);

    // 전체 조회용 (삭제되지 않은 댓글만)
    @Query("SELECT r FROM Reply r WHERE r.board = :board AND r.isDeleted = false ORDER BY r.createdAt ASC")
    List<Reply> findByBoardAndIsDeletedFalseOrderByCreatedAtAsc(@Param("board") Board board);

    // 특정 댓글 조회 (삭제되지 않은 댓글만)
    @Query("SELECT r FROM Reply r WHERE r.id = :id AND r.isDeleted = false")
    Optional<Reply> findByIdAndIsDeletedFalse(@Param("id") Long id);

    // 기존 메서드들 (호환성 유지)
    Page<Reply> findByBoard(Board board, Pageable pageable);
    long countByBoard(Board board);
    void deleteByBoard(Board board);
    List<Reply> findByBoardOrderByCreatedAtAsc(Board board);
}
