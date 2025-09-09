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
  isMobile,
}) => {
  return (
    <div
      className={`flex-1 bg-white flex flex-col ${
        isMobile ? "w-full min-h-0" : ""
      } overflow-hidden`}
    >
      {/* 채팅 헤더 - 데스크톱에서만 표시 */}
      {!isMobile && (
        <ChatRoomHeader
          roomInfo={roomInfo}
          participantCount={participantCount}
          isWebSocketConnected={isWebSocketConnected}
        />
      )}{" "}
      {/* 메시지 목록 - 이 영역이 스크롤 */}
      <div className="flex-1 min-h-0 bg-gray-50 overflow-hidden">
        <MessageList
          messages={messages}
          currentUser={username}
          onLoadMore={onLoadMore}
          hasMoreMessages={hasMoreMessages}
          loadingMore={loadingMore}
        />
      </div>{" "}
      {/* 메시지 입력 - 하단 고정 */}
      <div className="flex-shrink-0 w-full">
        <MessageInput
          onSendMessage={onSendMessage}
          disabled={!isWebSocketConnected}
        />
      </div>
    </div>
  );
};

export default ChatRoomMain;
