package org.zerock.mallapi.domain.support.questionboard.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.zerock.mallapi.domain.support.questionboard.dto.QuestionBoardDTO;

import java.util.List;

public interface QuestionBoardService {

    // FAQ 목록 조회 (페이징)
    Page<QuestionBoardDTO> getQuestionList(Pageable pageable);

    // FAQ 전체 목록 조회
    List<QuestionBoardDTO> getAllQuestions();

    // FAQ 개별 조회
    QuestionBoardDTO getQuestion(Long no);

    // FAQ 검색
    Page<QuestionBoardDTO> searchQuestions(String keyword, Pageable pageable);

    // FAQ 등록 (관리자용)
    QuestionBoardDTO createQuestion(QuestionBoardDTO questionBoardDTO);

    // FAQ 수정 (관리자용)
    QuestionBoardDTO updateQuestion(Long no, QuestionBoardDTO questionBoardDTO);

    // FAQ 삭제 (관리자용)
    void deleteQuestion(Long no);
}
