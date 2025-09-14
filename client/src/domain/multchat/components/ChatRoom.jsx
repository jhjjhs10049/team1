import React from "react";
import ChatRoomSidebar from "./ChatRoomSidebar";
import ChatRoomMain from "./ChatRoomMain";
import ChatRoomMobileHeader from "./ChatRoomMobileHeader";
import useChatRoomLogic from "../hooks/useChatRoomLogic";
import useResponsive from "../hooks/useResponsive";

const ChatRoom = ({ onLeave }) => {
  const {
    messages,
    roomInfo,
    loading,
    hasMoreMessages,
    loadingMore,
    username,
    participantCount,
    isWebSocketConnected,
    participants,
    // hasLeftRoom, // 실제 나감 상태 (사용 안 함)
    loadMoreMessages,
    sendMessage,
    // handleRejoin, // 다시 입장 함수 (사용 안 함)
  } = useChatRoomLogic();

  const { isMobile, showSidebar, setShowSidebar } = useResponsive();

  // 🚫 페이지 이동 시에도 채팅방 소속 유지
  // 나가기 버튼을 누르지 않는 한 채팅방에서 나가지 않음

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-600">채팅방을 불러오는 중...</div>
      </div>
    );
  }

  // 재입장 모달 제거: hasLeftRoom UI를 완전히 숨김
  return (
    <div
      className={`${isMobile ? "h-screen flex flex-col" : "max-w-7xl mx-auto px-4 py-6"
        }`}
    >
      <div
        className={`flex bg-gray-50 ${isMobile
          ? "flex-1 min-h-0"
          : "min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] rounded-lg border border-gray-200 shadow-sm"
          } overflow-hidden relative`}
      >
        {/* 모바일 사이드바 배경 오버레이 */}
        {isMobile && showSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* 사이드바 */}
        <ChatRoomSidebar
          roomInfo={roomInfo}
          participantCount={participantCount}
          participants={participants}
          username={username}
          isWebSocketConnected={isWebSocketConnected}
          onLeave={null} // 🚫 자동 나가기 완전 차단
          isMobile={isMobile}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />

        {/* 메인 채팅 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 모바일용 헤더 */}
          {isMobile && (
            <ChatRoomMobileHeader
              roomInfo={roomInfo}
              participantCount={participantCount}
              setShowSidebar={setShowSidebar}
              username={username}
              isWebSocketConnected={isWebSocketConnected}
            />
          )}

          <ChatRoomMain
            roomInfo={roomInfo}
            participantCount={participantCount}
            isWebSocketConnected={isWebSocketConnected}
            messages={messages}
            username={username}
            onLoadMore={loadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            loadingMore={loadingMore}
            onSendMessage={sendMessage}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
