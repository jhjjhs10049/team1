import React from "react";

const ChatRoomMobileHeader = ({
  roomInfo,
  participantCount,
  setShowSidebar,
  onLeave,
  isWebSocketConnected,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
      <button
        onClick={() => setShowSidebar(true)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex-1 text-center mx-2">
        <h1 className="text-base font-semibold text-gray-900 truncate">
          💬 {roomInfo?.roomName || "단체 채팅"}
        </h1>
        <div className="flex items-center justify-center space-x-2 mt-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isWebSocketConnected ? "bg-green-400" : "bg-red-400"
            }`}
          ></div>
          <span className="text-xs text-gray-600">
            {isWebSocketConnected
              ? `${participantCount}명 참여중`
              : "연결 중..."}
          </span>
        </div>
      </div>

      <button
        onClick={onLeave}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatRoomMobileHeader;
