package org.zerock.mallapi.domain.support.prequestion.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.support.prequestion.dto.ChatQuestionDTO;
import org.zerock.mallapi.domain.support.prequestion.entity.ChatQuestion;
import org.zerock.mallapi.domain.support.prequestion.repository.ChatQuestionRepository;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.support.chat.service.ChatRoomService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class ChatQuestionServiceImpl implements ChatQuestionService {

    private final ChatQuestionRepository chatQuestionRepository;
    private final MemberRepository memberRepository;
    private final ChatRoomService chatRoomService;    @Override
    public ChatQuestionDTO createChatQuestion(ChatQuestionDTO chatQuestionDTO) {
        log.info("채팅 질문 답변 등록 요청 - memberNo: {}", chatQuestionDTO.getMemberNo());

        // 회원 조회
        Member member = memberRepository.findById(chatQuestionDTO.getMemberNo())
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다. memberNo=" + chatQuestionDTO.getMemberNo()));

        ChatQuestion chatQuestion = ChatQuestion.builder()
                .member(member)
                .q1(chatQuestionDTO.getQ1())
                .q2(chatQuestionDTO.getQ2())
                .deleteStatus("N")
                .build();        ChatQuestion savedChatQuestion = chatQuestionRepository.save(chatQuestion);

        // 사전 질문 완료 후 즉시 채팅방 생성
        Long chatRoomId = null;
        try {
            var chatRoomDTO = chatRoomService.createChatRoomFromQuestion(
                    chatQuestionDTO.getMemberNo(), 
                    chatQuestionDTO.getQ1(), 
                    chatQuestionDTO.getQ2()
            );
            chatRoomId = chatRoomDTO.getNo();
            log.info("사전 질문 완료 후 채팅방 생성 완료 - memberNo: {}, chatRoomId: {}", 
                    chatQuestionDTO.getMemberNo(), chatRoomId);
        } catch (Exception e) {
            log.error("채팅방 생성 실패: {}", e.getMessage());
            // 채팅방 생성 실패해도 사전 질문은 저장됨
        }

        log.info("채팅 질문 답변 등록 완료 - no: {}", savedChatQuestion.getNo());

        ChatQuestionDTO resultDTO = convertToDTO(savedChatQuestion);
        resultDTO.setChatRoomId(chatRoomId); // 생성된 채팅방 ID 설정
        
        return resultDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChatQuestionDTO> getChatQuestionList(Pageable pageable) {
        log.info("채팅 질문 목록 조회 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<ChatQuestion> chatQuestionPage = chatQuestionRepository.findActiveQuestions(pageable);

        return chatQuestionPage.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatQuestionDTO> getAllChatQuestions() {
        log.info("모든 채팅 질문 조회");

        List<ChatQuestion> chatQuestions = chatQuestionRepository.findAllActiveQuestions();

        return chatQuestions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChatQuestionDTO getChatQuestion(Long no) {
        log.info("채팅 질문 조회 - no: {}", no);

        ChatQuestion chatQuestion = chatQuestionRepository.findActiveQuestionByNo(no)
                .orElseThrow(() -> new IllegalArgumentException("채팅 질문을 찾을 수 없습니다. no=" + no));

        return convertToDTO(chatQuestion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatQuestionDTO> getChatQuestionsByMember(Long memberNo) {
        log.info("회원별 채팅 질문 조회 - memberNo: {}", memberNo);

        List<ChatQuestion> chatQuestions = chatQuestionRepository.findQuestionsByMemberNo(memberNo);

        return chatQuestions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteChatQuestion(Long no) {
        log.info("채팅 질문 삭제 요청 - no: {}", no);

        ChatQuestion chatQuestion = chatQuestionRepository.findActiveQuestionByNo(no)
                .orElseThrow(() -> new IllegalArgumentException("채팅 질문을 찾을 수 없습니다. no=" + no));

        // 소프트 삭제
        chatQuestion.markAsDeleted();
        chatQuestionRepository.save(chatQuestion);

        log.info("채팅 질문 삭제 완료 - no: {}", no);
    }    // DTO 변환 메서드
    private ChatQuestionDTO convertToDTO(ChatQuestion chatQuestion) {
        return ChatQuestionDTO.builder()
                .no(chatQuestion.getNo())
                .memberNo(chatQuestion.getMember().getMemberNo())
                .memberEmail(chatQuestion.getMember().getEmail())
                .memberNickname(chatQuestion.getMember().getNickname())
                .memberPhone(chatQuestion.getMember().getPhone())
                .q1(chatQuestion.getQ1())
                .q2(chatQuestion.getQ2())
                .createdAt(chatQuestion.getCreatedAt())
                .deleteStatus(chatQuestion.getDeleteStatus())
                .build();
    }
}
