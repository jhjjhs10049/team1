import { useState, useEffect } from "react";
import websocketService from "../../../global/service/websocketService";

const useWebSocketStatus = () => {
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  useEffect(() => {
    const checkWebSocketStatus = () => {
      setIsWebSocketConnected(websocketService.isWebSocketConnected());
    };

    // 초기 상태 확인
    checkWebSocketStatus();

    // 주기적으로 웹소켓 상태 확인 (1초마다)
    const interval = setInterval(checkWebSocketStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isWebSocketConnected,
    subscriptionCount: websocketService.subscriptions?.size || 0,
  };
};

export default useWebSocketStatus;
