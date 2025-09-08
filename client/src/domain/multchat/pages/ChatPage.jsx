import React from "react";
import { Routes, Route } from "react-router-dom";
import MultChatRoomList from "../components/MultChatRoomList";
import ChatRoom from "../components/ChatRoom";
import MultChatRoomCreate from "../components/MultChatRoomCreate";

const MultChatPage = () => {
  return (
    <Routes>
      {/* 채팅방 목록 (메인 페이지) */}
      <Route
        path="/"
        element={
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* 페이지 헤더 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  단체 채팅
                </h1>
              </div>

              {/* 채팅방 목록 */}
              <MultChatRoomList />
            </div>
          </div>
        }
      />
      {/* 채팅방 생성 */}
      <Route path="/create" element={<MultChatRoomCreate />} /> {/* 채팅방 */}
      <Route path="/room/:roomNo" element={<ChatRoom />} />
    </Routes>
  );
};

export default MultChatPage;
