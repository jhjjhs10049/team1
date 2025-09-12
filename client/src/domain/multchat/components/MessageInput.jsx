import React, { useState, useRef } from "react";
import "../styles/MessageInput.css";
import "../styles/MobileMultChatStyles.css";

const MessageInput = ({
  onSendMessage,
  disabled,
  isConnected = true,
  showJoinModal = false,
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const isInputDisabled = disabled || !isConnected || showJoinModal;

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
    inputRef.current?.focus();
  };
  return (
    <div className="multchat-input-container hardware-accelerated">
      {/* 이모지 버튼들 */}
      <div className="multchat-emoji-container">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => addEmoji(emoji)}
            className={`multchat-emoji-button touch-optimized ${
              isInputDisabled ? "disabled" : ""
            }`}
            disabled={isInputDisabled}
          >
            {emoji}
          </button>
        ))}
      </div>
      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="multchat-input-form">
        <div className="multchat-input-wrapper">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isInputDisabled
                ? "연결 중..."
                : "메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            }
            disabled={isInputDisabled}
            className="multchat-input-textarea optimized-text"
            rows="2"
            maxLength={500}
          />
          <div
            className={`multchat-character-count ${
              isInputDisabled ? "disabled" : "enabled"
            }`}
          >
            {message.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={isInputDisabled || !message.trim()}
          className="multchat-send-button touch-optimized"
        >
          <span className="multchat-send-button-text">전송</span>
          <svg
            className="multchat-send-button-icon"
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
