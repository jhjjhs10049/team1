package org.zerock.mallapi.domain.support.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.support.chat.controller.ChatWebSocketController;
import org.zerock.mallapi.domain.support.chat.dto.ChatRoomDTO;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom;
import org.zerock.mallapi.domain.support.chat.repository.ChatRoomRepository;
import org.zerock.mallapi.domain.support.prequestion.entity.ChatQuestion;
import org.zerock.mallapi.domain.support.prequestion.repository.ChatQuestionRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Log4j2
public class ChatRoomServiceImpl implements ChatRoomService {    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final ChatQuestionRepository chatQuestionRepository;
    private final ChatWebSocketController chatWebSocketController;

    @Override
    public ChatRoomDTO createChatRoomFromQuestion(Long memberNo, String questionType, String questionDetail) {
        log.info("채팅방 생성 - memberNo: {}, questionType: {}", memberNo, questionType);        // 기존에 활성화된 채팅방이 있는지 확인
        Optional<ChatRoom> existingRoom = chatRoomRepository.findActiveChatRoomByMemberNo(
            memberNo, Arrays.asList(ChatRoom.ChatStatus.WAITING, ChatRoom.ChatStatus.ACTIVE));
        if (existingRoom.isPresent()) {
            log.info("기존 활성화된 채팅방이 있음 - roomNo: {}", existingRoom.get().getNo());
            return entityToDTO(existingRoom.get());
        }

        // 회원 조회
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다: " + memberNo));        // 새 채팅방 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .member(member)
                .questionType(questionType)
                .questionDetail(questionDetail)
                .status(ChatRoom.ChatStatus.WAITING)
                .build();ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);
        log.info("새 채팅방 생성 완료 - roomNo: {}", savedChatRoom.getNo());

        // 웹소켓을 통해 새 채팅방 생성 알림 전송
        try {
            chatWebSocketController.notifyStatusChange(
                savedChatRoom.getNo(),
                savedChatRoom.getStatus().toString(),
                null, // 아직 관리자가 배정되지 않음
                null
            );
            log.info("✅ 새 채팅방 생성 알림 전송 완료 - roomNo: {}, status: {}", 
                     savedChatRoom.getNo(), savedChatRoom.getStatus());
        } catch (Exception e) {
            log.error("❌ 새 채팅방 생성 알림 전송 실패 - roomNo: {}", savedChatRoom.getNo(), e);
        }

        return entityToDTO(savedChatRoom);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatRoomDTO getActiveChatRoomByMemberNo(Long memberNo) {        log.info("활성화된 채팅방 조회 - memberNo: {}", memberNo);

        Optional<ChatRoom> chatRoom = chatRoomRepository.findActiveChatRoomByMemberNo(
            memberNo, Arrays.asList(ChatRoom.ChatStatus.WAITING, ChatRoom.ChatStatus.ACTIVE));
        return chatRoom.map(this::entityToDTO).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomDTO> getChatRoomsByMemberNo(Long memberNo) {
        log.info("회원의 채팅방 목록 조회 - memberNo: {}", memberNo);

        List<ChatRoom> chatRooms = chatRoomRepository.findChatRoomsByMemberNo(memberNo);
        return chatRooms.stream().map(this::entityToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomDTO> getChatRoomsByAdminNo(Long adminNo) {
        log.info("관리자의 채팅방 목록 조회 - adminNo: {}", adminNo);

        List<ChatRoom> chatRooms = chatRoomRepository.findChatRoomsByAdminNo(adminNo);
        return chatRooms.stream().map(this::entityToDTO).toList();
    }    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomDTO> getWaitingChatRooms() {
        log.info("대기중인 채팅방 목록 조회");        List<ChatRoom> chatRooms = chatRoomRepository.findByStatusOrderByCreatedAtAsc(
            ChatRoom.ChatStatus.WAITING);
        return chatRooms.stream().map(this::entityToDTO).toList();
    }    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomDTO> getActiveChatRooms() {
        log.info("진행중인 채팅방 목록 조회");

        List<ChatRoom> chatRooms = chatRoomRepository.findByStatusOrderByCreatedAtDesc(
            ChatRoom.ChatStatus.ACTIVE);
        return chatRooms.stream().map(this::entityToDTO).toList();
    }    @Override
    public ChatRoomDTO startChat(Long chatRoomNo, Long adminNo) {
        log.info("채팅 시작 - roomNo: {}, adminNo: {}", chatRoomNo, adminNo);

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomNo));

        Member admin = memberRepository.findById(adminNo)
                .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다: " + adminNo));

        chatRoom.startChat(admin);
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);        // 웹소켓을 통해 채팅방 상태 변경 알림 전송
        try {
            chatWebSocketController.notifyStatusChange(
                savedChatRoom.getNo(),
                savedChatRoom.getStatus().toString(),
                admin.getNickname(),
                null
            );
        } catch (Exception e) {
            log.error("❌ 채팅방 상태 변경 알림 전송 실패 - roomNo: {}", savedChatRoom.getNo(), e);
        }

        log.info("채팅 시작 완료 - roomNo: {}", savedChatRoom.getNo());
        return entityToDTO(savedChatRoom);
    }    @Override
    public ChatRoomDTO endChat(Long chatRoomNo, Long memberNo) {
        log.info("채팅 종료 - roomNo: {}, memberNo: {}", chatRoomNo, memberNo);

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomNo));

        // 권한 검증: 채팅방의 회원이거나 관리자인 경우만 종료 가능
        if (!chatRoom.getMember().getMemberNo().equals(memberNo) && 
            (chatRoom.getAdmin() == null || !chatRoom.getAdmin().getMemberNo().equals(memberNo))) {
            throw new RuntimeException("채팅방을 종료할 권한이 없습니다.");
        }

        // 이미 거절된 채팅방인 경우 상태 변경하지 않음
        if (chatRoom.getStatus() == ChatRoom.ChatStatus.REJECTED) {
            log.info("이미 거절된 채팅방입니다 - roomNo: {}, 상태 변경하지 않음", chatRoomNo);
            return entityToDTO(chatRoom);
        }

        chatRoom.endChat();
        ChatRoom savedChatRoom = chatRoomRepository.save(chatRoom);        // 웹소켓을 통해 채팅방 상태 변경 알림 전송
        try {
            String adminNickname = savedChatRoom.getAdmin() != null ? 
                                   savedChatRoom.getAdmin().getNickname() : null;
            
            log.info("🚀 채팅방 종료 웹소켓 알림 전송 시작 - 채팅방: {}, 상태: {}, 관리자: {}", 
                     savedChatRoom.getNo(), savedChatRoom.getStatus(), adminNickname);
                                   
            chatWebSocketController.notifyStatusChange(
                savedChatRoom.getNo(),
                savedChatRoom.getStatus().toString(),
                adminNickname,
                null
            );
            
            log.info("✅ 채팅방 종료 웹소켓 알림 전송 완료 - 채팅방: {}", savedChatRoom.getNo());
        } catch (Exception e) {
            log.error("❌ 채팅방 종료 알림 전송 실패 - roomNo: {}", savedChatRoom.getNo(), e);
        }

        log.info("채팅 종료 완료 - roomNo: {}, 최종 상태: {}", savedChatRoom.getNo(), savedChatRoom.getStatus());
        return entityToDTO(savedChatRoom);
    }    @Override
    public void deleteChatRoom(Long chatRoomNo) {
        log.info("채팅방 물리적 삭제 - roomNo: {}", chatRoomNo);

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomNo));

        // 물리적 삭제 수행
        chatRoomRepository.delete(chatRoom);

        log.info("채팅방 삭제 완료 - roomNo: {}", chatRoomNo);
    }@Override
    @Transactional(readOnly = true)
    public ChatRoomDTO getChatRoomById(Long chatRoomNo) {
        log.info("🔍 채팅방 상세 조회 서비스 - roomNo: {}", chatRoomNo);

        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomNo));

        log.info("📥 조회된 채팅방 정보 - roomNo: {}, status: {}, rejectionReason: {}, rejectedAt: {}", 
                 chatRoom.getNo(), chatRoom.getStatus(), chatRoom.getRejectionReason(), chatRoom.getRejectedAt());

        ChatRoomDTO dto = entityToDTO(chatRoom);
        log.info("📤 DTO 변환 완료 - roomNo: {}, status: {}, rejectionReason: {}", 
                 dto.getNo(), dto.getStatus(), dto.getRejectionReason());

        return dto;
    }// Entity -> DTO 변환
    private ChatRoomDTO entityToDTO(ChatRoom chatRoom) {
        // 해당 회원의 가장 최근 사전 질문 정보 조회
        String latestQuestionType = chatRoom.getQuestionType();
        String latestQuestionDetail = chatRoom.getQuestionDetail();
        
        List<ChatQuestion> memberQuestions = chatQuestionRepository.findQuestionsByMemberNo(chatRoom.getMember().getMemberNo());
        if (!memberQuestions.isEmpty()) {
            // 가장 최근 질문 정보로 업데이트
            ChatQuestion latestQuestion = memberQuestions.get(0); // DESC 정렬이므로 첫 번째가 최신
            latestQuestionType = latestQuestion.getQ1();
            latestQuestionDetail = latestQuestion.getQ2();
            log.info("채팅방 {} - 최신 사전질문 정보로 업데이트: {}, {}", chatRoom.getNo(), latestQuestionType, latestQuestionDetail);
        }          ChatRoomDTO dto = ChatRoomDTO.builder()
                .no(chatRoom.getNo())
                .memberNo(chatRoom.getMember().getMemberNo())
                .memberNickname(chatRoom.getMember().getNickname())
                .memberEmail(chatRoom.getMember().getEmail())
                .questionType(latestQuestionType)
                .questionDetail(latestQuestionDetail)
                .status(chatRoom.getStatus())
                .createdAt(chatRoom.getCreatedAt())
                .startedAt(chatRoom.getStartedAt())
                .endedAt(chatRoom.getEndedAt())
                .rejectionReason(chatRoom.getRejectionReason())
                .rejectedAt(chatRoom.getRejectedAt())
                .build();

        // 관리자 정보 설정 (있는 경우)
        if (chatRoom.getAdmin() != null) {
            dto.setAdminNo(chatRoom.getAdmin().getMemberNo());
            dto.setAdminNickname(chatRoom.getAdmin().getNickname());
            dto.setAdminEmail(chatRoom.getAdmin().getEmail());
        }

        return dto;
    }
}
