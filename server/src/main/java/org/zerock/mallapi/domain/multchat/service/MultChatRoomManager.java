package org.zerock.mallapi.domain.multchat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoom;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoomParticipant;
import org.zerock.mallapi.domain.multchat.repository.MultChatRoomRepository;
import org.zerock.mallapi.domain.multchat.repository.MultChatRoomParticipantRepository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 단체채팅방 관리 서비스
 * - 온라인 사용자 목록 관리
 * - 채팅방별 참가자 관리
 * - 사용자 상세 정보 관리
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class MultChatRoomManager {

    private final MultChatRoomRepository multChatRoomRepository;
    private final MultChatRoomParticipantRepository participantRepository;

    // 온라인 유저 관리 (채팅방별로 분리)
    // roomNo -> Set<username>
    private static final Map<Long, Set<String>> roomUsers = new ConcurrentHashMap<>();
    
    // 사용자 상세 정보 관리 (username -> 사용자 정보)
    private static final Map<String, Map<String, Object>> userDetails = new ConcurrentHashMap<>();    /**
     * 채팅방에 사용자 추가 (재입장 지원)
     */
    public boolean addUserToRoom(Long roomNo, String nickname, Long memberNo, String email) {
        Set<String> currentRoomUsers = roomUsers.computeIfAbsent(roomNo, k -> ConcurrentHashMap.newKeySet());
        boolean wasAdded = currentRoomUsers.add(nickname);
        
        // 사용자 상세 정보 저장 (재입장 시에도 정보 업데이트)
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("memberNo", memberNo);
        userInfo.put("nickname", nickname);
        userInfo.put("email", email);
        userInfo.put("isOnline", true);
        userInfo.put("joinedAt", System.currentTimeMillis());
        userInfo.put("lastActivity", System.currentTimeMillis()); // 마지막 활동 시간 추가
        userDetails.put(nickname, userInfo);
        
        if (wasAdded) {
            log.info("사용자 {}님이 채팅방 {}에 새로 입장 - 현재 {}명", 
                    nickname, roomNo, currentRoomUsers.size());
        } else {
            log.info("사용자 {}님이 채팅방 {}에 재입장 (세션 복구) - 현재 {}명", 
                    nickname, roomNo, currentRoomUsers.size());
        }
        
        return wasAdded;
    }    /**
     * 채팅방에서 사용자 제거 (웹소켓 메모리에서만 제거)
     * DB 처리는 MultChatRoomService.leaveChatRoom()에서 별도 처리
     */
    public boolean removeUserFromRoom(Long roomNo, String nickname) {
        log.info("🚨 removeUserFromRoom 호출됨! roomNo: {}, nickname: {}", roomNo, nickname);
        
        Set<String> users = roomUsers.get(roomNo);
        if (users != null) {
            boolean removed = users.remove(nickname);
            
            // 사용자 상세 정보에서도 제거
            userDetails.remove(nickname);
            
            log.info("사용자 {}님이 채팅방 {}에서 제거됨 (웹소켓 메모리만) - 제거됨: {}, 현재 {}명", 
                    nickname, roomNo, removed, users.size());
            
            // 채팅방에 아무도 없으면 메모리에서만 제거
            if (users.isEmpty()) {
                roomUsers.remove(roomNo);
                log.info("채팅방 {}이 비어있어서 메모리에서 제거", roomNo);
            }
            
            return removed;
        }
        return false;
    }

    /**
     * 사용자가 특정 채팅방에 있는지 확인
     */
    public boolean isUserInRoom(Long roomNo, String nickname) {
        Set<String> users = roomUsers.get(roomNo);
        return users != null && users.contains(nickname);
    }

    /**
     * 사용자 웹소켓 연결 해제 처리 (임시퇴장)
     * roomUsers에서만 제거하고 userDetails는 유지하여 참가자 목록에 계속 표시
     */
    public boolean disconnectUserFromRoom(Long roomNo, String nickname) {
        log.info("💤 disconnectUserFromRoom 임시퇴장 호출됨! roomNo: {}, nickname: {}", roomNo, nickname);
        
        Set<String> users = roomUsers.get(roomNo);
        if (users != null) {
            boolean removed = users.remove(nickname);
            
            // 임시퇴장 시에는 userDetails 유지하고 온라인 상태만 변경
            Map<String, Object> userInfo = userDetails.get(nickname);
            if (userInfo != null) {
                userInfo.put("isOnline", false);
                userInfo.put("lastDisconnectedAt", System.currentTimeMillis());
                log.info("사용자 {}님 임시퇴장 - 사용자 정보 유지, 온라인 상태: false", nickname);
            }
            
            log.info("사용자 {}님이 채팅방 {}에서 임시퇴장 - 현재 온라인: {}명 (사용자 정보 유지)", 
                    nickname, roomNo, users.size());
            
            return removed;
        }
        return false;
    }

    /**
     * 특정 채팅방의 온라인 사용자 수 조회 (현재 웹소켓 연결된 사용자만)
     */
    public int getOnlineUserCount(Long roomNo) {
        Set<String> users = roomUsers.get(roomNo);
        return users != null ? users.size() : 0;
    }

    /**
     * 특정 채팅방의 전체 참가자 수 조회 (임시퇴장 포함)
     * DB에서 실제 참가 중인 모든 사용자 수를 조회
     */
    public int getTotalParticipantCount(Long roomNo) {
        try {
            MultChatRoom room = multChatRoomRepository.findById(roomNo).orElse(null);
            if (room == null) {
                return 0;
            }
            
            // DB에서 실제 참가 중인 사용자 수 조회 (isActive = true)
            // 이는 임시퇴장한 사용자도 포함하고, 실제 나가기 버튼을 누른 사용자만 제외
            int totalCount = room.getCurrentParticipants();
            
            log.debug("채팅방 {} 전체 참가자 수: {}명 (임시퇴장 포함)", roomNo, totalCount);
            return totalCount;
        } catch (Exception e) {
            log.error("전체 참가자 수 조회 실패 - 방번호: {}", roomNo, e);
            return getOnlineUserCount(roomNo); // fallback으로 온라인 사용자 수 반환
        }
    }

    /**
     * 특정 채팅방의 온라인 사용자 목록 조회
     */
    public Set<String> getOnlineUsers(Long roomNo) {
        Set<String> users = roomUsers.get(roomNo);
        return users != null ? new HashSet<>(users) : new HashSet<>();
    }

    /**
     * 참가자 상세 정보 목록 생성 (DB 기반, 임시퇴장 사용자 포함)
     * DB에서 실제 참가 중인 모든 사용자를 조회하고, 온라인/오프라인 상태를 구분
     */
    public List<Map<String, Object>> getParticipantList(Long roomNo) {
        try {
            log.debug("채팅방 {} 참가자 목록 조회 시작 (DB 기반)", roomNo);
            
            // 1. DB에서 활성 참가자 목록 조회
            List<MultChatRoomParticipant> activeParticipants = participantRepository.findActiveByChatRoomNo(roomNo);
            
            // 2. 현재 온라인인 사용자 목록
            Set<String> onlineUsers = roomUsers.get(roomNo);
            if (onlineUsers == null) {
                onlineUsers = new HashSet<>();
            }
            
            // 3. DB 참가자 정보와 온라인 상태를 결합
            List<Map<String, Object>> allParticipants = new ArrayList<>();
            
            for (MultChatRoomParticipant participant : activeParticipants) {
                String nickname = participant.getMember().getNickname();
                boolean isOnline = onlineUsers.contains(nickname);
                
                Map<String, Object> participantInfo = new HashMap<>();
                participantInfo.put("memberNo", participant.getMember().getMemberNo());
                participantInfo.put("nickname", nickname);
                participantInfo.put("memberNickname", nickname); // 클라이언트 호환성
                participantInfo.put("email", participant.getMember().getEmail());
                participantInfo.put("isOnline", isOnline);
                participantInfo.put("role", participant.getRole().toString());
                participantInfo.put("joinedAt", participant.getJoinedAt().toString());
                
                allParticipants.add(participantInfo);
            }
            
            log.debug("채팅방 {} 참가자 목록: 총 {}명 (온라인: {}명, 오프라인: {}명)", 
                      roomNo, allParticipants.size(), onlineUsers.size(), 
                      allParticipants.size() - onlineUsers.size());
            
            return allParticipants;
            
        } catch (Exception e) {
            log.error("참가자 목록 조회 실패 - 방번호: {}", roomNo, e);
            return new ArrayList<>();
        }
    }

    /**
     * 참가자 상세 정보 목록 생성 (기존 - 온라인 사용자만)
     * @deprecated 임시퇴장 지원을 위해 위의 getParticipantList() 사용 권장
     */
    public List<Map<String, Object>> getOnlineParticipantList(Long roomNo) {
        Set<String> roomUserSet = roomUsers.get(roomNo);
        if (roomUserSet == null) {
            return new ArrayList<>();
        }

        return roomUserSet.stream()
                .map(user -> {
                    Map<String, Object> userDetail = userDetails.get(user);
                    if (userDetail != null) {
                        Map<String, Object> participant = new HashMap<>(userDetail);
                        participant.put("isOnline", true);
                        return participant;
                    } else {
                        // fallback 정보
                        Map<String, Object> fallbackDetail = new HashMap<>();
                        fallbackDetail.put("memberNo", "unknown");
                        fallbackDetail.put("nickname", user);
                        fallbackDetail.put("email", "unknown@unknown.com");
                        fallbackDetail.put("isOnline", true);
                        fallbackDetail.put("joinedAt", System.currentTimeMillis());
                        return fallbackDetail;
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * 모든 채팅방의 온라인 사용자 수 조회 (관리용)
     */
    public Map<Long, Integer> getAllRoomUserCounts() {
        return roomUsers.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().size()
                ));
    }

    /**
     * 사용자가 참여 중인 모든 채팅방 조회
     */
    public Set<Long> getUserRooms(String nickname) {
        return roomUsers.entrySet().stream()
                .filter(entry -> entry.getValue().contains(nickname))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }
}
