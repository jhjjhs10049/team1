import React from "react";
import { useNavigate } from "react-router-dom";

const ChatButton = () => {
  const navigate = useNavigate();

  const handleChatClick = () => {
    navigate("/support/chat");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleChatClick}
        className="bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        aria-label="1대1 채팅 문의"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* 툴팁 */}
      <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        1대1 채팅 문의
      </div>
    </div>
  );
};

export default ChatButton;
