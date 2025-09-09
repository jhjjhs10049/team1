import React, { useEffect, useRef, useCallback, useState } from "react";
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
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    // 채팅 메시지 컨테이너만 스크롤, 전체 페이지 스크롤 방지
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // 스크롤 위치가 맨 아래인지 확인하는 함수
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;

    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // 스크롤이 맨 아래에서 약간의 여유(50px)를 두고 판단
    const threshold = 50;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);
  useEffect(() => {
    if (messages && messages.length > 0) {
      // 스크롤이 가장 아래에 있을 때만 새 메시지가 와도 자동으로 스크롤
      if (isAtBottom) {
        const timer = setTimeout(() => {
          scrollToBottom();
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, scrollToBottom, isAtBottom]);

  // 컴포넌트 마운트 시 초기 스크롤 위치 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
      setIsAtBottom(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [scrollToBottom]);
  // 무한 스크롤 핸들러
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const threshold = MULTCHAT_CONFIG.SCROLL_THRESHOLD; // 설정에서 가져온 임계값

    // 스크롤 위치가 맨 아래인지 업데이트
    setIsAtBottom(checkIfAtBottom());

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
  }, [hasMoreMessages, loadingMore, onLoadMore, checkIfAtBottom]);
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
          className="flex justify-center mb-3"
        >
          <div className="bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 text-center flex items-center space-x-2">
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
        className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex ${
            isOwn ? "flex-row-reverse" : "flex-row"
          } items-end space-x-2 max-w-[70%]`}
        >
          {/* 프로필 아바타 */}
          {!isOwn && (
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {message.senderNickname?.charAt(0).toUpperCase() || "?"}
            </div>
          )}

          <div
            className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
          >
            {/* 발신자 이름 */}
            {!isOwn && (
              <div className="mb-1">
                <span className="text-xs text-gray-500 font-medium">
                  {message.senderNickname}
                </span>
              </div>
            )}
            {/* 메시지 버블 */}
            <div
              className={`px-3 py-2 rounded-lg shadow-sm ${
                isOwn
                  ? "bg-teal-500 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
            {/* 시간 */}
            <div
              className={`text-xs mt-1 text-gray-400 ${
                isOwn ? "text-right" : "text-left"
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
      <div className="space-y-1 p-4 pb-4">
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
