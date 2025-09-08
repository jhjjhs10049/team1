import useWebSocketStatus from "../hooks/useWebSocketStatus";

const AdminStatusCard = ({ loginState, onShowModal }) => {
  const { isWebSocketConnected, subscriptionCount } = useWebSocketStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm min-w-[280px]">
      <div className="space-y-3">
        {/* 관리 권한 상태 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">관리 권한</span>
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
          <span className="text-sm text-gray-500 font-medium">실시간 알림</span>
          <button
            onClick={onShowModal}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${
              isWebSocketConnected && subscriptionCount > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isWebSocketConnected && subscriptionCount > 0
              ? "🔔 연결됨"
              : "🔕 연결 안됨"}
          </button>
        </div>

        {/* 웹소켓 연결 경고 */}
        {(!isWebSocketConnected || subscriptionCount === 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
            <p className="text-xs text-amber-700 text-center">
              ⚠️ 구독이 안되어 있으면 새로고침해 주세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatusCard;
