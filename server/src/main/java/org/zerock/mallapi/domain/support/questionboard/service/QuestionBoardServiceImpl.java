package org.zerock.mallapi.domain.support.questionboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.support.questionboard.dto.QuestionBoardDTO;
import org.zerock.mallapi.domain.support.questionboard.entity.QuestionBoard;
import org.zerock.mallapi.domain.support.questionboard.repository.QuestionBoardRepository;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.entity.MemberRole;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.global.util.DateTimeUtil;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class QuestionBoardServiceImpl implements QuestionBoardService {

    private final QuestionBoardRepository questionBoardRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<QuestionBoardDTO> getQuestionList(Pageable pageable) {
        log.info("FAQ 목록 조회 요청 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<QuestionBoard> questionPage = questionBoardRepository.findActiveQuestions(pageable);
        
        return questionPage.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionBoardDTO> getAllQuestions() {
        log.info("전체 FAQ 목록 조회 요청");
        
        List<QuestionBoard> questions = questionBoardRepository.findAllActiveQuestions();
        
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionBoardDTO getQuestion(Long no) {
        log.info("FAQ 개별 조회 요청 - no: {}", no);
        
        QuestionBoard question = questionBoardRepository.findActiveQuestionByNo(no)
                .orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다. no=" + no));
        
        return convertToDTO(question);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QuestionBoardDTO> searchQuestions(String keyword, Pageable pageable) {
        log.info("FAQ 검색 요청 - keyword: {}, page: {}, size: {}", keyword, pageable.getPageNumber(), pageable.getPageSize());
        
        Page<QuestionBoard> questionPage = questionBoardRepository.findByQuestionContaining(keyword, pageable);
        
        return questionPage.map(this::convertToDTO);
    }    @Override
    public QuestionBoardDTO createQuestion(QuestionBoardDTO questionBoardDTO) {
        log.info("FAQ 등록 요청: {}", questionBoardDTO);
        
        // 작성자 확인
        Member writer = memberRepository.findById(questionBoardDTO.getWriterNo())
                .orElseThrow(() -> new IllegalArgumentException("작성자를 찾을 수 없습니다."));
        
        log.info("작성자 정보 - role: {}, roleCode: {}", writer.getRole(), writer.getRoleCode());
          // 관리자 권한 확인 (MemberRole enum 비교)
        if (writer.getRole() != MemberRole.ADMIN && 
            writer.getRole() != MemberRole.MANAGER) {
            throw new IllegalArgumentException("FAQ는 관리자만 등록할 수 있습니다.");
        }
        
        QuestionBoard question = QuestionBoard.builder()
                .question(questionBoardDTO.getQuestion())
                .answer(questionBoardDTO.getAnswer())
                .writer(writer)
                .createdAt(DateTimeUtil.getModifiedTime())
                .updatedAt(DateTimeUtil.getModifiedTime())
                .deleteStatus("N")
                .build();
        
        QuestionBoard savedQuestion = questionBoardRepository.save(question);
        
        log.info("FAQ 등록 완료 - no: {}", savedQuestion.getNo());
        
        return convertToDTO(savedQuestion);
    }

    @Override
    public QuestionBoardDTO updateQuestion(Long no, QuestionBoardDTO questionBoardDTO) {
        log.info("FAQ 수정 요청 - no: {}, data: {}", no, questionBoardDTO);
        
        QuestionBoard question = questionBoardRepository.findActiveQuestionByNo(no)
                .orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다. no=" + no));
        
        // 수정자 확인
        Member updater = memberRepository.findById(questionBoardDTO.getWriterNo())
                .orElseThrow(() -> new IllegalArgumentException("수정자를 찾을 수 없습니다."));        // 권한 확인 (작성자 또는 관리자)
        boolean isAuthor = question.getWriter().getMemberNo().equals(updater.getMemberNo());
        boolean isAdmin = updater.getRole() == MemberRole.ADMIN || 
                         updater.getRole() == MemberRole.MANAGER;
        
        if (!(isAuthor || isAdmin)) {
            throw new IllegalArgumentException("FAQ는 작성자 또는 관리자만 수정할 수 있습니다.");
        }
        
        // 수정
        question.updateQuestion(questionBoardDTO.getQuestion());
        question.updateAnswer(questionBoardDTO.getAnswer());
        question.updateModifiedAt(DateTimeUtil.getModifiedTime());
        
        QuestionBoard updatedQuestion = questionBoardRepository.save(question);
        
        log.info("FAQ 수정 완료 - no: {}", no);
        
        return convertToDTO(updatedQuestion);
    }

    @Override
    public void deleteQuestion(Long no) {
        log.info("FAQ 삭제 요청 - no: {}", no);
        
        QuestionBoard question = questionBoardRepository.findActiveQuestionByNo(no)
                .orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다. no=" + no));
        
        // 소프트 삭제
        question.markAsDeleted();
        questionBoardRepository.save(question);
        
        log.info("FAQ 삭제 완료 - no: {}", no);
    }    private QuestionBoardDTO convertToDTO(QuestionBoard question) {
        return QuestionBoardDTO.builder()
                .no(question.getNo())
                .question(question.getQuestion())
                .answer(question.getAnswer())                .writerNo(question.getWriter().getMemberNo())
                .writerEmail(question.getWriter().getEmail())
                .writerNickname(question.getWriter().getNickname())
                .writerRoleCode(question.getWriter().getRoleCode()) // roleCode 숫자 표시 (1001, 1002 등)
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .deleteStatus(question.getDeleteStatus())
                .build();
    }
}
