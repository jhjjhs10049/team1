import React from "react";
import { useNavigate } from "react-router-dom";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatSidebar from "./ChatSidebar";
import ChatMobileHeader from "./ChatMobileHeader";
import ChatExitModal from "./ChatExitModal";
import useChatRoomInfo from "../hooks/useChatRoomInfo";
import useChatMessages from "../hooks/useChatMessages";
import useWebSocketConnection from "../hooks/useWebSocketConnection";
import useChatExit from "../hooks/useChatExit";
import useResponsive from "../hooks/useResponsive";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const ChatRoom = ({ chatRoomId, isAdmin = false }) => {
  const navigate = useNavigate();
  const { loginState } = useCustomLogin();
  // 커스텀 훅들 사용
  const { isMobile, showSidebar, setShowSidebar } = useResponsive();
  const { chatRoom, setChatRoom, loading } = useChatRoomInfo(
    chatRoomId,
    isAdmin,
    navigate
  );
  const { messages, handleSendMessage } = useChatMessages(
    chatRoom,
    isAdmin,
    loginState
  );
  useWebSocketConnection(chatRoom, setChatRoom, navigate); // 웹소켓 연결만 처리
  const { showExitConfirm, handleLeave, handleExitConfirm, handleExitCancel } =
    useChatExit(chatRoom, isAdmin, navigate);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">채팅방을 불러오는 중...</div>
      </div>
    );
  }

  if (!chatRoom) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">채팅방을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const currentUserNickname = isAdmin
    ? loginState?.nickname || "Admin"
    : loginState?.nickname || "User";

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden relative">
      {/* 모바일 사이드바 배경 오버레이 */}{" "}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      {/* 사이드바 */}
      <ChatSidebar
        chatRoom={chatRoom}
        isMobile={isMobile}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        onLeave={handleLeave}
        isAdmin={isAdmin}
      />
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 모바일용 헤더 */}
        {isMobile && (
          <ChatMobileHeader
            chatRoom={chatRoom}
            setShowSidebar={setShowSidebar}
            onLeave={handleLeave}
          />
        )}

        <MessageList
          messages={messages}
          currentUserNickname={currentUserNickname}
          chatRoom={chatRoom}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={
            chatRoom.status === "ENDED" ||
            chatRoom.status === "WAITING" ||
            chatRoom.status === "REJECTED"
          }
          chatRoomStatus={chatRoom.status}
        />
      </div>
      {/* 나가기 확인 모달 */}
      <ChatExitModal
        show={showExitConfirm}
        chatRoom={chatRoom}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />
    </div>
  );
};

export default ChatRoom;
