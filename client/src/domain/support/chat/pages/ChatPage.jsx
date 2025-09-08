import React from "react";
import { useParams } from "react-router-dom";
import BasicLayout from "../../../../layouts/BasicLayout";
import ChatRoom from "../components/ChatRoom";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const ChatPage = () => {
  const { chatRoomId } = useParams();
  const { loginState } = useCustomLogin();

  // 로그인한 사용자가 관리자인지 확인
  const isAdmin =
    loginState?.roleNames?.includes("ADMIN") ||
    loginState?.roleNames?.includes("MANAGER");

  console.log(
    "ChatPage - 사용자 권한:",
    loginState?.roleNames,
    "관리자 여부:",
    isAdmin
  );
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-purple-600 text-white p-4">
            <h1 className="text-xl font-bold">
              {isAdmin ? "관리자 채팅 상담" : "1대1 고객 상담"}
            </h1>
            <p className="text-teal-100 text-sm">
              {isAdmin
                ? "고객과 실시간으로 상담하세요"
                : "상담원과 실시간으로 대화하세요"}
            </p>
          </div>
          <div className="h-[calc(100vh-200px)]">
            <ChatRoom chatRoomId={chatRoomId} isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default ChatPage;
