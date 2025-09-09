import React, { useState, useRef } from "react";

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
    <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
      {/* 이모지 버튼들 */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 pb-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => addEmoji(emoji)}
            className={`text-lg sm:text-xl rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition duration-200 flex-shrink-0 ${
              isInputDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            disabled={isInputDisabled}
          >
            {emoji}
          </button>
        ))}
      </div>
      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <div className="flex-1 relative">
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
            className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg resize-none outline-none transition duration-200 min-h-[60px] ${
              isInputDisabled
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                : "border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            }`}
            rows="2"
            maxLength={500}
          />
          <div
            className={`absolute bottom-1 right-2 sm:bottom-2 text-xs ${
              isInputDisabled ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {message.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={isInputDisabled || !message.trim()}
          className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-1 transition duration-200 min-h-[60px] flex-shrink-0 ${
            isInputDisabled || !message.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-600"
          }`}
        >
          <span className="text-sm">전송</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
