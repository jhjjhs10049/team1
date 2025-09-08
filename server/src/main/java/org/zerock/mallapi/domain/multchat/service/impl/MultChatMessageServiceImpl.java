package org.zerock.mallapi.domain.multchat.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.multchat.dto.MultChatMessageDTO;
import org.zerock.mallapi.domain.multchat.entity.MultChatMessage;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoom;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoomParticipant;
import org.zerock.mallapi.domain.multchat.repository.MultChatMessageRepository;
import org.zerock.mallapi.domain.multchat.repository.MultChatRoomParticipantRepository;
import org.zerock.mallapi.domain.multchat.repository.MultChatRoomRepository;
import org.zerock.mallapi.domain.multchat.service.MultChatMessageService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Log4j2
public class MultChatMessageServiceImpl implements MultChatMessageService {

    private final MultChatMessageRepository messageRepository;
    private final MultChatRoomRepository chatRoomRepository;
    private final MultChatRoomParticipantRepository participantRepository;
    private final MemberRepository memberRepository;    @Override
    public MultChatMessageDTO sendMessage(MultChatMessageDTO messageDTO) {
        log.info("단체 채팅 메시지 전송 - 방번호: {}, 발신자: {}", 
                messageDTO.getChatRoomNo(), messageDTO.getSenderNo());

        // 채팅방 조회
        MultChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getChatRoomNo())
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다: " + messageDTO.getChatRoomNo()));        // 발신자 조회 (시스템 메시지가 아닌 경우)
        Member sender = null;
        if (messageDTO.getSenderNo() != null) {
            sender = memberRepository.findById(messageDTO.getSenderNo())
                    .orElseThrow(() -> new RuntimeException("발신자를 찾을 수 없습니다: " + messageDTO.getSenderNo()));
                    
            // 로그인한 사용자라면 메시지 전송 허용 (실제 참가는 프론트엔드에서 모달로 처리)
            log.info("로그인한 사용자의 메시지 전송 - 발신자: {}, 실제 참가여부는 프론트엔드에서 관리", 
                    messageDTO.getSenderNo());
        }

        // 이모지 포함 메시지 상세 로깅
        String content = messageDTO.getContent();
        boolean containsEmoji = content.matches(".*[\\p{So}\\p{Cn}].*");
        
        log.info("💾 DB 저장 전 메시지 내용: {}", content);
        log.info("🎭 이모지 포함: {}", containsEmoji);
        
        if (containsEmoji) {
            log.info("🔍 DB 저장용 이모지 상세 정보:");
            for (int i = 0; i < content.length(); i++) {
                int codePoint = content.codePointAt(i);
                if (Character.isSupplementaryCodePoint(codePoint) || codePoint > 127) {
                    String emoji = new String(Character.toChars(codePoint));
                    log.info("  - 문자: {}, 유니코드: U+{}, 바이트 길이: {}", 
                            emoji, Integer.toHexString(codePoint).toUpperCase(), emoji.getBytes().length);
                    
                    // 서로게이트 페어인 경우 인덱스 증가
                    if (Character.isSupplementaryCodePoint(codePoint)) {
                        i++;
                    }
                }
            }
        }

        // 메시지 생성
        MultChatMessage chatMessage = MultChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(messageDTO.getContent())
                .messageType(MultChatMessage.MessageType.valueOf(messageDTO.getMessageType()))
                .systemMessageData(messageDTO.getSystemMessageData())
                .build();

        MultChatMessage savedMessage = messageRepository.save(chatMessage);
        
        // DB 저장 후 내용 확인
        log.info("💾 DB 저장 후 메시지 내용: {}", savedMessage.getContent());
        log.info("🆔 저장된 메시지 ID: {}", savedMessage.getNo());

        // 채팅방 최종 활동 시간 업데이트
        // MultChatRoom에 updateLastActivity 메서드가 없으므로 modifiedAt은 자동으로 업데이트됨
        chatRoomRepository.save(chatRoom);

        log.info("단체 채팅 메시지 전송 완료 - 메시지 번호: {}", savedMessage.getNo());
        return entityToDTO(savedMessage);
    }@Override
    @Transactional(readOnly = true)
    public Page<MultChatMessageDTO> getMessagesByChatRoom(Long roomNo, Long memberNo, Pageable pageable) {
        log.info("채팅방 메시지 목록 조회 - 방번호: {}, 회원번호: {}, 페이지: {}", 
                roomNo, memberNo, pageable.getPageNumber());

        // 로그인된 사용자는 메시지 조회 가능 (참가자 체크 제거)
        // 실제 참가는 프론트엔드에서 모달 확인 후 joinChatRoom API로 처리
        log.info("로그인 사용자 메시지 조회 허용 - 방번호: {}, 회원번호: {}", roomNo, memberNo);

        Page<MultChatMessage> messages = messageRepository.findByChatRoomNo(roomNo, pageable);
        return messages.map(this::entityToDTO);
    }    @Override
    @Transactional(readOnly = true)
    public List<MultChatMessageDTO> getRecentMessages(Long roomNo, Long memberNo, int limit) {
        log.info("최근 메시지 조회 - 방번호: {}, 회원번호: {}, 제한: {}", roomNo, memberNo, limit);

        // 로그인된 사용자는 메시지 조회 가능 (참가자 체크 제거)
        // 실제 참가는 프론트엔드에서 모달 확인 후 joinChatRoom API로 처리
        log.info("로그인 사용자 메시지 조회 허용 - 방번호: {}, 회원번호: {}", roomNo, memberNo);

        List<MultChatMessage> messages = messageRepository.findRecentByChatRoomNo(roomNo, 
                PageRequest.of(0, limit));
        return messages.stream().map(this::entityToDTO).toList();
    }

    @Override
    public MultChatMessageDTO sendSystemMessage(Long roomNo, String content, String messageType, String systemData) {
        log.info("시스템 메시지 전송 - 방번호: {}, 타입: {}", roomNo, messageType);        MultChatMessageDTO systemMessage = MultChatMessageDTO.builder()
                .chatRoomNo(roomNo)
                .content(content)
                .messageType(messageType)
                .systemMessageData(systemData)
                .build();

        return sendMessage(systemMessage);
    }

    @Override
    public void deleteMessage(Long messageNo, Long memberNo) {
        log.info("메시지 삭제 - 메시지 번호: {}, 요청자: {}", messageNo, memberNo);

        MultChatMessage message = messageRepository.findById(messageNo)
                .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다."));

        // 본인 메시지인지 확인 (시스템 메시지는 삭제 불가)
        if (message.getSender() == null || !message.getSender().getMemberNo().equals(memberNo)) {
            throw new RuntimeException("본인의 메시지만 삭제할 수 있습니다.");
        }        // 소프트 삭제
        message.deleteMessage();
        messageRepository.save(message);

        log.info("메시지 삭제 완료 - 메시지 번호: {}", messageNo);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadMessageCount(Long roomNo, Long memberNo) {
        log.info("읽지 않은 메시지 수 조회 - 방번호: {}, 회원번호: {}", roomNo, memberNo);

        // 참가자 정보 조회
        MultChatRoomParticipant participant = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, memberNo)
                .orElseThrow(() -> new RuntimeException("참가하지 않은 채팅방입니다."));

        LocalDateTime lastReadAt = participant.getLastReadAt();
        if (lastReadAt == null) {
            // 처음 참가한 경우 모든 메시지가 읽지 않음
            return messageRepository.countByChatRoomNo(roomNo);
        }

        return messageRepository.countUnreadMessages(roomNo, lastReadAt, memberNo);
    }

    @Override
    public void markMessagesAsRead(Long roomNo, Long memberNo) {
        log.info("메시지 읽음 처리 - 방번호: {}, 회원번호: {}", roomNo, memberNo);

        // 참가자 정보 조회
        MultChatRoomParticipant participant = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, memberNo)
                .orElseThrow(() -> new RuntimeException("참가하지 않은 채팅방입니다."));        // 마지막 읽은 시간 업데이트
        participant.updateLastReadTime();
        participantRepository.save(participant);

        log.info("메시지 읽음 처리 완료 - 방번호: {}, 회원번호: {}", roomNo, memberNo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MultChatMessageDTO> getMessagesByUser(Long roomNo, Long senderNo) {
        log.info("특정 사용자 메시지 조회 - 방번호: {}, 발신자: {}", roomNo, senderNo);

        List<MultChatMessage> messages = messageRepository.findByChatRoomNoAndSenderNo(roomNo, senderNo);
        return messages.stream().map(this::entityToDTO).toList();
    }    // Entity -> DTO 변환
    private MultChatMessageDTO entityToDTO(MultChatMessage message) {
        MultChatMessageDTO.MultChatMessageDTOBuilder builder = MultChatMessageDTO.builder()
                .no(message.getNo())
                .chatRoomNo(message.getChatRoom().getNo())
                .content(message.getContent())
                .messageType(message.getMessageType().toString())
                .systemMessageData(message.getSystemMessageData())
                .isDeleted(message.getIsDeleted())
                .createdAt(message.getCreatedAt());

        // 발신자 정보 설정 (시스템 메시지가 아닌 경우)
        if (message.getSender() != null) {
            builder.senderNo(message.getSender().getMemberNo())
                   .senderNickname(message.getSender().getNickname());
        }

        return builder.build();
    }
}
