import { useState, useEffect, useMemo, useRef } from "react";
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
  // const [hasLeftRoom, setHasLeftRoom] = useState(false); // 재입장 모달 제거로 불필요
  const hasJoinedRef = useRef(false); // 중복 입장 방지

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

  // 웹소켓 연결되면 딱 1번만 입장 알림 (중복 방지)
  useEffect(() => {
    if (
      !hasJoinedRef.current &&
      isWebSocketConnected &&
      roomNo &&
      loginState?.memberNo &&
      username
    ) {
      console.log("🔄 채팅방 자동 입장:", { roomNo, username });
      notifyUserJoined(roomNo, username);
      hasJoinedRef.current = true;
    }
  }, [isWebSocketConnected, roomNo, loginState?.memberNo, username, notifyUserJoined]);

  // 방 번호 또는 로그인 사용자가 바뀌면 재입장 가능하도록 가드 초기화
  useEffect(() => {
    hasJoinedRef.current = false;
  }, [roomNo, loginState?.memberNo]);

  // 임시 퇴장 허용: 언마운트/새로고침 시에는 퇴장하지 않음 (멤버십 유지)
  // 명시적 나가기 버튼을 누를 때에만 notifyUserLeft를 사용하도록 유지

  // 다시 입장하기 함수 (서버 API 기반)
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
  };
};

export default useChatRoomLogic;
