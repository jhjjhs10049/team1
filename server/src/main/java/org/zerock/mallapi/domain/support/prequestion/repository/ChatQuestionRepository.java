package org.zerock.mallapi.domain.support.prequestion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.mallapi.domain.support.prequestion.entity.ChatQuestion;

import java.util.List;
import java.util.Optional;

public interface ChatQuestionRepository extends JpaRepository<ChatQuestion, Long> {

    // 활성 상태 질문 조회 (소프트 삭제되지 않은 것)
    @Query("SELECT cq FROM ChatQuestion cq WHERE cq.deleteStatus = 'N' ORDER BY cq.createdAt DESC")
    List<ChatQuestion> findAllActiveQuestions();

    // 활성 상태 질문 페이징 조회
    @Query("SELECT cq FROM ChatQuestion cq WHERE cq.deleteStatus = 'N' ORDER BY cq.createdAt DESC")
    Page<ChatQuestion> findActiveQuestions(Pageable pageable);

    // 특정 번호로 활성 질문 조회
    @Query("SELECT cq FROM ChatQuestion cq WHERE cq.no = :no AND cq.deleteStatus = 'N'")
    Optional<ChatQuestion> findActiveQuestionByNo(@Param("no") Long no);

    // 특정 회원의 질문 조회
    @Query("SELECT cq FROM ChatQuestion cq WHERE cq.member.memberNo = :memberNo AND cq.deleteStatus = 'N' ORDER BY cq.createdAt DESC")
    List<ChatQuestion> findQuestionsByMemberNo(@Param("memberNo") Long memberNo);

    // 특정 회원의 질문 페이징 조회
    @Query("SELECT cq FROM ChatQuestion cq WHERE cq.member.memberNo = :memberNo AND cq.deleteStatus = 'N' ORDER BY cq.createdAt DESC")
    Page<ChatQuestion> findQuestionsByMemberNo(@Param("memberNo") Long memberNo, Pageable pageable);
}
