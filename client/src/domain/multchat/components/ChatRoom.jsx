import React from "react";
import ChatRoomSidebar from "./ChatRoomSidebar";
import ChatRoomMain from "./ChatRoomMain";
import useChatRoomLogic from "../hooks/useChatRoomLogic";

const ChatRoom = ({ onLeave }) => {
  const {
    messages,
    roomInfo,
    loading,
    hasMoreMessages,
    loadingMore,
    username,
    participantCount,
    isWebSocketConnected,
    participants,
    loadMoreMessages,
    sendMessage,
    handleLeave,
  } = useChatRoomLogic();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-600">채팅방을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex bg-gray-50 h-[700px] rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* 사이드바 */}
        <ChatRoomSidebar
          roomInfo={roomInfo}
          participantCount={participantCount}
          participants={participants}
          username={username}
          isWebSocketConnected={isWebSocketConnected}
          onLeave={() => handleLeave(onLeave)}
        />

        {/* 메인 채팅 영역 */}
        <ChatRoomMain
          roomInfo={roomInfo}
          participantCount={participantCount}
          isWebSocketConnected={isWebSocketConnected}
          messages={messages}
          username={username}
          onLoadMore={loadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          loadingMore={loadingMore}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
