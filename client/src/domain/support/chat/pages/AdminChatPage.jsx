import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BasicLayout from "../../../../layouts/BasicLayout";
import AdminChatList from "../components/AdminChatList";
import ChatRoom from "../components/ChatRoom";
import { AdminManagerComponent } from "../../../../common/config/ProtectedAdmin";

const AdminChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  // 라우터에서 전달받은 채팅방 ID가 있으면 설정
  useEffect(() => {
    if (location.state?.selectedChatRoomId) {
      setSelectedChatRoomId(location.state.selectedChatRoomId);
    }
  }, [location.state]);

  const handleSelectChatRoom = (chatRoomId) => {
    setSelectedChatRoomId(chatRoomId);
  };

  const handleBackToList = () => {
    setSelectedChatRoomId(null);
    // 관리자 채팅 목록으로 돌아가기
    navigate("/support/admin/chat");
  };
  return (
    <AdminManagerComponent redirectOnNoAuth={true}>
      <BasicLayout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">관리자 채팅 관리</h1>
                  <p className="text-green-100 text-sm">
                    고객 상담을 관리하고 참여하세요
                  </p>
                </div>
                {selectedChatRoomId && (
                  <button
                    onClick={handleBackToList}
                    className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                  >
                    ← 목록으로
                  </button>
                )}
              </div>
            </div>

            <div className="h-[700px]">
              {selectedChatRoomId ? (
                <ChatRoom chatRoomId={selectedChatRoomId} isAdmin={true} />
              ) : (
                <AdminChatList onSelectChatRoom={handleSelectChatRoom} />
              )}
            </div>
          </div>
        </div>
      </BasicLayout>
    </AdminManagerComponent>
  );
};

export default AdminChatPage;
