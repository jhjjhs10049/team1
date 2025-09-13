package org.zerock.mallapi.domain.multchat.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.multchat.dto.MultChatRoomDTO;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoom;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoomParticipant;
import org.zerock.mallapi.domain.multchat.repository.MultChatMessageRepository;
import org.zerock.mallapi.domain.multchat.repository.MultChatRoomParticipantRepository;
import org.zerock.mallapi.domain.multchat.repository.MultChatRoomRepository;
import org.zerock.mallapi.domain.multchat.service.MultChatRoomService;
import org.zerock.mallapi.domain.multchat.service.MultChatNotificationService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class MultChatRoomServiceImpl implements MultChatRoomService {    
    private final MultChatRoomRepository chatRoomRepository;
    private final MultChatRoomParticipantRepository participantRepository;
    private final MultChatMessageRepository messageRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final MultChatNotificationService notificationService;

    @Override
    public MultChatRoomDTO createChatRoom(MultChatRoomDTO roomDTO, Long creatorNo) {
        log.info("단체 채팅방 생성 시작 - 방장: {}, 방이름: {}", creatorNo, roomDTO.getRoomName());

        Member creator = memberRepository.findById(creatorNo)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        MultChatRoom chatRoom = MultChatRoom.builder()
                .roomName(roomDTO.getRoomName())
                .description(roomDTO.getDescription())
                .creator(creator)
                .maxParticipants(roomDTO.getMaxParticipants() != null ? roomDTO.getMaxParticipants() : 50)
                .currentParticipants(1) // 방장이 자동 참가
                .status(MultChatRoom.RoomStatus.valueOf(roomDTO.getStatus() != null ? roomDTO.getStatus() : "ACTIVE"))
                .roomType(MultChatRoom.RoomType.valueOf(roomDTO.getRoomType() != null ? roomDTO.getRoomType() : "PUBLIC"))
                .build();        // 비공개방인 경우 비밀번호 암호화 처리
        if ("PRIVATE".equals(roomDTO.getRoomType())) {
            if (roomDTO.getPassword() == null || roomDTO.getPassword().trim().isEmpty()) {
                throw new RuntimeException("비공개 방은 비밀번호가 필요합니다.");
            }
            log.info("비공개 방 비밀번호 설정 - 방이름: {}", roomDTO.getRoomName());
            chatRoom.setPassword(passwordEncoder.encode(roomDTO.getPassword().trim()));
        }

        MultChatRoom savedRoom = chatRoomRepository.save(chatRoom);

        // 방장을 자동으로 참가자로 등록
        MultChatRoomParticipant creatorParticipant = MultChatRoomParticipant.builder()
                .chatRoom(savedRoom)
                .member(creator)
                .role(MultChatRoomParticipant.ParticipantRole.CREATOR)
                .isActive(true)
                .lastReadAt(LocalDateTime.now())
                .build();

        participantRepository.save(creatorParticipant);

        // 새로운 채팅방 생성 글로벌 알림 전송
        MultChatRoomDTO newRoomDTO = entityToDTO(savedRoom, creatorNo);
        notificationService.sendRoomListUpdate("ROOM_CREATED", savedRoom.getNo(), newRoomDTO);

        log.info("단체 채팅방 생성 완료 - 방번호: {}", savedRoom.getNo());
        return newRoomDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MultChatRoomDTO> getPublicChatRooms(Pageable pageable, Long memberNo) {
        log.info("모든 채팅방 목록 조회 - 페이지: {}, 크기: {}, 회원번호: {}", 
                pageable.getPageNumber(), pageable.getPageSize(), memberNo);

        Page<MultChatRoom> chatRooms = chatRoomRepository.findActiveRooms(pageable);
        return chatRooms.map(room -> entityToDTO(room, memberNo));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MultChatRoomDTO> getMyChatRooms(Long memberNo) {
        log.info("내 참가 채팅방 목록 조회 - 회원번호: {}", memberNo);

        List<MultChatRoom> chatRooms = chatRoomRepository.findMyActiveRooms(memberNo);
        return chatRooms.stream()
                .map(room -> entityToDTO(room, memberNo))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MultChatRoomDTO getChatRoomById(Long roomNo, Long memberNo) {
        log.info("채팅방 상세 조회 - 방번호: {}, 회원번호: {}", roomNo, memberNo);

        MultChatRoom chatRoom = chatRoomRepository.findById(roomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        return entityToDTO(chatRoom, memberNo);
    }

    @Override
    public MultChatRoomDTO joinChatRoom(Long roomNo, Long memberNo, String password) {
        log.info("채팅방 참가 시도 - 방번호: {}, 회원번호: {}", roomNo, memberNo);

        MultChatRoom chatRoom = chatRoomRepository.findById(roomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 참가 가능 여부 확인
        if (!chatRoom.canJoin()) {
            throw new RuntimeException("참가할 수 없는 채팅방입니다.");
        }

        // 이미 참가 중인지 확인
        boolean isAlreadyParticipating = participantRepository.isParticipating(roomNo, memberNo);
        if (isAlreadyParticipating) {
            throw new RuntimeException("이미 참가 중인 채팅방입니다.");
        }        // 비공개방인 경우 비밀번호 확인
        if (chatRoom.getRoomType() == MultChatRoom.RoomType.PRIVATE) {
            if (password == null || !passwordEncoder.matches(password, chatRoom.getPassword())) {
                throw new RuntimeException("비밀번호가 올바르지 않습니다.");
            }
        }

        // 기존 참가 기록이 있는지 확인 (재참가인 경우)
        MultChatRoomParticipant participant = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, memberNo)
                .orElse(null);

        if (participant != null) {
            // 재참가 처리
            participant.rejoin();
            participantRepository.save(participant);
        } else {
            // 새 참가자 등록
            participant = MultChatRoomParticipant.builder()
                    .chatRoom(chatRoom)
                    .member(member)
                    .role(MultChatRoomParticipant.ParticipantRole.MEMBER)
                    .isActive(true)
                    .lastReadAt(LocalDateTime.now())
                    .build();
            participantRepository.save(participant);
        }

        // 채팅방 참가자 수 증가
        chatRoom.addParticipant(member);
        chatRoomRepository.save(chatRoom);

        // 글로벌 채팅방 리스트 업데이트 알림 전송
        notificationService.sendParticipantCountUpdate(roomNo, chatRoom.getCurrentParticipants());

        log.info("채팅방 참가 완료 - 방번호: {}, 회원번호: {}", roomNo, memberNo);
        return entityToDTO(chatRoom, memberNo);
    }

    @Override
    public void leaveChatRoom(Long roomNo, Long memberNo) {
        log.info("채팅방 나가기 시도 - 방번호: {}, 회원번호: {}", roomNo, memberNo);

        MultChatRoom chatRoom = chatRoomRepository.findById(roomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        // 활성 참가자만 조회하여 이미 나간 사용자는 자동으로 필터링
        MultChatRoomParticipant participant = participantRepository
                .findActiveByChatRoomNoAndMemberNo(roomNo, memberNo)
                .orElseThrow(() -> new RuntimeException("참가 중이지 않은 채팅방입니다."));

        // 방장인 경우 특별 처리 (방장은 나갈 수 없거나, 방장 위임 후 나가기)
        if (participant.getRole() == MultChatRoomParticipant.ParticipantRole.CREATOR) {
            // 다른 참가자가 있는 경우 방장 위임 필요
            List<MultChatRoomParticipant> otherParticipants = participantRepository
                    .findActiveByChatRoomNo(roomNo)
                    .stream()
                    .filter(p -> !p.getMember().getMemberNo().equals(memberNo))
                    .collect(Collectors.toList());

            if (!otherParticipants.isEmpty()) {
                // 가장 오래된 참가자에게 방장 권한 위임
                MultChatRoomParticipant newCreator = otherParticipants.get(0);
                newCreator.setRole(MultChatRoomParticipant.ParticipantRole.CREATOR);
                participantRepository.save(newCreator);
                
                // 채팅방의 방장도 변경
                chatRoom.setCreator(newCreator.getMember());
                chatRoomRepository.save(chatRoom);
                
                log.info("방장 권한 위임 - 새 방장: {}", newCreator.getMember().getNickname());
            } else {
                // 마지막 참가자인 경우 채팅방 폐쇄
                chatRoom.closeRoom();
                chatRoomRepository.save(chatRoom);
                log.info("마지막 참가자 퇴장으로 채팅방 폐쇄 - 방번호: {}", roomNo);
            }
        }

        // 참가자 퇴장 처리
        participant.leave();
        participantRepository.save(participant);

        // 채팅방 참가자 수 감소
        chatRoom.removeParticipant(participant.getMember());
        chatRoomRepository.save(chatRoom);

        // ✅ 개선: 웹소켓 실시간 알림은 WebSocket 컨트롤러에서 처리
        // 여기서는 DB 업데이트만 수행하여 중복 알림 방지
        
        // 글로벌 채팅방 리스트 업데이트 알림만 전송 (참가자 수 변경)
        notificationService.sendParticipantCountUpdate(roomNo, chatRoom.getCurrentParticipants());

        log.info("채팅방 나가기 완료 (DB 업데이트) - 방번호: {}, 회원번호: {}", roomNo, memberNo);
    }

    // ...existing code... (다른 메소드들은 비슷한 패턴으로 구현)

    @Override
    @Transactional(readOnly = true)
    public Page<MultChatRoomDTO> searchChatRooms(String roomName, Pageable pageable) {
        log.info("채팅방 검색 - 키워드: {}", roomName);

        Page<MultChatRoom> chatRooms = chatRoomRepository.findByRoomNameContaining(roomName, pageable);
        return chatRooms.map(room -> entityToDTO(room, null));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MultChatRoomDTO> getPopularChatRooms(Pageable pageable, Long memberNo) {
        Page<MultChatRoom> chatRooms = chatRoomRepository.findPopularRooms(pageable);
        return chatRooms.map(room -> entityToDTO(room, memberNo));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MultChatRoomDTO> getRecentActiveChatRooms(Pageable pageable, Long memberNo) {
        Page<MultChatRoom> chatRooms = chatRoomRepository.findRecentActiveRooms(pageable);
        return chatRooms.map(room -> entityToDTO(room, memberNo));
    }    @Override
    @Transactional(readOnly = true)
    public List<MultChatRoomDTO> getMyCreatedChatRooms(Long memberNo) {
        List<MultChatRoom> chatRooms = chatRoomRepository.findByCreatorNo(memberNo);
        return chatRooms.stream()
                .map(room -> entityToDTO(room, memberNo))
                .collect(Collectors.toList());
    }    // Entity -> DTO 변환 (기본 정보만)
    private MultChatRoomDTO entityToDTO(MultChatRoom chatRoom, Long memberNo) {
        try {
            MultChatRoomDTO dto = MultChatRoomDTO.builder()
                    .no(chatRoom.getNo())
                    .roomName(chatRoom.getRoomName())
                    .description(chatRoom.getDescription())
                    .creatorNo(chatRoom.getCreator().getMemberNo())
                    .creatorNickname(chatRoom.getCreator().getNickname())
                    .maxParticipants(chatRoom.getMaxParticipants())
                    .currentParticipants(chatRoom.getCurrentParticipants())
                    .status(chatRoom.getStatus().toString())
                    .roomType(chatRoom.getRoomType().toString())
                    .hasPassword(chatRoom.getPassword() != null)
                    .createdAt(chatRoom.getCreatedAt())
                    .build();

            // 공개 채팅방 목록에서는 추가 정보를 로딩하지 않음 (성능상 이유)
            // 필요한 경우 별도 메서드로 호출
            if (memberNo != null) {
                try {
                    // 참가 여부 확인
                    boolean isParticipating = participantRepository.isParticipating(chatRoom.getNo(), memberNo);
                    dto.setIsParticipating(isParticipating);

                    if (isParticipating) {
                        // 내 권한 조회
                        MultChatRoomParticipant myParticipant = participantRepository
                                .findByChatRoomNoAndMemberNo(chatRoom.getNo(), memberNo)
                                .orElse(null);
                        if (myParticipant != null) {
                            dto.setMyRole(myParticipant.getRole().toString());
                        }

                        // 읽지 않은 메시지 수 조회
                        LocalDateTime lastReadAt = myParticipant != null ? myParticipant.getLastReadAt() : LocalDateTime.now();
                        Long unreadCount = messageRepository.countUnreadMessages(chatRoom.getNo(), lastReadAt, memberNo);
                        dto.setUnreadCount(unreadCount);
                    }
                } catch (Exception e) {
                    log.warn("멤버별 채팅방 정보 로딩 실패 - roomNo: {}, memberNo: {}, error: {}", 
                             chatRoom.getNo(), memberNo, e.getMessage());
                    // 개인정보 로딩 실패해도 기본 정보는 반환
                    dto.setIsParticipating(false);
                }
            }

            return dto;
        } catch (Exception e) {
            log.error("채팅방 DTO 변환 실패 - roomNo: {}, error: {}", chatRoom.getNo(), e.getMessage(), e);
            // 기본 DTO라도 반환
            return MultChatRoomDTO.builder()
                    .no(chatRoom.getNo())
                    .roomName(chatRoom.getRoomName())
                    .description(chatRoom.getDescription())
                    .creatorNo(chatRoom.getCreator().getMemberNo())
                    .creatorNickname(chatRoom.getCreator().getNickname())
                    .maxParticipants(chatRoom.getMaxParticipants())
                    .currentParticipants(chatRoom.getCurrentParticipants())
                    .status(chatRoom.getStatus().toString())
                    .roomType(chatRoom.getRoomType().toString())
                    .hasPassword(chatRoom.getPassword() != null)
                    .createdAt(chatRoom.getCreatedAt())
                    .build();
        }
    }

    @Override
    public MultChatRoomDTO updateChatRoom(Long roomNo, MultChatRoomDTO updateDTO, Long memberNo) {
        log.info("채팅방 정보 수정 - 방번호: {}, 요청자: {}", roomNo, memberNo);

        MultChatRoom chatRoom = chatRoomRepository.findById(roomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        // 방장인지 확인
        MultChatRoomParticipant participant = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, memberNo)
                .orElseThrow(() -> new RuntimeException("참가하지 않은 채팅방입니다."));

        if (participant.getRole() != MultChatRoomParticipant.ParticipantRole.CREATOR) {
            throw new RuntimeException("방장만 채팅방 정보를 수정할 수 있습니다.");
        }

        // 채팅방 정보 업데이트
        if (updateDTO.getRoomName() != null && !updateDTO.getRoomName().trim().isEmpty()) {
            chatRoom.setRoomName(updateDTO.getRoomName());
        }
        if (updateDTO.getDescription() != null) {
            chatRoom.setDescription(updateDTO.getDescription());
        }
        if (updateDTO.getMaxParticipants() != null) {
            chatRoom.setMaxParticipants(updateDTO.getMaxParticipants());
        }
        if (updateDTO.getRoomType() != null) {
            chatRoom.setRoomType(MultChatRoom.RoomType.valueOf(updateDTO.getRoomType()));
        }        // 비밀번호 설정/변경
        if (updateDTO.isHasPassword() && updateDTO.getPassword() != null) {
            chatRoom.setPassword(passwordEncoder.encode(updateDTO.getPassword()));
        } else if (!updateDTO.isHasPassword()) {
            chatRoom.setPassword(null);
        }

        MultChatRoom savedRoom = chatRoomRepository.save(chatRoom);
        log.info("채팅방 정보 수정 완료 - 방번호: {}", roomNo);

        return entityToDTO(savedRoom, memberNo);
    }

    @Override
    public void deleteChatRoom(Long roomNo, Long memberNo) {
        log.info("채팅방 삭제 - 방번호: {}, 요청자: {}", roomNo, memberNo);

        MultChatRoom chatRoom = chatRoomRepository.findById(roomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        // 방장인지 확인
        MultChatRoomParticipant participant = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, memberNo)
                .orElseThrow(() -> new RuntimeException("참가하지 않은 채팅방입니다."));

        if (participant.getRole() != MultChatRoomParticipant.ParticipantRole.CREATOR) {
            throw new RuntimeException("방장만 채팅방을 삭제할 수 있습니다.");
        }

        // 채팅방 상태를 ARCHIVED로 변경 (소프트 삭제)
        chatRoom.archiveRoom();
        chatRoomRepository.save(chatRoom);

        log.info("채팅방 삭제 완료 - 방번호: {}", roomNo);
    }

    @Override
    public void kickParticipant(Long roomNo, Long targetMemberNo, Long requesterNo) {
        log.info("참가자 강퇴 - 방번호: {}, 대상: {}, 요청자: {}", roomNo, targetMemberNo, requesterNo);

        // 요청자 권한 확인
        MultChatRoomParticipant requester = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, requesterNo)
                .orElseThrow(() -> new RuntimeException("참가하지 않은 채팅방입니다."));

        if (requester.getRole() != MultChatRoomParticipant.ParticipantRole.CREATOR && 
            requester.getRole() != MultChatRoomParticipant.ParticipantRole.ADMIN) {
            throw new RuntimeException("방장 또는 관리자만 참가자를 강퇴할 수 있습니다.");
        }

        // 대상자 조회
        MultChatRoomParticipant target = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, targetMemberNo)
                .orElseThrow(() -> new RuntimeException("대상자가 채팅방에 참가하지 않았습니다."));

        // 방장은 강퇴 불가
        if (target.getRole() == MultChatRoomParticipant.ParticipantRole.CREATOR) {
            throw new RuntimeException("방장은 강퇴할 수 없습니다.");
        }

        // 일반 관리자는 다른 관리자를 강퇴할 수 없음
        if (requester.getRole() == MultChatRoomParticipant.ParticipantRole.ADMIN &&
            target.getRole() == MultChatRoomParticipant.ParticipantRole.ADMIN) {
            throw new RuntimeException("관리자는 다른 관리자를 강퇴할 수 없습니다.");
        }

        // 채팅방에서 제거
        MultChatRoom chatRoom = chatRoomRepository.findById(roomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        target.leave();
        participantRepository.save(target);

        // 참가자 수 감소
        chatRoom.removeParticipant(target.getMember());
        chatRoomRepository.save(chatRoom);        log.info("참가자 강퇴 완료 - 방번호: {}, 대상: {}", roomNo, targetMemberNo);
    }

    @Override
    public List<Map<String, Object>> getChatRoomParticipants(Long roomNo, Long memberNo) {
        log.info("채팅방 참가자 목록 조회 - 방번호: {}, 요청자: {}", roomNo, memberNo);

        // 요청자가 채팅방에 접근 권한이 있는지 확인 (로그인한 사용자면 누구나 조회 가능)
        // 실제 참가 여부는 프론트엔드에서 모달로 처리
        
        // 참가자 목록 조회
        List<MultChatRoomParticipant> participants = participantRepository.findActiveByChatRoomNo(roomNo);
        
        return participants.stream()
                .map(participant -> {
                    Map<String, Object> participantInfo = new HashMap<>();
                    participantInfo.put("memberNo", participant.getMember().getMemberNo());
                    participantInfo.put("nickname", participant.getMember().getNickname());
                    participantInfo.put("email", participant.getMember().getEmail());                    participantInfo.put("role", participant.getRole().name());
                    participantInfo.put("joinedAt", participant.getJoinedAt());
                    participantInfo.put("isActive", participant.getIsActive());
                    return participantInfo;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void changeParticipantRole(Long roomNo, Long targetMemberNo, String newRole, Long requesterNo) {
        log.info("참가자 권한 변경 - 방번호: {}, 대상: {}, 새 권한: {}, 요청자: {}", 
                roomNo, targetMemberNo, newRole, requesterNo);

        // 방장인지 확인
        MultChatRoomParticipant requester = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, requesterNo)
                .orElseThrow(() -> new RuntimeException("참가하지 않은 채팅방입니다."));

        if (requester.getRole() != MultChatRoomParticipant.ParticipantRole.CREATOR) {
            throw new RuntimeException("방장만 참가자 권한을 변경할 수 있습니다.");
        }

        // 대상자 조회
        MultChatRoomParticipant target = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, targetMemberNo)
                .orElseThrow(() -> new RuntimeException("대상자가 채팅방에 참가하지 않았습니다."));

        // 자기 자신의 권한은 변경 불가
        if (requesterNo.equals(targetMemberNo)) {
            throw new RuntimeException("자신의 권한은 변경할 수 없습니다.");
        }

        // 권한 변경
        MultChatRoomParticipant.ParticipantRole role = 
                MultChatRoomParticipant.ParticipantRole.valueOf(newRole);
        target.setRole(role);
        participantRepository.save(target);

        log.info("참가자 권한 변경 완료 - 방번호: {}, 대상: {}, 새 권한: {}", 
                roomNo, targetMemberNo, newRole);
    }

    @Override
    public void changeChatRoomStatus(Long roomNo, String status, Long memberNo) {
        log.info("채팅방 상태 변경 - 방번호: {}, 새 상태: {}, 요청자: {}", roomNo, status, memberNo);

        MultChatRoom chatRoom = chatRoomRepository.findById(roomNo)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        // 방장인지 확인
        MultChatRoomParticipant participant = participantRepository
                .findByChatRoomNoAndMemberNo(roomNo, memberNo)
                .orElseThrow(() -> new RuntimeException("참가하지 않은 채팅방입니다."));

        if (participant.getRole() != MultChatRoomParticipant.ParticipantRole.CREATOR) {
            throw new RuntimeException("방장만 채팅방 상태를 변경할 수 있습니다.");
        }

        // 상태 변경
        MultChatRoom.RoomStatus roomStatus = MultChatRoom.RoomStatus.valueOf(status);
        chatRoom.setStatus(roomStatus);
        chatRoomRepository.save(chatRoom);

        log.info("채팅방 상태 변경 완료 - 방번호: {}, 새 상태: {}", roomNo, status);
    }
}
