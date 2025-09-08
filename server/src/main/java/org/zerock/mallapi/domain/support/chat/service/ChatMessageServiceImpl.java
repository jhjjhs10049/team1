package org.zerock.mallapi.domain.support.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.support.chat.dto.ChatMessageDTO;
import org.zerock.mallapi.domain.support.chat.entity.ChatMessage;
import org.zerock.mallapi.domain.support.chat.entity.ChatRoom;
import org.zerock.mallapi.domain.support.chat.repository.ChatMessageRepository;
import org.zerock.mallapi.domain.support.chat.repository.ChatRoomRepository;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Log4j2
public class ChatMessageServiceImpl implements ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;

    @Override
    public ChatMessageDTO sendMessage(Long chatRoomNo, Long senderNo, String message, ChatMessage.MessageType messageType) {
        log.info("메시지 전송 - roomNo: {}, senderNo: {}, messageType: {}", chatRoomNo, senderNo, messageType);

        // 채팅방 조회
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomNo));

        // 발신자 조회
        Member sender = memberRepository.findById(senderNo)
                .orElseThrow(() -> new RuntimeException("발신자를 찾을 수 없습니다: " + senderNo));

        // 메시지 생성
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .message(message)
                .messageType(messageType)
                .readStatus("N")
                .deleteStatus("N")
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        log.info("메시지 전송 완료 - messageNo: {}", savedMessage.getNo());

        return entityToDTO(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessagesByChatRoomNo(Long chatRoomNo) {
        log.info("채팅방 메시지 목록 조회 - roomNo: {}", chatRoomNo);

        List<ChatMessage> messages = chatMessageRepository.findMessagesByChatRoomNo(chatRoomNo);
        return messages.stream().map(this::entityToDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadMessageCount(Long chatRoomNo, Long memberNo) {
        log.info("읽지 않은 메시지 수 조회 - roomNo: {}, memberNo: {}", chatRoomNo, memberNo);

        return chatMessageRepository.countUnreadMessagesByChatRoomNoAndMemberNo(chatRoomNo, memberNo);
    }

    @Override
    public void markMessagesAsRead(Long chatRoomNo, Long memberNo) {
        log.info("메시지 읽음 처리 - roomNo: {}, memberNo: {}", chatRoomNo, memberNo);

        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessagesByChatRoomNoAndMemberNo(chatRoomNo, memberNo);
        
        for (ChatMessage message : unreadMessages) {
            message.markAsRead();
        }
        
        chatMessageRepository.saveAll(unreadMessages);
        log.info("읽음 처리 완료 - 처리된 메시지 수: {}", unreadMessages.size());
    }

    @Override
    public void deleteMessage(Long messageNo) {
        log.info("메시지 삭제 - messageNo: {}", messageNo);

        ChatMessage message = chatMessageRepository.findById(messageNo)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다: " + messageNo));

        message.markAsDeleted();
        chatMessageRepository.save(message);

        log.info("메시지 삭제 완료 - messageNo: {}", messageNo);
    }

    @Override
    public ChatMessageDTO sendSystemMessage(Long chatRoomNo, String message) {
        log.info("시스템 메시지 전송 - roomNo: {}, message: {}", chatRoomNo, message);

        // 채팅방 조회
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + chatRoomNo));

        // 시스템 메시지는 발신자가 없음
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(null) // 시스템 메시지는 발신자가 없음
                .message(message)
                .messageType(ChatMessage.MessageType.SYSTEM)
                .readStatus("Y") // 시스템 메시지는 자동으로 읽음 처리
                .deleteStatus("N")
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        log.info("시스템 메시지 전송 완료 - messageNo: {}", savedMessage.getNo());

        return entityToDTO(savedMessage);
    }

    // Entity -> DTO 변환
    private ChatMessageDTO entityToDTO(ChatMessage message) {
        ChatMessageDTO dto = ChatMessageDTO.builder()
                .no(message.getNo())
                .chatRoomNo(message.getChatRoom().getNo())
                .message(message.getMessage())
                .messageType(message.getMessageType())
                .sentAt(message.getSentAt())
                .readStatus(message.getReadStatus())
                .deleteStatus(message.getDeleteStatus())
                .build();

        // 발신자 정보 설정 (시스템 메시지가 아닌 경우)
        if (message.getSender() != null) {
            dto.setSenderNo(message.getSender().getMemberNo());
            dto.setSenderNickname(message.getSender().getNickname());
            dto.setSenderEmail(message.getSender().getEmail());
        }

        return dto;
    }
}
