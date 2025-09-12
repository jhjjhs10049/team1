import React, { useEffect, useRef, useCallback, useState } from "react";
import "../styles/MessageList.css";
import "../styles/MobileChatStyles.css";

const MessageList = ({ messages, currentUserNickname, chatRoom }) => {
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      // 페이지 스크롤 대신 컨테이너 스크롤만 제어
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, []);

  // 스크롤 위치가 맨 아래인지 확인하는 함수
  const checkIfAtBottom = useCallback(() => {
    if (!messageContainerRef.current) return true;

    const container = messageContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // 스크롤이 맨 아래에서 약간의 여유(50px)를 두고 판단
    const threshold = 50;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    // 스크롤 위치가 맨 아래인지 업데이트
    setIsAtBottom(checkIfAtBottom());
  }, [checkIfAtBottom]);

  // 메시지가 추가될 때 스크롤을 하단으로 이동 (맨 아래에 있을 때만)
  useEffect(() => {
    if (messages && messages.length > 0) {
      // 스크롤이 가장 아래에 있을 때만 새 메시지가 와도 자동으로 스크롤
      if (isAtBottom) {
        const timer = setTimeout(() => {
          scrollToBottom();
        }, 100);
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message, index) => {
    const isOwn = message.senderNickname === currentUserNickname;
    const isSystem = message.messageType === "SYSTEM";
    const isAdmin = message.messageType === "ADMIN";
    if (isSystem) {
      return (
        <div key={index} className="system-message">
          <div className="system-message-content">
            <div className="system-message-inner">
              <span>ℹ️</span>
              <span>{message.message}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`message-item ${isOwn ? "own" : "other"} layout-stable`}
      >
        <div className={`message-wrapper ${isOwn ? "own" : "other"}`}>
          {/* 프로필 아바타 */}
          {!isOwn && (
            <div className={`profile-avatar ${isAdmin ? "admin" : "user"}`}>
              {message.senderNickname?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div className={`message-content ${isOwn ? "own" : "other"}`}>
            {/* 발신자 이름 */}
            {!isOwn && (
              <div className="sender-info">
                <span className={`sender-name ${isAdmin ? "admin" : "user"}`}>
                  {message.senderNickname}
                </span>
                {isAdmin && <span className="admin-badge">상담원</span>}
              </div>
            )}
            {/* 메시지 버블 */}
            <div
              className={`message-bubble ${
                isOwn ? "own" : isAdmin ? "admin" : "other"
              }`}
            >
              <p className="message-text">{message.message}</p>
            </div>
            {/* 시간 */}
            <div className={`message-time ${isOwn ? "own" : "other"}`}>
              {formatTime(message.sentAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (!messages || messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          {chatRoom?.status === "WAITING" ? (
            <>
              <div className="empty-state-emoji">⏰</div>
              <p className="waiting-state">상담원 배정 대기 중</p>
              <p className="waiting-subtitle">
                상담원이 배정되면 채팅을 시작할 수 있습니다.
              </p>
              <div className="waiting-indicator">
                <div className="waiting-dot"></div>
                대기 중...
              </div>
            </>
          ) : (
            <>
              <div className="empty-state-emoji">💬</div>
              <p className="empty-state-title">아직 메시지가 없습니다.</p>
              <p className="empty-state-subtitle">첫 메시지를 보내보세요!</p>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      ref={messageContainerRef}
      className="message-list-container optimized-scroll hardware-accelerated"
      onScroll={handleScroll}
    >
      <div className="message-list-content">
        {/* 채팅 시작 안내 메시지 */}
        <div className="chat-start-notice">
          <div className="chat-start-notice-content">
            <div className="chat-start-notice-inner">
              <span>💬</span>
              <span>1대1 상담이 시작되었습니다.</span>
            </div>
          </div>
        </div>

        {/* 메시지 목록 */}
        {messages.map((message, index) => renderMessage(message, index))}

        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} className="scroll-anchor" />
      </div>
    </div>
  );
};

export default MessageList;
