import React from "react";
import { useNavigate } from "react-router-dom";
import ParticipantList from "./ParticipantList";
import MultChatExitModal from "./MultChatExitModal";
import useMultChatExit from "../hooks/useMultChatExit";

/**
 * 채팅방 사이드바 컴포넌트 (참가자 목록 + 채팅방 정보)
 */
const ChatRoomSidebar = ({
  roomInfo,
  participantCount,
  participants,
  username,
  isWebSocketConnected,
  onLeave,
  isMobile,
  showSidebar,
  setShowSidebar,
}) => {
  const navigate = useNavigate();

  // 나가기 기능 훅 사용
  const {
    showExitConfirm,
    isLeaving,
    isCreator,
    handleLeave,
    handleExitConfirm,
    handleExitCancel,
  } = useMultChatExit(roomInfo, username, navigate);
  return (
    <div
      className={`${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"
          } shadow-lg`
          : "w-80 bg-white border-r border-gray-200"
        } flex flex-col overflow-hidden`}
    >
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 bg-teal-500 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">💬 단체 채팅</h2>
          {isMobile && (
            <button
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-teal-600 rounded"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${isWebSocketConnected ? "bg-green-400" : "bg-red-400"
              }`}
          ></div>
          <span className="text-sm">
            {isWebSocketConnected ? "연결됨" : "연결 중..."}
          </span>
        </div>
      </div>
      {/* 채팅방 정보 */}
      {roomInfo && (
        <div className="p-3 border-b border-gray-200 bg-teal-50">
          <h3 className="font-semibold text-gray-800 mb-1 text-sm">
            {roomInfo.roomName}
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>참가자</span>
              <span className="font-medium text-teal-600">
                {participantCount}/{roomInfo.maxParticipants}명
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>방장</span>
              <span className="font-medium">{roomInfo.creatorNickname}</span>
            </div>
          </div>
        </div>
      )}
      {/* 현재 사용자 정보 */}
      <div className="p-3 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {username && typeof username === "string" && username.length > 0
              ? username.charAt(0).toUpperCase()
              : "U"}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">
              {username}
            </div>
            <div className="text-xs text-gray-500">나</div>
          </div>
          <button
            onClick={handleLeave}
            disabled={isLeaving}
            className={`px-2 py-1 text-xs text-white rounded transition duration-200 ${isLeaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
              }`}
          >
            {isLeaving ? "나가는 중..." : "나가기"}
          </button>
        </div>
      </div>
      {/* 참가자 목록 */}
      <div className="flex-1 overflow-y-auto">
        <ParticipantList participants={participants} currentUser={username} />
      </div>

      {/* 나가기 확인 모달 */}
      <MultChatExitModal
        isOpen={showExitConfirm}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
        roomInfo={roomInfo}
        isCreator={isCreator}
      />
    </div>
  );
};

export default ChatRoomSidebar;
