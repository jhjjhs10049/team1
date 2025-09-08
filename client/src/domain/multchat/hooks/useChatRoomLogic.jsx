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
  }, [loginState]); // 웹소켓 연결
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
  ); // 실시간 메시지 구독
  useMessageSubscription(roomNo, isWebSocketConnected, addMessage);

  // 채팅방 정보 로드
  useEffect(() => {
    const loadRoomInfo = async () => {
      if (!roomNo) return;
      try {
        const data = await getChatRoomDetail(roomNo);
        setLocalRoomInfo(data);
        setWsRoomInfo(data);
      } catch (error) {
        console.error("❌ 채팅방 정보 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRoomInfo();
  }, [roomNo, setWsRoomInfo, loginState]); // 사용자 입장/퇴장 알림 개선
  useEffect(() => {
    if (isWebSocketConnected && roomNo && username && loginState) {
      console.log("🚪 채팅방 입장 알림 전송:", { roomNo, username });
      notifyUserJoined(roomNo, username);

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
      // ✅ 개선: useEffect cleanup에서 자동 퇴장 알림 제거
      // 사용자가 명시적으로 "나가기" 버튼을 누를 때만 퇴장 처리
      // 페이지 새로고침이나 다른 페이지 이동 시에는 세션 유지
      console.log(
        "🔄 채팅방 Hook cleanup - 세션 유지됨 (명시적 나가기만 퇴장 처리)"
      );
    };
  }, [
    isWebSocketConnected,
    roomNo,
    username,
    notifyUserJoined,
    notifyUserLeft,
    loginState?.memberNo, // ✅ participants.length 제거 - 무한 루프 방지
  ]);

  // 채팅방 나가기
  const handleLeave = (onLeave) => {
    if (isWebSocketConnected && roomNo && username) {
      notifyUserLeft(roomNo, username);
    }
    if (onLeave && typeof onLeave === "function") {
      onLeave();
    } else {
      window.location.href = "/multchat";
    }
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
