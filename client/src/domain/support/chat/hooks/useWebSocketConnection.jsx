import { useState, useEffect } from "react";
import websocketService from "../../../global/service/websocketService";
import { WEBSOCKET_DESTINATIONS } from "../../../global/constants/websocketDestinations";

/**
 * 웹소켓 연결 및 상태 변경 구독을 위한 커스텀 훅
 */
const useWebSocketConnection = (chatRoom, setChatRoom, navigate) => {
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // 웹소켓 연결
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        console.log("🔌 웹소켓 연결 시도...");
        await websocketService.connect();
        setIsWebSocketConnected(true);
        console.log("✅ 웹소켓 연결 완료");
      } catch (error) {
        console.error("❌ 웹소켓 연결 실패:", error);
        setIsWebSocketConnected(false);

        // JWT 토큰 만료 에러인 경우 사용자에게 알림
        if (error.message && error.message.includes("만료")) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/member/login");
          return;
        }

        console.error("웹소켓 연결 오류:", error.message);
      }
    };

    // 웹소켓이 연결되지 않은 경우에만 연결 시도
    if (!websocketService.isWebSocketConnected()) {
      connectWebSocket();
    } else {
      setIsWebSocketConnected(true);
    }

    return () => {
      console.log("🔌 ChatRoom 언마운트 - 웹소켓 연결 유지");
    };
  }, [navigate]);

  // 채팅방 상태 변경 구독
  useEffect(() => {
    if (!chatRoom || !isWebSocketConnected) return;

    const chatRoomNo = chatRoom.chatRoomId || chatRoom.no;
    const statusDestination =
      WEBSOCKET_DESTINATIONS.QUEUE.CHAT_STATUS(chatRoomNo);

    console.log(`📡 채팅방 ${chatRoomNo} 상태 변경 구독 시작...`);

    websocketService.subscribe(statusDestination, (statusNotification) => {
      console.log("📢 채팅방 상태 변경 알림 수신:", statusNotification);

      if (statusNotification.type === "STATUS_CHANGE") {
        console.log(`🔄 채팅방 상태 변경: ${statusNotification.status}`);

        // 채팅방 상태 업데이트
        setChatRoom((prevRoom) => ({
          ...prevRoom,
          status: statusNotification.status,
          adminNickname:
            statusNotification.adminNickname || prevRoom.adminNickname,
          rejectionReason:
            statusNotification.rejectionReason || prevRoom.rejectionReason,
        }));

        // 상태별 알림 표시
        if (statusNotification.status === "ACTIVE") {
          console.log("✅ 상담원이 배정되었습니다!");
        } else if (statusNotification.status === "REJECTED") {
          console.log("❌ 상담이 거절되었습니다");
        }
      }
    });

    return () => {
      websocketService.unsubscribe(statusDestination);
      console.log(`🔌 채팅방 ${chatRoomNo} 상태 변경 구독 해제`);
    };
  }, [chatRoom, isWebSocketConnected, setChatRoom]);

  return {
    isWebSocketConnected,
  };
};

export default useWebSocketConnection;
