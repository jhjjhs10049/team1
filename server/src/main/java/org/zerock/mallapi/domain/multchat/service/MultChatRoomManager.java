package org.zerock.mallapi.domain.multchat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.zerock.mallapi.domain.multchat.entity.MultChatRoom;
import org.zerock.mallapi.domain.multchat.repository.MultChatRoomRepository;

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
     * 채팅방에서 사용자 제거 (방장이 나가면 방 삭제)
     */
    public boolean removeUserFromRoom(Long roomNo, String nickname) {
        log.warn("🚨 removeUserFromRoom 호출됨! roomNo: {}, nickname: {}", roomNo, nickname);
        log.warn("🚨 호출 스택: ", new Exception("removeUserFromRoom 호출 위치 추적"));
        
        Set<String> users = roomUsers.get(roomNo);
        if (users != null) {
            boolean removed = users.remove(nickname);
            
            // 사용자 상세 정보에서도 제거
            userDetails.remove(nickname);
            
            log.info("사용자 {}님이 채팅방 {}에서 제거됨 - 제거됨: {}, 현재 {}명", 
                    nickname, roomNo, removed, users.size());
            
            // 방장인지 확인하여 방장이 나가면 방을 완전히 삭제
            try {
                Optional<MultChatRoom> roomOptional = multChatRoomRepository.findById(roomNo);
                if (roomOptional.isPresent()) {
                    MultChatRoom room = roomOptional.get();
                    if (room.getCreator().getNickname().equals(nickname)) {
                        // 방장이 나간 경우 - 데이터베이스에서 방 삭제
                        multChatRoomRepository.delete(room);
                        roomUsers.remove(roomNo); // 메모리에서도 제거
                        log.info("방장 {}님이 나가서 채팅방 {}을 데이터베이스에서 완전히 삭제", nickname, roomNo);
                        return removed;
                    }
                }
            } catch (Exception e) {
                log.error("방장 확인 중 오류 발생 - roomNo: {}, nickname: {}", roomNo, nickname, e);
            }
            
            // 일반 참가자가 나간 경우 또는 방장 확인 실패 시
            // 채팅방에 아무도 없으면 메모리에서만 제거 (데이터베이스는 유지)
            if (users.isEmpty()) {
                roomUsers.remove(roomNo);
                log.info("채팅방 {}이 비어있어서 메모리에서 제거 (데이터베이스는 유지)", roomNo);
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
     * 특정 채팅방의 온라인 사용자 수 조회
     */
    public int getOnlineUserCount(Long roomNo) {
        Set<String> users = roomUsers.get(roomNo);
        return users != null ? users.size() : 0;
    }

    /**
     * 특정 채팅방의 온라인 사용자 목록 조회
     */
    public Set<String> getOnlineUsers(Long roomNo) {
        Set<String> users = roomUsers.get(roomNo);
        return users != null ? new HashSet<>(users) : new HashSet<>();
    }

    /**
     * 참가자 상세 정보 목록 생성
     */
    public List<Map<String, Object>> getParticipantList(Long roomNo) {
        Set<String> roomUserSet = roomUsers.get(roomNo);
        if (roomUserSet == null) {
            return new ArrayList<>();
        }

        return roomUserSet.stream()
                .map(user -> {
                    Map<String, Object> userDetail = userDetails.get(user);
                    if (userDetail != null) {
                        return userDetail;
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
