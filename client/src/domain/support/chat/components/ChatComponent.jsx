import React, { useState } from "react";
import ChatRoom from "./ChatRoom";

const ChatComponent = () => {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
    }
  };

  const handleLeave = () => {
    setIsJoined(false);
    setUsername("");
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💬</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              실시간 채팅
            </h1>
            <p className="text-gray-600">Spring Boot + React + WebSocket</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자 이름
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition duration-200"
                placeholder="이름을 입력하세요..."
                required
                maxLength={20}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition duration-200 shadow-lg"
            >
              채팅 시작하기 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <ChatRoom username={username} onLeave={handleLeave} />;
};

export default ChatComponent;
