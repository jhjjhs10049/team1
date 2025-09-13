import { useCallback } from "react";
import websocketService from "../services/multChatWebSocketService";

/**
 * 메시지 전송을 관리하는 커스텀 훅
 */
const useMessageSender = (
  roomNo,
  username,
  loginState,
  isWebSocketConnected
) => {
  const sendMessage = useCallback(
    (messageContent, onLocalAdd) => {
      if (!isWebSocketConnected || !messageContent.trim()) return;

      const chatMessage = {
        id: Date.now() + Math.random(),
        chatRoomNo: roomNo,
        senderNickname: username,
        senderNo: loginState?.memberNo,
        content: messageContent.trim(),
        messageType: "CHAT",
        timestamp: new Date().toISOString(),
      };

      const success = websocketService.sendMessage(
        `/app/multchat/send/${roomNo}`,
        chatMessage
      );

      if (!success) {
        console.error("❌ 채팅 메시지 전송 실패");
        // 실패 시 로컬에만 추가 (임시)
        if (onLocalAdd) {
          onLocalAdd({ ...chatMessage, isLocal: true });
        }
      }
    },
    [roomNo, username, loginState, isWebSocketConnected]
  );

  return { sendMessage };
};

export default useMessageSender;
