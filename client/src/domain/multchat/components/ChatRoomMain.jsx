import React from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

/**
 * 채팅방 메인 영역 컴포넌트
 */
const ChatRoomMain = ({
  roomInfo,
  participantCount,
  isWebSocketConnected,
  messages,
  username,
  onLoadMore,
  hasMoreMessages,
  loadingMore,
  onSendMessage,
}) => {
  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      {/* 채팅 헤더 */}
      <ChatRoomHeader
        roomInfo={roomInfo}
        participantCount={participantCount}
        isWebSocketConnected={isWebSocketConnected}
      />

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-hidden">
        <div
          className="h-full overflow-y-auto p-4 bg-gray-50"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 #f1f5f9",
          }}
        >
          <MessageList
            messages={messages}
            currentUser={username}
            onLoadMore={onLoadMore}
            hasMoreMessages={hasMoreMessages}
            loadingMore={loadingMore}
          />
        </div>
      </div>

      {/* 메시지 입력 */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={!isWebSocketConnected}
      />
    </div>
  );
};

export default ChatRoomMain;
