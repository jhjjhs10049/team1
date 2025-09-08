import { useEffect } from "react";
import websocketService from "../../domain/support/chat/services/websocketService";
import { WEBSOCKET_DESTINATIONS } from "../../domain/global/constants/websocketDestinations";
import useCustomLogin from "../../domain/member/login/hooks/useCustomLogin";

/**
 * 회원 상태/권한 변경 시 강제 로그아웃을 처리하는 Hook
 */
const useForcedLogoutListener = () => {
  const { loginState, doLogout } = useCustomLogin();

  // 웹소켓 재연결 실패로 인한 강제 로그아웃 처리
  useEffect(() => {
    const handleForceLogout = (event) => {
      console.log("🚨 강제 로그아웃 이벤트 수신:", event.detail);

      const message = event.detail?.reason || "인증 토큰이 만료되었습니다.";

      // 강제 로그아웃 알림 표시
      showLogoutAlert(
        `${message}\n\n다시 로그인해 주세요.`,
        () => {
          doLogout();
          window.location.href = "/member/login";
        },
        "TOKEN_EXPIRED"
      );
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener("forceLogout", handleForceLogout);

    return () => {
      window.removeEventListener("forceLogout", handleForceLogout);
    };
  }, [doLogout]);

  useEffect(() => {
    if (!loginState?.memberNo) return;

    const memberNo = loginState.memberNo;
    const destination = WEBSOCKET_DESTINATIONS.QUEUE.MEMBER_LOGOUT(memberNo);

    console.log("🚨 강제 로그아웃 알림 구독 시작:", destination); // 웹소켓 연결 확인 및 구독
    const checkConnectionAndSubscribe = async () => {
      try {
        // 최대 3초 동안 연결 대기
        let attempts = 0;
        const maxAttempts = 30; // 0.1초 * 30 = 3초

        while (
          !websocketService.isWebSocketConnected() &&
          attempts < maxAttempts
        ) {
          if (attempts === 0) {
            console.log(
              "🔌 강제 로그아웃 리스너를 위한 웹소켓 연결 확인 중..."
            );
            // 연결되지 않았다면 연결 시도 (await 없이)
            websocketService.connect().catch((error) => {
              console.log(
                "⚠️ 웹소켓 연결 시도 중 오류 (다른 곳에서 이미 연결 중일 수 있음):",
                error.message
              );
            });
          }

          await new Promise((resolve) => setTimeout(resolve, 100)); // 0.1초 대기
          attempts++;
        }

        if (!websocketService.isWebSocketConnected()) {
          throw new Error("웹소켓 연결 시간 초과");
        }

        console.log("🔌 웹소켓 연결 확인됨, 강제 로그아웃 알림 구독 시작..."); // 강제 로그아웃 알림 구독
        websocketService.subscribe(destination, (notification) => {
          console.log("🚨 강제 로그아웃 알림 수신:", notification);

          // 알림 내용 표시
          const message = getLogoutMessage(notification);

          // 사용자 친화적인 알림 표시
          showLogoutAlert(
            message,
            () => {
              // 강제 로그아웃 수행
              doLogout();
              // 로그인 페이지로 리다이렉트
              window.location.href = "/member/login";
            },
            notification.changeType
          );
        });

        console.log("✅ 강제 로그아웃 알림 구독 완료:", destination);
      } catch (error) {
        console.error("❌ 강제 로그아웃 리스너 설정 실패:", error);
      }
    };

    checkConnectionAndSubscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log("🚨 강제 로그아웃 알림 구독 해제:", destination);
      websocketService.unsubscribe(destination);
    };
  }, [loginState?.memberNo, doLogout]);
  // 사용자 친화적인 로그아웃 알림 표시
  const showLogoutAlert = (message, onConfirm, changeType) => {
    // 변경 타입에 따른 아이콘과 색상 설정
    const getAlertStyle = (type) => {
      switch (type) {
        case "BAN":
          return {
            icon: "🚫",
            bgColor: "#FEE2E2",
            iconColor: "#DC2626",
          };
        case "ROLE_CHANGE":
          return {
            icon: "🔄",
            bgColor: "#DBEAFE",
            iconColor: "#2563EB",
          };
        case "TOKEN_EXPIRED":
          return {
            icon: "🔒",
            bgColor: "#FEF3C7",
            iconColor: "#D97706",
          };
        default:
          return {
            icon: "⚠️",
            bgColor: "#FEF3C7",
            iconColor: "#D97706",
          };
      }
    };

    const style = getAlertStyle(changeType);

    // 모달 스타일의 알림 창 생성
    const modalOverlay = document.createElement("div");
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      text-align: center;
      animation: fadeInScale 0.3s ease-out;
    `;

    // CSS 애니메이션 추가
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(styleElement);

    modal.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="
          width: 60px;
          height: 60px;
          background: ${style.bgColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        ">
          <span style="font-size: 24px;">${style.icon}</span>
        </div>
        <h3 style="
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1F2937;
        ">계정 상태 변경 알림</h3>
        <p style="
          margin: 0;
          font-size: 14px;
          color: #6B7280;
          line-height: 1.5;
          white-space: pre-line;
        ">${message}</p>
      </div>
      <button id="logoutConfirmBtn" style="
        background: #3B82F6;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        width: 100%;
        transition: background-color 0.2s;
      ">확인하고 로그인 페이지로 이동</button>
    `;

    const confirmBtn = modal.querySelector("#logoutConfirmBtn");
    confirmBtn.addEventListener("mouseenter", () => {
      confirmBtn.style.background = "#2563EB";
    });
    confirmBtn.addEventListener("mouseleave", () => {
      confirmBtn.style.background = "#3B82F6";
    });

    confirmBtn.addEventListener("click", () => {
      document.body.removeChild(modalOverlay);
      document.head.removeChild(styleElement);
      onConfirm();
    });

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    // ESC 키로 닫기 방지 (강제 로그아웃이므로)
    const handleKeydown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("keydown", handleKeydown);

    // 모달이 제거될 때 이벤트 리스너도 제거
    const originalRemoveChild = document.body.removeChild.bind(document.body);
    document.body.removeChild = function (child) {
      if (child === modalOverlay) {
        document.removeEventListener("keydown", handleKeydown);
        document.body.removeChild = originalRemoveChild;
      }
      return originalRemoveChild(child);
    };
  };
  // 로그아웃 메시지 생성
  const getLogoutMessage = (notification) => {
    const { changeType, reason } = notification;
    switch (changeType) {
      case "BAN":
        return `죄송합니다. 귀하의 계정이 정지되었습니다.\n\n정지 사유: ${reason}\n\n자세한 문의는 고객센터로 연락해 주세요.`;
      case "ROLE_CHANGE":
        return `귀하의 권한이 변경되었습니다.\n\n변경 내용: ${reason}\n\n새로운 권한을 적용하기 위해 다시 로그인해 주세요.`;
      case "STATUS_CHANGE":
        return `귀하의 계정 상태가 변경되었습니다.\n\n변경 내용: ${reason}\n\n보안을 위해 다시 로그인해 주세요.`;
      default:
        return `관리자에 의해 계정 설정이 변경되었습니다.\n\n보안을 위해 다시 로그인해 주세요.`;
    }
  };
};

export default useForcedLogoutListener;
