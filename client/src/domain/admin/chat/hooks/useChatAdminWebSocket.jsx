import { useState, useEffect, useRef } from "react";
import websocketService from "../../../support/chat/services/websocketService";
import { WEBSOCKET_DESTINATIONS } from "../../../global/constants/websocketDestinations";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const useChatAdminWebSocket = (refreshData) => {
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isAuthenticationReady, setIsAuthenticationReady] = useState(false);
  const { isLogin, loginState } = useCustomLogin();

  // refreshData 함수의 최신 참조를 저장
  const refreshDataRef = useRef(refreshData);

  // refreshData가 변경될 때마다 ref 업데이트
  useEffect(() => {
    refreshDataRef.current = refreshData;
  }, [refreshData]);

  // 인증 상태 확인 및 준비 완료 체크
  useEffect(() => {
    const checkAuthentication = async () => {
      if (isLogin && loginState?.memberNo) {
        console.log("✅ JWT 인증 완료 - 웹소켓 연결 준비:", loginState);
        setIsAuthenticationReady(true);
      } else {
        console.log("⚠️ JWT 인증 대기 중...");
        setIsAuthenticationReady(false);
      }
    };

    checkAuthentication();
  }, [isLogin, loginState]);

  // 웹소켓 연결 (인증 완료 후에만)
  useEffect(() => {
    if (!isAuthenticationReady) {
      console.log("⚠️ JWT 인증이 완료되지 않아 웹소켓 연결을 대기합니다.");
      return;
    }

    const connectWebSocket = async () => {
      try {
        console.log("🔌 JWT 인증 완료 후 웹소켓 연결 시작...");
        await websocketService.connect();
        setIsWebSocketConnected(true);
        console.log("✅ 관리자 페이지 웹소켓 연결 완료");
      } catch (error) {
        console.error("❌ 관리자 페이지 웹소켓 연결 실패:", error);
        setIsWebSocketConnected(false);
        // 웹소켓 재연결은 websocketService에서 자동으로 처리됨
      }
    };

    // 웹소켓이 연결되지 않은 경우에만 연결 시도
    if (!websocketService.isWebSocketConnected()) {
      connectWebSocket();
    } else {
      setIsWebSocketConnected(true);
      console.log("✅ 웹소켓이 이미 연결되어 있음");
    }

    return () => {
      console.log("🔌 관리자 페이지 언마운트 - 웹소켓 연결 유지");
    };
  }, [isAuthenticationReady]);
  // 전체 채팅방 상태 변경 알림 구독 (인증 및 웹소켓 연결 완료 후)
  useEffect(() => {
    if (!isAuthenticationReady || !isWebSocketConnected) {
      console.log(
        "⚠️ 인증 또는 웹소켓 연결이 완료되지 않아 구독을 건너뜁니다."
      );
      return;
    }

    const destination = WEBSOCKET_DESTINATIONS.TOPIC.ADMIN_STATUS;

    // 이미 구독 중인지 확인하고 중복 구독 방지
    if (websocketService.subscriptions.has(destination)) {
      console.log("📡 이미 구독 중:", destination);
      return;
    }

    console.log("📡 관리자 페이지 상태 변경 알림 구독 시작:", destination);

    // 디바운싱을 위한 타이머
    let refreshTimer = null;

    websocketService.subscribe(destination, (notification) => {
      console.log("📥 관리자 페이지 알림 수신:", notification);

      // 새 채팅방 생성이든 상태 변경이든 모두 목록을 새로고침
      if (notification.chatRoomNo) {
        console.log(
          "🔄 채팅방 목록 새로고침 실행 - 채팅방 번호:",
          notification.chatRoomNo
        );

        // 기존 타이머가 있으면 취소
        if (refreshTimer) {
          clearTimeout(refreshTimer);
        }

        // 500ms 후에 새로고침 실행 (디바운싱)
        refreshTimer = setTimeout(() => {
          console.log("🔄 실제 새로고침 실행");
          refreshDataRef.current();
          refreshTimer = null;
        }, 500);
      } else {
        console.warn("⚠️ 알림에 chatRoomNo가 없습니다:", notification);
      }
    });

    console.log("✅ 관리자 페이지 상태 변경 알림 구독 완료");
    return () => {
      console.log("📡 관리자 페이지 상태 변경 알림 구독 해제:", destination);
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      websocketService.unsubscribe(destination);
    };
  }, [isAuthenticationReady, isWebSocketConnected]);

  return {
    isWebSocketConnected,
    isAuthenticationReady,
  };
};

export default useChatAdminWebSocket;
