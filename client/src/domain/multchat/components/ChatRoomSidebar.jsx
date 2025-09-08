import React from "react";
import ParticipantList from "./ParticipantList";

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
}) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 bg-teal-500 text-white">
        <h2 className="text-lg font-bold mb-2">💬 단체 채팅</h2>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isWebSocketConnected ? "bg-green-400" : "bg-red-400"
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
            onClick={onLeave}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
          >
            나가기
          </button>
        </div>
      </div>

      {/* 참가자 목록 */}
      <div className="flex-1 overflow-y-auto">
        <ParticipantList participants={participants} currentUser={username} />
      </div>
    </div>
  );
};

export default ChatRoomSidebar;
