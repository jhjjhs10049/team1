package org.zerock.mallapi.domain.board.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.board.entity.Board;
import org.zerock.mallapi.domain.member.entity.Member;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {
    
    // 삭제되지 않은 게시글만 조회하는 메서드들
    @Query("SELECT b FROM Board b WHERE b.isDeleted = false")
    Page<Board> findAllAndIsDeletedFalse(Pageable pageable);
    
    // 목록 + 간단 검색(제목/내용) - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.isDeleted = false AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%')) OR LOWER(b.content) LIKE LOWER(CONCAT('%', :content, '%')))")
    Page<Board> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseAndIsDeletedFalse(
            @Param("title") String title, @Param("content") String content, Pageable pageable
    );

    // 제목만 검색 - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.isDeleted = false AND LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Board> findByTitleContainingIgnoreCaseAndIsDeletedFalse(@Param("title") String title, Pageable pageable);
    
    // 내용만 검색 - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.isDeleted = false AND LOWER(b.content) LIKE LOWER(CONCAT('%', :content, '%'))")
    Page<Board> findByContentContainingIgnoreCaseAndIsDeletedFalse(@Param("content") String content, Pageable pageable);
    
    // 글쓴이로 검색 (이메일 기준) - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.isDeleted = false AND LOWER(b.writer.email) LIKE LOWER(CONCAT('%', :email, '%'))")
    Page<Board> findByWriter_EmailContainingIgnoreCaseAndIsDeletedFalse(@Param("email") String email, Pageable pageable);
    
    // 내 글 목록 (Member 객체로 조회) - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.writer = :writer AND b.isDeleted = false")
    Page<Board> findByWriterAndIsDeletedFalse(@Param("writer") Member writer, Pageable pageable);
    
    // 특정 게시글 조회 - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.id = :id AND b.isDeleted = false")
    Optional<Board> findByIdAndIsDeletedFalse(@Param("id") Long id);
    
    // 공지사항 조회 (최신순) - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.postType = 'ANN' AND b.isDeleted = false ORDER BY b.createdAt DESC")
    List<Board> findNoticesAndIsDeletedFalse();
    
    // 광고 조회 (최신순) - 삭제되지 않은 게시글만
    @Query("SELECT b FROM Board b WHERE b.postType = 'AD' AND b.isDeleted = false ORDER BY b.createdAt DESC")
    List<Board> findAdsAndIsDeletedFalse();

    // 조회수만 증가시키는 업데이트 쿼리 (위치 정보 보존)
    @Modifying
    @Query("UPDATE Board b SET b.viewCount = b.viewCount + 1, b.updatedAt = CURRENT_TIMESTAMP WHERE b.id = :id AND b.isDeleted = false")
    int incrementViewCount(@Param("id") Long id);

    // 기존 메서드들 (호환성 유지)
    Page<Board> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String title, String content, Pageable pageable
    );
    Page<Board> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Board> findByContentContainingIgnoreCase(String content, Pageable pageable);
    Page<Board> findByWriter_EmailContainingIgnoreCase(String email, Pageable pageable);
    Page<Board> findByWriter(Member writer, Pageable pageable);
    
    @Query("SELECT b FROM Board b WHERE b.postType = 'ANN' ORDER BY b.createdAt DESC")
    List<Board> findNotices();
    
    @Query("SELECT b FROM Board b WHERE b.postType = 'AD' ORDER BY b.createdAt DESC")
    List<Board> findAds();
}