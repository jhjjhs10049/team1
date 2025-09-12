import React, { useEffect, useRef, useCallback, useState } from "react";
import { formatTime } from "../utils/timeUtils";
import { MULTCHAT_CONFIG } from "../../../common/config/pageConfig";
import "../styles/MessageList.css";
import "../styles/MobileMultChatStyles.css";

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
          className="multchat-system-message"
        >
          <div className="multchat-system-message-content">
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
        className={`multchat-message-item ${isOwn ? "own" : "other"}`}
      >
        <div className={`multchat-message-wrapper ${isOwn ? "own" : "other"}`}>
          {/* 프로필 아바타 */}
          {!isOwn && (
            <div className="multchat-profile-avatar">
              {message.senderNickname?.charAt(0).toUpperCase() || "?"}
            </div>
          )}

          <div
            className={`multchat-message-content ${isOwn ? "own" : "other"}`}
          >
            {/* 발신자 이름 */}
            {!isOwn && (
              <div className="multchat-sender-name">
                <span className="multchat-sender-name-text">
                  {message.senderNickname}
                </span>
              </div>
            )}
            {/* 메시지 버블 */}
            <div
              className={`multchat-message-bubble ${isOwn ? "own" : "other"}`}
            >
              <div className="multchat-message-text">{message.content}</div>
            </div>
            {/* 시간 */}
            <div className={`multchat-message-time ${isOwn ? "own" : "other"}`}>
              {formatTime(message.createdAt || message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (!messages || messages.length === 0) {
    return (
      <div className="multchat-empty-state">
        <div className="multchat-empty-state-content">
          <div className="multchat-empty-state-emoji">💬</div>
          <p className="multchat-empty-state-title">아직 메시지가 없습니다.</p>
          <p className="multchat-empty-state-subtitle">
            첫 메시지를 보내보세요!
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={messagesContainerRef}
      className="multchat-message-list-container optimized-scroll hardware-accelerated"
      onScroll={handleScroll}
    >
      <div className="multchat-message-list-content">
        {/* 로딩 인디케이터 (상단에 표시) */}
        {loadingMore && (
          <div className="multchat-loading-indicator">
            <div className="multchat-loading-content">
              <div className="multchat-loading-spinner"></div>
              <span className="multchat-loading-text">
                이전 메시지 로드 중...
              </span>
            </div>
          </div>
        )}
        {/* 더 이상 로드할 메시지가 없을 때 표시 */}
        {!hasMoreMessages && messages.length > 0 && (
          <div className="multchat-message-end">
            <div className="multchat-message-end-content">
              <span className="multchat-message-end-text">
                처음 메시지입니다
              </span>
            </div>
          </div>
        )}
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} className="multchat-scroll-anchor" />
      </div>
    </div>
  );
};

export default MessageList;
