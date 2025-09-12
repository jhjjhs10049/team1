import React, { useState } from "react";
import "../styles/ChatInput.css";
import "../styles/MobileChatStyles.css";

const MessageInput = ({ onSendMessage, disabled, chatRoomStatus }) => {
  const [message, setMessage] = useState("");
  const getPlaceholderText = () => {
    if (chatRoomStatus === "WAITING") {
      return "상담원 배정을 기다리고 있습니다. 잠시만 기다려 주세요...";
    } else if (chatRoomStatus === "ENDED") {
      return "상담이 종료되었습니다. 새로운 문의는 새 채팅방을 생성해 주세요.";
    } else if (chatRoomStatus === "REJECTED") {
      return "상담이 거절되었습니다. 새로운 문의는 새 채팅방을 생성해 주세요.";
    } else if (disabled) {
      return "연결 중입니다...";
    } else {
      return "메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)";
    }
  };

  const isInputDisabled =
    disabled ||
    chatRoomStatus === "WAITING" ||
    chatRoomStatus === "ENDED" ||
    chatRoomStatus === "REJECTED";
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isInputDisabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isInputDisabled) {
        handleSubmit(e);
      }
    }
  };

  const emojis = ["😀", "😂", "❤️", "👍", "👎", "😢", "😮", "😡", "✨", "🎉"];

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };
  return (
    <div className="chat-input-container hardware-accelerated">
      {/* WAITING 상태 알림 */}
      {chatRoomStatus === "WAITING" && (
        <div className="chat-status-alert waiting">
          <div className="chat-status-alert-content">
            <div className="chat-status-spinner"></div>
            <span className="chat-status-text">
              상담원 배정 중입니다. 잠시만 기다려 주세요.
            </span>
          </div>
        </div>
      )}
      {/* REJECTED 상태 알림 */}
      {chatRoomStatus === "REJECTED" && (
        <div className="chat-status-alert rejected">
          <div className="chat-status-alert-content">
            <div className="chat-status-icon">❌</div>
            <span className="chat-status-text rejected">
              상담이 거절되었습니다. 새로운 문의를 위해 새 채팅방을 생성해
              주세요.
            </span>
          </div>
        </div>
      )}
      {/* 이모지 버튼들 */}
      <div className="emoji-container">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => addEmoji(emoji)}
            className={`emoji-button touch-optimized ${
              isInputDisabled ? "disabled" : ""
            }`}
            disabled={isInputDisabled}
          >
            {emoji}
          </button>
        ))}
      </div>
      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            disabled={isInputDisabled}
            className="input-textarea optimized-text"
            rows="2"
            maxLength={500}
          />
          <div
            className={`character-count ${
              isInputDisabled ? "disabled" : "enabled"
            }`}
          >
            {message.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={isInputDisabled || !message.trim()}
          className="send-button touch-optimized"
        >
          <span className="send-button-text">전송</span>
          <svg
            className="send-button-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
