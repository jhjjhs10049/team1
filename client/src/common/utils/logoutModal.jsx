/**
 * 강제 로그아웃 모달을 표시하는 유틸리티 함수
 */

// 알림 타입별 스타일 반환
const getAlertStyle = (changeType) => {
  switch (changeType) {
    case "BAN":
      return {
        bgColor: "#FEE2E2", // red-100
        icon: "🚫",
      };
    case "ROLE_CHANGE":
      return {
        bgColor: "#DBEAFE", // blue-100
        icon: "👤",
      };
    case "TOKEN_EXPIRED":
      return {
        bgColor: "#FEF3C7", // yellow-100
        icon: "⏰",
      };
    default:
      return {
        bgColor: "#F3F4F6", // gray-100
        icon: "⚠️",
      };
  }
};

/**
 * 강제 로그아웃 모달 표시
 */
export const showLogoutAlert = (
  message,
  onConfirm,
  changeType = "TOKEN_EXPIRED"
) => {
  // 이미 모달이 있으면 제거
  const existingModal = document.querySelector("[data-logout-modal]");
  if (existingModal) {
    existingModal.remove();
  }

  const style = getAlertStyle(changeType);

  // 모달 스타일의 알림 창 생성
  const modalOverlay = document.createElement("div");
  modalOverlay.setAttribute("data-logout-modal", "true");
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
    modalOverlay.remove();
    styleElement.remove();
    onConfirm();
  });

  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);

  // ESC 키로 닫기 방지 (강제 로그아웃이므로)
  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  document.addEventListener("keydown", handleKeydown);

  // 모달이 제거될 때 이벤트 리스너도 제거
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.removedNodes.forEach((node) => {
          if (node === modalOverlay) {
            document.removeEventListener("keydown", handleKeydown);
            observer.disconnect();
          }
        });
      }
    });
  });
  observer.observe(document.body, { childList: true });
};
