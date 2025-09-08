import React, { useEffect, useRef } from "react";

const MessageList = ({ messages, currentUserNickname, chatRoom }) => {
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      // 페이지 스크롤 대신 컨테이너 스크롤만 제어
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }; // 메시지가 추가될 때만 스크롤을 하단으로 이동
  useEffect(() => {
    if (messages && messages.length > 0) {
      // 메시지 개수가 변경된 경우에만 스크롤
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages]); // messages를 의존성으로 사용하여 새 메시지가 추가될 때만 실행

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message, index) => {
    const isOwn = message.senderNickname === currentUserNickname;
    const isSystem = message.messageType === "SYSTEM";
    const isAdmin = message.messageType === "ADMIN";

    if (isSystem) {
      return (
        <div key={index} className="flex justify-center mb-4">
          <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm">
            <div className="flex items-center space-x-2">
              <span>ℹ️</span>
              <span>{message.message}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex ${
            isOwn ? "flex-row-reverse" : "flex-row"
          } items-end space-x-2`}
        >
          {/* 프로필 아바타 */}
          {!isOwn && (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                isAdmin ? "bg-green-500" : "bg-teal-500"
              }`}
            >
              {message.senderNickname?.charAt(0).toUpperCase() || "?"}
            </div>
          )}

          <div
            className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
          >
            {/* 발신자 이름 */}
            {!isOwn && (
              <div className="flex items-center space-x-2 mb-1">
                <span
                  className={`text-sm font-medium ${
                    isAdmin ? "text-green-600" : "text-teal-600"
                  }`}
                >
                  {message.senderNickname}
                </span>
                {isAdmin && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    상담원
                  </span>
                )}
              </div>
            )}

            {/* 메시지 버블 */}
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                isOwn
                  ? "bg-teal-500 text-white rounded-l-lg rounded-tr-lg"
                  : isAdmin
                  ? "bg-green-100 text-green-800 rounded-r-lg rounded-tl-lg border border-green-200"
                  : "bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg"
              } px-4 py-2 shadow-sm`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.message}
              </p>
            </div>

            {/* 시간 */}
            <div
              className={`text-xs text-gray-500 mt-1 ${
                isOwn ? "text-right" : "text-left"
              }`}
            >
              {formatTime(message.sentAt)}
              {isOwn && message.readStatus === "Y" && (
                <span className="ml-1 text-teal-500">✓</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {chatRoom?.status === "WAITING" ? (
            <>
              <div className="text-4xl mb-4">⏰</div>
              <p className="text-gray-600 mb-2 font-semibold">
                상담원 배정 대기 중
              </p>
              <p className="text-sm text-gray-500 mb-4">
                상담원이 배정되면 채팅을 시작할 수 있습니다.
              </p>
              <div className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                대기 중...
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-500 mb-2">아직 메시지가 없습니다.</p>
              <p className="text-sm text-gray-400">첫 메시지를 보내보세요!</p>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      ref={messageContainerRef}
      className="flex-1 overflow-y-auto bg-gray-50"
    >
      <div className="p-4 space-y-4">
        {/* 채팅 시작 안내 메시지 */}
        <div className="flex justify-center mb-6">
          <div className="bg-teal-100 text-teal-700 px-4 py-2 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <span>💬</span>
              <span>1대1 상담이 시작되었습니다.</span>
            </div>
          </div>
        </div>

        {/* 메시지 목록 */}
        {messages.map((message, index) => renderMessage(message, index))}

        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
