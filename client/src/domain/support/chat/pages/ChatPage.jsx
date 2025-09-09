import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BasicLayout from "../../../../layouts/BasicLayout";
import ChatRoom from "../components/ChatRoom";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const ChatPage = () => {
  const { chatRoomId } = useParams();
  const { loginState } = useCustomLogin();
  const [isMobile, setIsMobile] = useState(false);

  // 로그인한 사용자가 관리자인지 확인
  const isAdmin =
    loginState?.roleNames?.includes("ADMIN") ||
    loginState?.roleNames?.includes("MANAGER");
  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  console.log(
    "ChatPage - 사용자 권한:",
    loginState?.roleNames,
    "관리자 여부:",
    isAdmin
  );

  return (
    <BasicLayout>
      <div className={`mx-auto ${isMobile ? "p-0" : "max-w-7xl p-6"}`}>
        {!isMobile && (
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? "관리자 채팅 상담" : "1대1 고객 상담"}
          </h1>
        )}
        <div
          className={`bg-white ${
            isMobile ? "" : "rounded-lg border border-gray-200 shadow-sm"
          } overflow-hidden`}
        >
          <div
            className={`${
              isMobile ? "h-[calc(100vh-64px)]" : "h-[calc(100vh-250px)]"
            }`}
          >
            <ChatRoom chatRoomId={chatRoomId} isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default ChatPage;
