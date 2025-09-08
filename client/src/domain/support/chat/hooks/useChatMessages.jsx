import { useState, useEffect, useCallback } from "react";
import {
  getMessagesByChatRoom,
  sendMessage,
  markMessagesAsRead,
} from "../api/chatMessageApi";
import websocketService from "../../../global/service/websocketService";
import { WEBSOCKET_DESTINATIONS } from "../../../global/constants/websocketDestinations";

/**
 * 채팅 메시지 관리를 위한 커스텀 훅
 */
const useChatMessages = (chatRoom, isAdmin, loginState) => {
  const [messages, setMessages] = useState([]);

  // 메시지 로드
  const loadMessages = useCallback(async () => {
    if (!chatRoom) return;

    try {
      console.log("📥 채팅 메시지 로드 중...");
      const messagesData = await getMessagesByChatRoom(
        chatRoom.chatRoomId || chatRoom.no
      );
      setMessages(messagesData);
      console.log("✅ 메시지 로드 완료:", messagesData.length, "개");

      // 메시지 읽음 처리 (관리자가 아닌 경우만)
      if (!isAdmin) {
        await markMessagesAsRead(chatRoom.chatRoomId || chatRoom.no);
      }
    } catch (error) {
      console.error("❌ 메시지 로드 오류:", error);
    }
  }, [chatRoom, isAdmin]);

  // 메시지 전송
  const handleSendMessage = async (messageText) => {
    try {
      const messageData = {
        chatRoomNo: chatRoom.chatRoomId || chatRoom.no,
        senderNo: loginState?.memberNo,
        message: messageText,
        messageType: isAdmin ? "ADMIN" : "USER",
      };

      console.log("📤 메시지 전송 중...", messageData);

      // 웹소켓이 연결되어 있으면 웹소켓으로 전송
      if (websocketService.isWebSocketConnected()) {
        console.log("🔌 웹소켓을 통해 메시지 전송...");
        const success = websocketService.sendMessage(
          "/app/chat/send",
          messageData
        );

        if (success) {
          console.log("✅ 웹소켓 메시지 전송 완료");
          return;
        } else {
          console.log("❌ 웹소켓 전송 실패, HTTP API 사용...");
        }
      }

      // 웹소켓이 연결되지 않았거나 전송 실패 시 HTTP API 사용
      console.log("📤 HTTP API를 통해 메시지 전송...");
      const sentMessage = await sendMessage(messageData);
      setMessages((prev) => [...prev, sentMessage]);
      console.log("✅ HTTP 메시지 전송 완료");
    } catch (error) {
      console.error("❌ 메시지 전송 오류:", error);
      alert("메시지 전송 중 오류가 발생했습니다.");
    }
  };

  // 실시간 메시지 구독
  useEffect(() => {
    if (!chatRoom) return;

    const chatRoomNo = chatRoom.chatRoomId || chatRoom.no;
    const messageDestination =
      WEBSOCKET_DESTINATIONS.QUEUE.CHAT_MESSAGE(chatRoomNo);

    console.log(`📡 채팅방 ${chatRoomNo} 메시지 구독 시작...`);

    websocketService.subscribe(messageDestination, (newMessage) => {
      console.log("📥 실시간 메시지 수신:", newMessage);
      setMessages((prevMessages) => {
        // 중복 메시지 방지
        const exists = prevMessages.some(
          (msg) =>
            (msg.id && msg.id === newMessage.id) ||
            (msg.no && msg.no === newMessage.no) ||
            (msg.message === newMessage.message &&
              msg.senderNo === newMessage.senderNo &&
              Math.abs(
                new Date(msg.createdAt) - new Date(newMessage.createdAt)
              ) < 1000)
        );
        if (exists) {
          console.log("📥 중복 메시지 무시:", newMessage.id || newMessage.no);
          return prevMessages;
        }
        console.log("📥 새 메시지 추가:", newMessage);
        return [...prevMessages, newMessage];
      });
    });

    return () => {
      websocketService.unsubscribe(messageDestination);
      console.log(`🔌 채팅방 ${chatRoomNo} 메시지 구독 해제`);
    };
  }, [chatRoom]);

  // 초기 메시지 로드
  useEffect(() => {
    if (chatRoom) {
      loadMessages();
    }
  }, [chatRoom?.no, loadMessages]);

  return {
    messages,
    setMessages,
    handleSendMessage,
  };
};

export default useChatMessages;
