import websocketService from "../../../support/chat/services/websocketService";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminHeader = () => {
  const { loginState } = useCustomLogin();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 웹소켓 연결 상태 모니터링
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
  // 현재 페이지가 채팅관리인지 회원관리인지 확인
  const isCurrentChatAdmin = location.pathname.includes("/admin/chat");
  const isCurrentMemberAdmin = location.pathname.includes("/admin/member");

  // 토글 버튼 핸들러
  const handleToggleAdmin = (type) => {
    if (type === "chat" && !isCurrentChatAdmin) {
      navigate("/admin/chat");
    } else if (type === "member" && !isCurrentMemberAdmin) {
      navigate("/admin");
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            관리자 대시보드
          </h1>

          <p className="text-gray-600 text-sm sm:text-base mb-3">
            관리자:
            <span className="font-medium text-teal-600">
              {loginState?.email}
            </span>
            {loginState?.nickname && (
              <span className="text-gray-500"> ({loginState.nickname})</span>
            )}
          </p>

          {/* 토글 버튼 */}
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => handleToggleAdmin("chat")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isCurrentChatAdmin
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              💬 채팅관리
            </button>
            <button
              onClick={() => handleToggleAdmin("member")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isCurrentMemberAdmin
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              👥 회원관리
            </button>
          </div>
        </div>
        {/* 오른쪽 상태 정보 카드 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-[280px]">
          <div className="space-y-3">
            {/* 관리 권한 상태 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                관리 권한
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  loginState?.role === "ADMIN"
                    ? "bg-teal-100 text-teal-800"
                    : loginState?.role === "MANAGER"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {loginState?.role === "ADMIN"
                  ? "👑 관리자"
                  : loginState?.role === "MANAGER"
                  ? "🛡️ 매니저"
                  : "👤 일반사용자"}
              </span>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-100"></div>

            {/* 웹소켓 상태 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                실시간 알림
              </span>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${
                  isWebSocketConnected &&
                  websocketService.subscriptions.size > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isWebSocketConnected && websocketService.subscriptions.size > 0
                  ? "🔔 연결됨"
                  : "🔕 연결 안됨"}
              </button>
            </div>

            {/* 웹소켓 연결 경고 */}
            {(!isWebSocketConnected ||
              websocketService.subscriptions.size === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                <p className="text-xs text-amber-700 text-center">
                  ⚠️ 구독이 안되어 있으면 새로고침해 주세요
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 구독 상태 모달 - 모든 관리자 페이지에서 */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                실시간 알림 구독 상태
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {/* 웹소켓 연결 상태 */}
              <div className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    웹소켓 연결
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isWebSocketConnected
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isWebSocketConnected ? "✅ 연결됨" : "❌ 연결 안됨"}
                  </span>
                </div>
              </div>

              {/* 현재 페이지별 구독 상태 */}
              {isCurrentChatAdmin ? (
                // 채팅관리 페이지일 때 - 채팅 관련 토픽만 표시
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">
                    💬 채팅관리 구독 상태
                  </h4>

                  {/* 채팅 관리 토픽 */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        채팅 상태 알림
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        /topic/chat/admin/status
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        Array.from(websocketService.subscriptions.keys()).some(
                          (key) => key.includes("/topic/chat/admin")
                        )
                          ? "bg-teal-100 text-teal-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {Array.from(websocketService.subscriptions.keys()).some(
                        (key) => key.includes("/topic/chat/admin")
                      )
                        ? "📢 구독중"
                        : "🔇 미구독"}
                    </span>
                  </div>

                  {/* 공통 로그아웃 큐 */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        강제 로그아웃 알림
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        /queue/member/{loginState?.memberNo}/logout
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        Array.from(websocketService.subscriptions.keys()).some(
                          (key) =>
                            key.includes(
                              `/queue/member/${loginState?.memberNo}/logout`
                            )
                        )
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {Array.from(websocketService.subscriptions.keys()).some(
                        (key) =>
                          key.includes(
                            `/queue/member/${loginState?.memberNo}/logout`
                          )
                      )
                        ? "📢 구독중"
                        : "🔇 미구독"}
                    </span>
                  </div>
                </div>
              ) : (
                // 회원관리 페이지일 때 - 로그아웃 알림만 표시
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">
                    👥 회원관리 구독 상태
                  </h4>

                  {/* 공통 로그아웃 큐 */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        강제 로그아웃 알림
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        /queue/member/{loginState?.memberNo}/logout
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        Array.from(websocketService.subscriptions.keys()).some(
                          (key) =>
                            key.includes(
                              `/queue/member/${loginState?.memberNo}/logout`
                            )
                        )
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {Array.from(websocketService.subscriptions.keys()).some(
                        (key) =>
                          key.includes(
                            `/queue/member/${loginState?.memberNo}/logout`
                          )
                      )
                        ? "📢 구독중"
                        : "🔇 미구독"}
                    </span>
                  </div>
                </div>
              )}

              {/* 연결 안내 메시지 */}
              <div className="bg-gray-50 rounded-lg p-3 mt-4">
                {websocketService.subscriptions.size === 0 && (
                  <div className="text-xs text-amber-600 text-center">
                    ⚠️ 구독이 없으면 새로고침을 해주세요
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeader;
