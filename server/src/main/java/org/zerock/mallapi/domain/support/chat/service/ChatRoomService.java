package org.zerock.mallapi.domain.support.chat.service;

import org.zerock.mallapi.domain.support.chat.dto.ChatRoomDTO;

import java.util.List;

public interface ChatRoomService {

    // 사전 질문으로부터 채팅방 생성
    ChatRoomDTO createChatRoomFromQuestion(Long memberNo, String questionType, String questionDetail);

    // 회원의 활성화된 채팅방 조회 (대기중 또는 진행중)
    ChatRoomDTO getActiveChatRoomByMemberNo(Long memberNo);

    // 회원의 모든 채팅방 목록 조회
    List<ChatRoomDTO> getChatRoomsByMemberNo(Long memberNo);

    // 관리자가 담당하는 채팅방 목록 조회
    List<ChatRoomDTO> getChatRoomsByAdminNo(Long adminNo);

    // 대기중인 채팅방 목록 조회 (관리자용)
    List<ChatRoomDTO> getWaitingChatRooms();

    // 진행중인 채팅방 목록 조회 (관리자용)
    List<ChatRoomDTO> getActiveChatRooms();

    // 관리자가 채팅방에 입장하여 채팅 시작
    ChatRoomDTO startChat(Long chatRoomNo, Long adminNo);    // 채팅방 종료
    ChatRoomDTO endChat(Long chatRoomNo, Long memberNo);

    // 채팅방 삭제 (소프트 삭제)
    void deleteChatRoom(Long chatRoomNo);

    // 채팅방 상세 조회
    ChatRoomDTO getChatRoomById(Long chatRoomNo);
}
