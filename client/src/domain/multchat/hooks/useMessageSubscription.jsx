import { useEffect } from "react";
import websocketService from "../services/multChatWebSocketService";
import { WEBSOCKET_DESTINATIONS } from "../../global/constants/websocketDestinations";

/**
 * 실시간 메시지 구독을 관리하는 커스텀 훅
 */
const useMessageSubscription = (
  roomNo,
  isWebSocketConnected,
  onMessageReceived
) => {
  useEffect(() => {
    if (!isWebSocketConnected || !roomNo || !onMessageReceived) return;

    const messageDestination =
      WEBSOCKET_DESTINATIONS.TOPIC.MULT_CHAT_ROOM(roomNo);

    const subscription = websocketService.subscribe(
      messageDestination,
      (newMessage) => {
        onMessageReceived(newMessage);
      }
    );
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [isWebSocketConnected, roomNo, onMessageReceived]);
};

export default useMessageSubscription;
