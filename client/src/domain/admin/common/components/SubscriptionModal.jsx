import { useLocation } from "react-router-dom";
import websocketService from "../../../global/service/websocketService";
import useWebSocketStatus from "../hooks/useWebSocketStatus";

const SubscriptionModal = ({ isOpen, onClose, loginState }) => {
  const location = useLocation();
  const { isWebSocketConnected } = useWebSocketStatus();

  const isCurrentChatAdmin = location.pathname.includes("/admin/chat");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            실시간 알림 구독 상태
          </h3>
          <button
            onClick={onClose}
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
            // 채팅관리 페이지
            <ChatAdminSubscriptions
              loginState={loginState}
              websocketService={websocketService}
            />
          ) : (
            // 회원관리 페이지
            <MemberAdminSubscriptions
              loginState={loginState}
              websocketService={websocketService}
            />
          )}

          {/* 연결 안내 메시지 */}
          <div className="bg-gray-50 rounded-lg p-3 mt-4">
            {websocketService.subscriptions?.size === 0 && (
              <div className="text-xs text-amber-600 text-center">
                ⚠️ 구독이 없으면 새로고침을 해주세요
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// 채팅관리 구독 상태 컴포넌트
const ChatAdminSubscriptions = ({ loginState, websocketService }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-800 mb-3">
      💬 채팅관리 구독 상태
    </h4>

    {/* 채팅 관리 토픽 */}
    <SubscriptionItem
      title="채팅 상태 알림"
      destination="/topic/chat/admin/status"
      isSubscribed={Array.from(
        websocketService.subscriptions?.keys() || []
      ).some((key) => key.includes("/topic/chat/admin"))}
      color="teal"
    />

    {/* 공통 로그아웃 큐 */}
    <SubscriptionItem
      title="강제 로그아웃 알림"
      destination={`/queue/member/${loginState?.memberNo}/logout`}
      isSubscribed={Array.from(
        websocketService.subscriptions?.keys() || []
      ).some((key) =>
        key.includes(`/queue/member/${loginState?.memberNo}/logout`)
      )}
      color="purple"
    />
  </div>
);

// 회원관리 구독 상태 컴포넌트
const MemberAdminSubscriptions = ({ loginState, websocketService }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-800 mb-3">
      👥 회원관리 구독 상태
    </h4>

    <SubscriptionItem
      title="강제 로그아웃 알림"
      destination={`/queue/member/${loginState?.memberNo}/logout`}
      isSubscribed={Array.from(
        websocketService.subscriptions?.keys() || []
      ).some((key) =>
        key.includes(`/queue/member/${loginState?.memberNo}/logout`)
      )}
      color="purple"
    />
  </div>
);

// 구독 아이템 컴포넌트
const SubscriptionItem = ({ title, destination, isSubscribed, color }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100">
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <span className="text-xs text-gray-500 font-mono">{destination}</span>
    </div>
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        isSubscribed
          ? `bg-${color}-100 text-${color}-800`
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isSubscribed ? "📢 구독중" : "🔇 미구독"}
    </span>
  </div>
);

export default SubscriptionModal;
