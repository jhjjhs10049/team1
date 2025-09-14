import { useState, useEffect, useCallback } from "react";
import websocketService from "../services/multChatWebSocketService";
import { WEBSOCKET_DESTINATIONS } from "../../global/constants/websocketDestinations";
import { MultChatEventBus, MultChatEvents } from "../services/multChatEventBus";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const useMultChatWebSocket = (roomNo, isInRoom = false) => {
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomUpdateCallback, setRoomUpdateCallback] = useState(null);
  const { loginState } = useCustomLogin();
  const storageKey = (roomNo) => `multchat:participants:${roomNo}`;

  // 웹소켓 연결
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        console.log("🔌 멀티채팅 웹소켓 연결 시도...");
        await websocketService.connect();
        setIsWebSocketConnected(true);
        console.log("✅ 멀티채팅 웹소켓 연결 완료");
      } catch (error) {
        console.error("❌ 멀티채팅 웹소켓 연결 실패:", error);
        setIsWebSocketConnected(false);
      }
    };

    if (!websocketService.isWebSocketConnected()) {
      connectWebSocket();
    } else {
      setIsWebSocketConnected(true);
    }

    return () => {
      console.log("🔌 멀티채팅 웹소켓 Hook 언마운트 - 연결 유지");
    };
  }, []);

  // 특정 채팅방 참가자 정보 구독 (채팅방 내부에서만)
  useEffect(() => {
    if (!isWebSocketConnected || !roomNo || !isInRoom) return;

    const participantDestination =
      WEBSOCKET_DESTINATIONS.TOPIC.MULT_CHAT_ROOM_NOTIFICATION(roomNo);
    console.log(
      `📡 멀티채팅방 ${roomNo} 참가자 정보 구독 시작:`,
      participantDestination
    );
    const subscription = websocketService.subscribe(
      participantDestination,
      (notification) => {
        console.log("📥 멀티채팅 참가자 알림 수신:", notification);
        console.log("📥 알림 타입:", typeof notification, notification);
        console.log(
          "📥 알림 내용 전체:",
          JSON.stringify(notification, null, 2)
        );

        // null 체크 추가
        if (!notification || typeof notification !== "object") {
          console.warn("⚠️ 잘못된 알림 형식:", notification);
          return;
        }

        console.log("🔍 [DEBUG] 알림 처리 시작 - 타입:", notification.type);

        switch (notification.type) {
          case "USER_LIST_UPDATE":
            // 서버에서 보내는 실제 참가자 목록 업데이트 (상세 정보 포함)
            console.log("📥 USER_LIST_UPDATE 알림 전체 내용:", notification);

            // participants 배열과 onlineUsers를 병합해 누락 없이 구성
            if (
              notification.participants &&
              Array.isArray(notification.participants)
            ) {
              console.log("👥 상세 참가자 정보:", notification.participants);
              console.log("👥 참가자 수:", notification.participants.length);

              // 상세 참가자 정보를 1차 변환
              const baseList = notification.participants.map(
                (participant, index) => ({
                  memberNo: participant.memberNo || `participant_${index}`,
                  nickname:
                    participant.nickname ||
                    participant.memberNickname ||
                    "익명",
                  email: participant.email || null,
                  isOnline: participant.isOnline !== false, // 기본값 true
                  joinedAt: participant.joinedAt || new Date().toISOString(),
                  role: participant.role || "USER",
                })
              );

              // onlineUsers 병합 (중복 제거)
              let mergedList = [...baseList];
              if (notification.onlineUsers) {
                const userArray = Array.isArray(notification.onlineUsers)
                  ? notification.onlineUsers
                  : Array.from(notification.onlineUsers);
                const nicknameSet = new Set(
                  mergedList.map((p) => String(p.nickname))
                );
                userArray.forEach((name, idx) => {
                  const key = String(name);
                  if (!nicknameSet.has(key)) {
                    nicknameSet.add(key);
                    mergedList.push({
                      memberNo: `online_${idx}`,
                      nickname: key,
                      isOnline: true,
                      joinedAt: new Date().toISOString(),
                      role: "USER",
                    });
                  }
                });
              }

              console.log("👥 병합된 참가자 목록:", mergedList);
              setParticipants(mergedList);

              // 채팅방 정보 업데이트 (병합 결과 기준)
              setRoomInfo((prev) => {
                const updated = prev
                  ? {
                    ...prev,
                    currentParticipants: mergedList.length,
                  }
                  : null;
                console.log("🏠 채팅방 정보 업데이트 (merged):", updated);
                return updated;
              });
            } else if (
              notification.onlineUsers &&
              notification.userCount !== undefined
            ) {
              console.log(
                "👥 기존 방식 - onlineUsers:",
                notification.onlineUsers
              );
              console.log("👥 사용자 수:", notification.userCount);

              // Set을 Array로 변환 (서버에서 Set을 보내므로)
              const userArray = Array.isArray(notification.onlineUsers)
                ? notification.onlineUsers
                : Array.from(notification.onlineUsers);

              // 기존 참가자 목록(prev)을 유지하면서 온라인 사용자와 합집합으로 병합
              setParticipants((prev) => {
                const byNickname = new Map((prev || []).map((p) => [String(p.nickname), p]));
                userArray.forEach((username, index) => {
                  const key = String(username);
                  if (!byNickname.has(key)) {
                    byNickname.set(key, {
                      memberNo: `online_${index}`,
                      nickname: key,
                      isOnline: true,
                      joinedAt: new Date().toISOString(),
                    });
                  } else {
                    // 온라인 상태 갱신
                    const existing = byNickname.get(key);
                    byNickname.set(key, { ...existing, isOnline: true });
                  }
                });

                const merged = Array.from(byNickname.values());
                console.log("👥 참가자 목록 실시간 업데이트 (fallback-merged):", merged);

                // 채팅방 정보 업데이트(합집합 기준)
                setRoomInfo((prevInfo) => {
                  const updated = prevInfo
                    ? { ...prevInfo, currentParticipants: merged.length }
                    : null;
                  console.log("🏠 채팅방 정보 업데이트 (fallback-merged):", updated);
                  return updated;
                });

                return merged;
              });
            } else {
              console.warn(
                "⚠️ USER_LIST_UPDATE 알림에 필요한 데이터가 없음:",
                notification
              );
            }
            break;

          case "USER_JOINED":
            setParticipants((prev) => {
              const exists = prev.some(
                (p) => p.nickname === notification.nickname
              );
              if (exists) return prev;

              const newParticipant = {
                memberNo: notification.memberNo,
                nickname: notification.nickname,
                isOnline: true,
                joinedAt: new Date().toISOString(),
              };
              console.log(`👋 ${notification.nickname}님이 입장했습니다!`);
              return [...prev, newParticipant];
            });

            // 채팅방 정보 업데이트
            setRoomInfo((prev) =>
              prev
                ? {
                  ...prev,
                  currentParticipants: (prev.currentParticipants || 0) + 1,
                }
                : null
            );
            break;

          case "USER_LEFT":
            console.log("� [DEBUG] USER_LEFT 이벤트 수신 시작");
            console.log("�👋 사용자 나가기 알림 수신:", notification);
            console.log("🔍 [DEBUG] 현재 participants 배열 길이:", participants.length);
            console.log("🔍 [DEBUG] 현재 participants:", participants);

            setParticipants((prev) => {
              console.log("🔍 [DEBUG] setParticipants 실행 - 이전 상태:", prev);
              const filtered = prev.filter(
                (p) => p.nickname !== notification.nickname &&
                  p.memberNo !== notification.memberNo
              );
              console.log(`👋 ${notification.nickname}님이 퇴장했습니다.`);
              console.log("👥 나가기 후 남은 참가자:", filtered);
              console.log("🔍 [DEBUG] 필터링 결과 - 이전:", prev.length, "→ 이후:", filtered.length);
              return filtered;
            });

            // 채팅방 정보 업데이트
            setRoomInfo((prev) => {
              const updated = prev
                ? {
                  ...prev,
                  currentParticipants: Math.max(
                    (prev.currentParticipants || 1) - 1,
                    0
                  ),
                }
                : null;
              console.log("🏠 채팅방 정보 업데이트 (USER_LEFT):", updated);
              return updated;
            });
            break;

          case "PARTICIPANT_LIST_UPDATE":
            if (notification.participants) {
              console.log(
                "👥 참가자 목록 전체 업데이트:",
                notification.participants
              );
              setParticipants(notification.participants);
              setRoomInfo((prev) =>
                prev
                  ? {
                    ...prev,
                    currentParticipants: notification.participants.length,
                  }
                  : null
              );
            }
            break;

          case "ROOM_INFO_UPDATE":
            if (notification.roomInfo) {
              console.log("🏠 채팅방 정보 업데이트:", notification.roomInfo);
              setRoomInfo(notification.roomInfo);
              if (notification.roomInfo.currentParticipants !== undefined) {
                // 참가자 수만 업데이트하는 경우
              }
            }
            break;

          default:
            console.log("📥 알 수 없는 멀티채팅 알림:", notification);
        }
      }
    );
    return () => {
      console.log(`📡 멀티채팅방 ${roomNo} 참가자 정보 구독 해제`);
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [isWebSocketConnected, roomNo, isInRoom]);

  // [신규] 방 내부 최초 마운트 시 참가자 목록 복원/프리필 (깜빡임 방지)
  useEffect(() => {
    if (!isInRoom || !roomNo) return;

    try {
      const saved = sessionStorage.getItem(storageKey(roomNo));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setParticipants(parsed);
          setRoomInfo((prev) => (prev ? { ...prev, currentParticipants: parsed.length } : prev));
          return;
        }
      }
    } catch (e) {
      // no-op
    }

    // 저장된 목록이 없으면 현재 사용자만이라도 즉시 프리필하여 UI 깜빡임 방지
    if (loginState?.nickname) {
      const self = {
        memberNo: loginState?.memberNo ?? "current",
        nickname: loginState.nickname,
        isOnline: true,
        joinedAt: new Date().toISOString(),
        role: "USER",
      };
      setParticipants((prev) => {
        const exists = prev.some((p) => p.nickname === self.nickname);
        return exists ? prev : [self, ...prev];
      });
      setRoomInfo((prev) => (prev ? { ...prev, currentParticipants: 1 } : prev));
    }
  }, [isInRoom, roomNo, loginState?.memberNo, loginState?.nickname]);

  // [신규] 참가자 목록을 세션 스토리지에 보존 (방 내부에서만)
  useEffect(() => {
    if (!isInRoom || !roomNo) return;
    try {
      sessionStorage.setItem(storageKey(roomNo), JSON.stringify(participants));
    } catch (e) {
      // no-op
    }
  }, [participants, isInRoom, roomNo]);

  // 전체 채팅방 상태 구독 (목록 페이지용)
  useEffect(() => {
    if (!isWebSocketConnected || isInRoom) return;

    const roomStatusDestination =
      WEBSOCKET_DESTINATIONS.TOPIC.MULT_CHAT_ROOM_STATUS;

    console.log("📡 멀티채팅 전체 상태 구독 시작:", roomStatusDestination);
    const subscription = websocketService.subscribe(
      roomStatusDestination,
      (notification) => {
        // null 또는 유효하지 않은 알림 필터링 (주의: typeof null === 'object')
        if (
          notification === null ||
          notification === undefined ||
          typeof notification !== "object"
        ) {
          return;
        }

        // 목록 페이지에서는 roomUpdateCallback을 통해 상위 컴포넌트에 알림
        if (roomUpdateCallback) {
          roomUpdateCallback(notification);
        }
      }
    );

    return () => {
      console.log("📡 멀티채팅 전체 상태 구독 해제");
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [isWebSocketConnected, isInRoom, roomUpdateCallback]);
  // 채팅방 입장 알림
  const notifyUserJoined = useCallback(
    (roomNo, nickname) => {
      if (!isWebSocketConnected) {
        console.warn("⚠️ 웹소켓이 연결되지 않아 입장 알림을 보낼 수 없습니다.");
        return;
      }

      const joinMessage = {
        type: "USER_JOIN",
        roomNo: roomNo,
        memberNo: loginState?.memberNo,
        nickname: nickname || loginState?.nickname,
        timestamp: new Date().toISOString(),
      };
      console.log("📤 채팅방 입장 알림 전송 시작:", joinMessage);

      // 즉시 현재 사용자를 참가자 목록에 추가 (임시 해결책)
      const currentUser = {
        memberNo: loginState?.memberNo || "current",
        nickname: nickname,
        isOnline: true,
        joinedAt: new Date().toISOString(),
      };

      setParticipants((prev) => {
        // 이미 있는 경우 중복 방지
        const exists = prev.some((p) => p.nickname === nickname);
        if (exists) return prev;

        console.log("🔧 즉시 현재 사용자를 참가자 목록에 추가:", currentUser);
        return [...prev, currentUser];
      });
      const success = websocketService.sendMessage(
        `/app/multchat/join/${roomNo}`,
        joinMessage
      );
      if (success) {
        console.log(`📤 ${nickname}님의 채팅방 입장 알림 전송 완료`);
        // ✅ 무한 루프 방지: 재요청 로직 제거
        // 서버에서 한 번의 입장 알림으로 참가자 목록이 정상적으로 업데이트되도록 수정됨
      } else {
        console.error(`❌ ${nickname}님의 채팅방 입장 알림 전송 실패`);
      }
    },
    [isWebSocketConnected, loginState]
  );

  // 채팅방 퇴장 알림
  const notifyUserLeft = useCallback(
    (roomNo, nickname) => {
      if (!isWebSocketConnected) return;

      const leaveMessage = {
        type: "USER_LEAVE",
        roomNo: roomNo,
        memberNo: loginState?.memberNo,
        nickname: nickname || loginState?.nickname,
        timestamp: new Date().toISOString(),
      };
      const success = websocketService.sendMessage(
        `/app/multchat/leave/${roomNo}`,
        leaveMessage
      );
      if (success) {
        console.log(`📤 ${nickname}님의 채팅방 퇴장 알림 전송 완료`);
      }
    },
    [isWebSocketConnected, loginState]
  );

  // 🚫 임시 퇴장 기능 제거 - 나가기 버튼을 누르지 않는 한 절대 퇴장하지 않음
  // 현재 참가자 수 계산
  const currentParticipantCount = participants.length; // 목록 페이지용 콜백 등록 함수
  // participants 변경 시 전역 이벤트로도 브로드캐스트 (리스트 화면 실시간 반영)
  useEffect(() => {
    if (isInRoom && roomNo) {
      MultChatEventBus.emit(MultChatEvents.ROOM_PARTICIPANT_COUNT_UPDATE, {
        roomNo,
        currentParticipants: participants.length,
        timestamp: Date.now(),
        source: "in-room-hook",
      });
    }
  }, [participants.length, isInRoom, roomNo]);

  const registerRoomUpdateCallback = useCallback((callback) => {
    setRoomUpdateCallback(() => callback); // 함수를 래핑해서 즉시 호출 방지
  }, []);

  return {
    isWebSocketConnected,
    participants,
    currentParticipantCount,
    roomInfo,
    notifyUserJoined,
    notifyUserLeft,
    setRoomInfo, // 초기 채팅방 정보 설정용
    registerRoomUpdateCallback, // 목록 페이지용 업데이트 콜백 등록
  };
};

export default useMultChatWebSocket;
