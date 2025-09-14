package org.zerock.mallapi.domain.multchat.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.zerock.mallapi.domain.multchat.dto.MultChatRoomDTO;

import java.util.List;
import java.util.Map;

public interface MultChatRoomService {

    // 채팅방 생성
    MultChatRoomDTO createChatRoom(MultChatRoomDTO roomDTO, Long creatorNo);

    // 공개 채팅방 목록 조회 (페이징)
    Page<MultChatRoomDTO> getPublicChatRooms(Pageable pageable, Long memberNo);

    // 내가 참가 중인 채팅방 목록 조회
    List<MultChatRoomDTO> getMyChatRooms(Long memberNo);

    // 채팅방 상세 조회
    MultChatRoomDTO getChatRoomById(Long roomNo, Long memberNo);

    // 채팅방 참가
    MultChatRoomDTO joinChatRoom(Long roomNo, Long memberNo, String password);

    // 채팅방 나가기
    void leaveChatRoom(Long roomNo, Long memberNo);

    // 채팅방 이름으로 검색
    Page<MultChatRoomDTO> searchChatRooms(String roomName, Pageable pageable);

    // 인기 채팅방 목록 조회
    Page<MultChatRoomDTO> getPopularChatRooms(Pageable pageable, Long memberNo);

    // 최근 활성화된 채팅방 목록 조회
    Page<MultChatRoomDTO> getRecentActiveChatRooms(Pageable pageable, Long memberNo);

    // 채팅방 설정 수정 (방장만 가능)
    MultChatRoomDTO updateChatRoom(Long roomNo, MultChatRoomDTO updateDTO, Long memberNo);

    // 채팅방 삭제 (방장만 가능)
    void deleteChatRoom(Long roomNo, Long memberNo);    // 참가자 강퇴 (방장/관리자만 가능)
    void kickParticipant(Long roomNo, Long targetMemberNo, Long requesterNo);

    // 채팅방 참가자 목록 조회
    List<Map<String, Object>> getChatRoomParticipants(Long roomNo, Long memberNo);

    // 참가자 권한 변경 (방장만 가능)
    void changeParticipantRole(Long roomNo, Long targetMemberNo, String newRole, Long requesterNo);

    // 채팅방 상태 변경 (방장만 가능)
    void changeChatRoomStatus(Long roomNo, String status, Long memberNo);

    // 내가 방장인 채팅방 목록 조회
    List<MultChatRoomDTO> getMyCreatedChatRooms(Long memberNo);
    
    // 방장인지 확인
    boolean isRoomOwner(Long roomNo, Long memberNo);
    
    // 방 비활성화 (방장 나가기 시)
    void deactivateRoom(Long roomNo);
    
    // 특정 사용자의 채팅방 참가 상태 확인
    boolean isUserParticipating(Long roomNo, Long memberNo);
}
