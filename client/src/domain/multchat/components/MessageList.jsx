import React, { useEffect, useRef, useCallback } from "react";
import { formatTime } from "../utils/timeUtils";
import { MULTCHAT_CONFIG } from "../../../common/config/pageConfig";

const MessageList = ({
  messages,
  currentUser,
  onLoadMore,
  hasMoreMessages,
  loadingMore,
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    // 채팅 메시지 컨테이너만 스크롤, 전체 페이지 스크롤 방지
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (messages && messages.length > 0) {
      // 새 메시지가 추가될 때마다 즉시 스크롤 (채팅 영역만)
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, scrollToBottom]);

  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const threshold = MULTCHAT_CONFIG.SCROLL_THRESHOLD; // 설정에서 가져온 임계값

    // 스크롤이 맨 위 근처에 있고, 더 로드할 메시지가 있고, 현재 로딩 중이 아닐 때
    if (
      scrollTop < threshold &&
      hasMoreMessages &&
      !loadingMore &&
      onLoadMore
    ) {
      console.log("🔄 무한 스크롤 트리거 - 이전 메시지 로드");
      onLoadMore();
    }
  }, [hasMoreMessages, loadingMore, onLoadMore]);
  const renderMessage = (message, index) => {
    const isOwn =
      message.senderNickname === currentUser ||
      message.senderNo === currentUser?.memberNo;
    const isSystem =
      message.messageType === "SYSTEM" ||
      message.messageType === "JOIN" ||
      message.messageType === "LEAVE";
    if (isSystem) {
      return (
        <div
          key={`system-${message.no || index}-${
            message.createdAt || Date.now()
          }-${index}`}
          className="flex justify-center mb-4"
        >
          <div className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-600 text-center flex items-center space-x-2">
            <span>
              {message.messageType === "JOIN" && "👋"}
              {message.messageType === "LEAVE" && "👋"}
              {(message.messageType === "SYSTEM" || !message.messageType) &&
                "ℹ️"}
            </span>
            <span>{message.content}</span>
          </div>
        </div>
      );
    }
    return (
      <div
        key={`msg-${message.no || index}-${
          message.createdAt || Date.now()
        }-${index}`}
        className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs lg:max-w-md ${isOwn ? "ml-auto" : "mr-auto"}`}
        >
          {!isOwn && (
            <div className="mb-1">
              <span className="text-xs text-gray-500 font-medium">
                {message.senderNickname}
              </span>
            </div>
          )}
          <div
            className={`rounded-lg px-3 py-2 border shadow-sm hover:shadow-md transition-shadow duration-200 ${
              isOwn
                ? "bg-teal-500 text-white border-teal-400"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div
              className={`text-xs mt-1 ${
                isOwn ? "text-teal-100" : "text-gray-400"
              }`}
            >
              {formatTime(message.createdAt || message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-500 mb-2">아직 메시지가 없습니다.</p>
          <p className="text-sm text-gray-400">첫 메시지를 보내보세요!</p>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={messagesContainerRef}
      className="h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="space-y-2 pb-4">
        {/* 로딩 인디케이터 (상단에 표시) */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
              <div className="animate-spin w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full"></div>
              <span className="text-sm text-gray-600">
                이전 메시지 로드 중...
              </span>
            </div>
          </div>
        )}

        {/* 더 이상 로드할 메시지가 없을 때 표시 */}
        {!hasMoreMessages && messages.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-sm text-gray-500">처음 메시지입니다</span>
            </div>
          </div>
        )}

        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
};

export default MessageList;
