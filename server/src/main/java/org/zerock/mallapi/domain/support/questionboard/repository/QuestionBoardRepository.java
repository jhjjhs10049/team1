package org.zerock.mallapi.domain.support.questionboard.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.support.questionboard.entity.QuestionBoard;

import java.util.List;
import java.util.Optional;

public interface QuestionBoardRepository extends JpaRepository<QuestionBoard, Long> {

    // 삭제되지 않은 FAQ 목록 조회 (페이징)
    @Query("SELECT q FROM QuestionBoard q WHERE q.deleteStatus = 'N' ORDER BY q.createdAt DESC")
    Page<QuestionBoard> findActiveQuestions(Pageable pageable);

    // 삭제되지 않은 FAQ 전체 목록 조회
    @Query("SELECT q FROM QuestionBoard q WHERE q.deleteStatus = 'N' ORDER BY q.createdAt DESC")
    List<QuestionBoard> findAllActiveQuestions();

    // 질문 내용으로 검색 (삭제되지 않은 것만)
    @Query("SELECT q FROM QuestionBoard q WHERE q.deleteStatus = 'N' AND q.question LIKE %:keyword% ORDER BY q.createdAt DESC")
    Page<QuestionBoard> findByQuestionContaining(@Param("keyword") String keyword, Pageable pageable);

    // 삭제되지 않은 FAQ 개별 조회
    @Query("SELECT q FROM QuestionBoard q WHERE q.no = :no AND q.deleteStatus = 'N'")
    Optional<QuestionBoard> findActiveQuestionByNo(@Param("no") Long no);
}
