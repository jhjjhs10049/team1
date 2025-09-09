import React, { useEffect, useRef, useCallback, useState } from "react";

const MessageList = ({ messages, currentUserNickname, chatRoom }) => {
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      // 페이지 스크롤 대신 컨테이너 스크롤만 제어
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, []);

  // 스크롤 위치가 맨 아래인지 확인하는 함수
  const checkIfAtBottom = useCallback(() => {
    if (!messageContainerRef.current) return true;

    const container = messageContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // 스크롤이 맨 아래에서 약간의 여유(50px)를 두고 판단
    const threshold = 50;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    // 스크롤 위치가 맨 아래인지 업데이트
    setIsAtBottom(checkIfAtBottom());
  }, [checkIfAtBottom]);

  // 메시지가 추가될 때 스크롤을 하단으로 이동 (맨 아래에 있을 때만)
  useEffect(() => {
    if (messages && messages.length > 0) {
      // 스크롤이 가장 아래에 있을 때만 새 메시지가 와도 자동으로 스크롤
      if (isAtBottom) {
        const timer = setTimeout(() => {
          scrollToBottom();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, scrollToBottom, isAtBottom]);

  // 컴포넌트 마운트 시 초기 스크롤 위치 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
      setIsAtBottom(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [scrollToBottom]);

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
        className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        {" "}
        <div
          className={`flex ${
            isOwn ? "flex-row-reverse" : "flex-row"
          } items-end space-x-2 max-w-[70%]`}
        >
          {" "}
          {/* 프로필 아바타 */}
          {!isOwn && (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                isAdmin ? "bg-green-500" : "bg-teal-500"
              }`}
            >
              {message.senderNickname?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div
            className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
          >
            {" "}
            {/* 발신자 이름 */}
            {!isOwn && (
              <div className="flex items-center space-x-2 mb-1">
                <span
                  className={`text-xs font-medium ${
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
            )}{" "}
            {/* 메시지 버블 */}
            <div
              className={`px-3 py-2 shadow-sm ${
                isOwn
                  ? "bg-teal-500 text-white rounded-l-lg rounded-tr-lg"
                  : isAdmin
                  ? "bg-green-100 text-green-800 rounded-r-lg rounded-tl-lg border border-green-200"
                  : "bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg border border-gray-200"
              }`}
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
      onScroll={handleScroll}
    >
      <div className="p-3 sm:p-4 space-y-3">
        {/* 채팅 시작 안내 메시지 */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-teal-100 text-teal-700 px-3 py-2 sm:px-4 rounded-lg text-sm max-w-[90%] text-center">
            <div className="flex items-center justify-center space-x-2">
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
