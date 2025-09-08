import React from "react";

/**
 * 채팅방 헤더 컴포넌트
 */
const ChatRoomHeader = ({
  roomInfo,
  participantCount,
  isWebSocketConnected,
}) => {
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <h1 className="text-lg font-semibold text-gray-800">
        💬 {roomInfo?.roomName || "단체 채팅방"}
      </h1>
      <p className="text-sm text-gray-500">
        {participantCount}명이 참여 중
        {isWebSocketConnected ? "(실시간)" : "(연결 중...)"}
      </p>
    </div>
  );
};

export default ChatRoomHeader;
