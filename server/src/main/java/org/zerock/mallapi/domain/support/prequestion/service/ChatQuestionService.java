package org.zerock.mallapi.domain.support.prequestion.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.zerock.mallapi.domain.support.prequestion.dto.ChatQuestionDTO;

import java.util.List;

public interface ChatQuestionService {

    // 채팅 질문 답변 등록
    ChatQuestionDTO createChatQuestion(ChatQuestionDTO chatQuestionDTO);

    // 채팅 질문 목록 조회 (페이징, 관리자용)
    Page<ChatQuestionDTO> getChatQuestionList(Pageable pageable);

    // 모든 채팅 질문 조회 (관리자용)
    List<ChatQuestionDTO> getAllChatQuestions();

    // 특정 채팅 질문 조회
    ChatQuestionDTO getChatQuestion(Long no);

    // 특정 회원의 채팅 질문 조회
    List<ChatQuestionDTO> getChatQuestionsByMember(Long memberNo);

    // 채팅 질문 삭제 (소프트 삭제)
    void deleteChatQuestion(Long no);
}
