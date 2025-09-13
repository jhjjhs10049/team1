import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import useMultChatWebSocket from "./useMultChatWebSocket";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";
import { getChatRoomDetail } from "../api/multChatApi";
import useMessages from "./useMessages";
import useMessageSubscription from "./useMessageSubscription";
import useMessageSender from "./useMessageSender";

/**
 * 채팅방 메인 로직을 관리하는 커스텀 훅 (단순화됨)
 */
const useChatRoomLogic = () => {
  const { roomNo } = useParams();
  const { loginState } = useCustomLogin();

  // 기본 상태
  const [roomInfo, setLocalRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 사용자 정보
  const username = useMemo(() => {
    if (!loginState || typeof loginState !== "object") return "사용자";
    if (!loginState.nickname || typeof loginState.nickname !== "string")
      return "사용자";
    return loginState.nickname;
  }, [loginState]);

  // 웹소켓 연결
  const {
    isWebSocketConnected,
    participants,
    currentParticipantCount,
    roomInfo: wsRoomInfo,
    notifyUserJoined,
    notifyUserLeft,
    setRoomInfo: setWsRoomInfo,
  } = useMultChatWebSocket(roomNo, true);

  // 메시지 관련 로직
  const {
    messages,
    hasMoreMessages,
    loadingMore,
    loadMoreMessages,
    addMessage,
    setMessages,
  } = useMessages(roomNo);

  // 메시지 전송
  const { sendMessage } = useMessageSender(
    roomNo,
    username,
    loginState,
    isWebSocketConnected
  );

  // 실시간 메시지 구독
  useMessageSubscription(roomNo, isWebSocketConnected, addMessage);

  // 채팅방 정보 로드
  useEffect(() => {
    const loadRoomInfo = async () => {
      if (!roomNo) return;
      try {
        setLoading(true);
        const roomData = await getChatRoomDetail(roomNo);
        setLocalRoomInfo(roomData);
        setWsRoomInfo(roomData);

        // 웹소켓 연결이 완료될 때까지 대기
        console.log("⏳ 웹소켓 연결 대기 중...");
      } catch (error) {
        console.error("❌ 채팅방 정보 로드 실패:", error);
        setLoading(false);
      }
    };

    loadRoomInfo();
  }, [roomNo, setWsRoomInfo]);

  // 웹소켓 연결 완료 후 로딩 해제
  useEffect(() => {
    if (isWebSocketConnected && roomInfo) {
      console.log("✅ 웹소켓 연결 완료 - 채팅방 입장 가능");
      setLoading(false);
    }
  }, [isWebSocketConnected, roomInfo]);

  // 사용자 입장/퇴장 알림 개선 (처음 입장 시에만 알림)
  useEffect(() => {
    if (isWebSocketConnected && roomNo && username && loginState) {
      // localStorage에서 이전 입장 기록 확인
      const joinedRoomsKey = `multchat_joined_rooms_${loginState.memberNo}`;
      const joinedRooms = JSON.parse(localStorage.getItem(joinedRoomsKey) || '{}');
      const isFirstJoin = !joinedRooms[roomNo];

      console.log("🚪 채팅방 입장 상태 확인:", {
        roomNo,
        username,
        isFirstJoin,
        joinedRooms
      });

      // 처음 입장하는 경우에만 입장 알림 전송
      if (isFirstJoin) {
        console.log("🎉 첫 입장! 입장 알림 전송:", { roomNo, username });
        notifyUserJoined(roomNo, username);

        // 입장 기록을 localStorage에 저장
        joinedRooms[roomNo] = {
          joinedAt: new Date().toISOString(),
          nickname: username
        };
        localStorage.setItem(joinedRoomsKey, JSON.stringify(joinedRooms));
      } else {
        console.log("🔄 재입장 - 입장 알림 생략:", { roomNo, username });
      }

      // 서버 응답 확인용 타이머 (디버깅)
      setTimeout(() => {
        if (participants.length === 0) {
          console.log(
            "⚠️ 1초 후에도 참가자 목록이 비어있음 - 서버 응답 확인 필요"
          );
          console.log("🔧 현재 사용자:", {
            username,
            memberNo: loginState?.memberNo,
            loginState: loginState,
          });
        }
      }, 1000);
    }
    return () => {
      // 🚫 나가기 버튼을 누르지 않는 한 채팅방 소속 유지
      // 브라우저 종료/새로고침/페이지 이동 시에도 채팅방에서 나가지 않음
      console.log("🔄 채팅방 Hook cleanup - 채팅방 소속 유지");
    };
  }, [
    isWebSocketConnected,
    roomNo,
    username,
    notifyUserJoined,
    loginState?.memberNo,
  ]);

  // � 브라우저 종료/새로고침 시에도 채팅방 소속 유지
  // (이전의 beforeunload 이벤트 제거)

  // 🚫 자동 나가기 로직 완전 차단 - 나가기 버튼을 누르지 않는 한 절대 나가지 않음
  const handleLeave = (onLeave) => {
    console.log("🚫 자동 나가기 차단 - 나가기 버튼을 누르지 않는 한 절대 나가지 않습니다.");
    // 어떤 콜백도 실행하지 않음 - 완전 차단
  };

  // 메시지 전송 (로컬 추가 콜백 포함)
  const handleSendMessage = (messageContent) => {
    sendMessage(messageContent, (localMessage) => {
      setMessages((prev) => [...prev, localMessage]);
    });
  };

  // 최종 정보 계산
  const finalRoomInfo = wsRoomInfo || roomInfo;
  const finalParticipantCount =
    currentParticipantCount > 0
      ? currentParticipantCount
      : finalRoomInfo?.currentParticipants || 0;

  return {
    // 상태
    messages,
    roomInfo: finalRoomInfo,
    loading,
    hasMoreMessages,
    loadingMore,
    username,
    participantCount: finalParticipantCount,

    // 웹소켓 관련
    isWebSocketConnected,
    participants,

    // 함수들
    loadMoreMessages,
    sendMessage: handleSendMessage,
    handleLeave,
  };
};

export default useChatRoomLogic;
