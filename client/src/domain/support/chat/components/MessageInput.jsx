import React, { useState } from "react";

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
    <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
      {/* WAITING 상태 알림 */}
      {chatRoomStatus === "WAITING" && (
        <div className="mb-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full flex-shrink-0"></div>
            <span className="text-yellow-700 text-sm font-medium">
              상담원 배정 중입니다. 잠시만 기다려 주세요.
            </span>
          </div>
        </div>
      )}
      {/* REJECTED 상태 알림 */}
      {chatRoomStatus === "REJECTED" && (
        <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 text-red-500 flex-shrink-0">❌</div>
            <span className="text-red-700 text-sm font-medium">
              상담이 거절되었습니다. 새로운 문의를 위해 새 채팅방을 생성해
              주세요.
            </span>
          </div>
        </div>
      )}
      {/* 이모지 버튼들 */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 overflow-x-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => addEmoji(emoji)}
            className={`text-lg sm:text-xl rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition duration-200 flex-shrink-0 ${
              isInputDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
            disabled={isInputDisabled}
          >
            {emoji}
          </button>
        ))}
      </div>
      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            disabled={isInputDisabled}
            className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg resize-none outline-none transition duration-200 ${
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
          className={`px-3 py-3 sm:px-4 rounded-lg font-semibold flex items-center justify-center space-x-1 transition duration-200 h-[68px] ${
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
