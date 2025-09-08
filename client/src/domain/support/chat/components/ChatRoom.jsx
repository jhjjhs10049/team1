import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import {
  getChatRoomById,
  getActiveChatRoom,
  endChat,
  startChat,
} from "../api/chatRoomApi";
import {
  getMessagesByChatRoom,
  sendMessage,
  markMessagesAsRead,
} from "../api/chatMessageApi";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";
import websocketService from "../services/websocketService";
import { WEBSOCKET_DESTINATIONS } from "../../../global/constants/websocketDestinations";

const ChatRoom = ({ chatRoomId, isAdmin = false }) => {
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { loginState } = useCustomLogin();

  const loadChatRoomById = useCallback(
    async (roomId) => {
      try {
        console.log("📥 채팅방 조회 중...", roomId);
        const roomData = await getChatRoomById(roomId);

        if (roomData) {
          setChatRoom(roomData);
          console.log("✅ 채팅방 로드 완료:", roomData);
        } else {
          console.log("❌ 채팅방을 찾을 수 없음");
          alert("채팅방을 찾을 수 없습니다.");
          navigate("/support/faq");
        }
      } catch (error) {
        console.error("❌ 채팅방 로드 오류:", error);
        alert("채팅방을 불러오는 중 오류가 발생했습니다.");
        navigate("/support/faq");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const loadActiveChatRoom = useCallback(async () => {
    try {
      console.log("📥 활성화된 채팅방 조회 중...");
      const roomData = await getActiveChatRoom();

      if (roomData) {
        setChatRoom(roomData);
        console.log("✅ 활성화된 채팅방 로드 완료:", roomData);
      } else {
        console.log("❌ 활성화된 채팅방이 없음");
        alert("활성화된 채팅방이 없습니다. 사전 질문을 먼저 작성해주세요.");
        navigate("/support/chat");
      }
    } catch (error) {
      console.error("❌ 채팅방 로드 오류:", error);
      alert("채팅방을 불러오는 중 오류가 발생했습니다.");
      navigate("/support/faq");
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  useEffect(() => {
    if (chatRoomId) {
      loadChatRoomById(chatRoomId);
    } else {
      loadActiveChatRoom();
    }
  }, [chatRoomId, loadChatRoomById, loadActiveChatRoom]);

  // 관리자가 채팅방에 입장할 때 자동으로 채팅 시작
  useEffect(() => {
    const handleAdminJoin = async () => {
      if (isAdmin && chatRoom && chatRoom.status === "WAITING") {
        try {
          console.log("🚀 관리자가 채팅방 입장 - 채팅 시작:", chatRoom.no);
          await startChat(chatRoom.no);
          // 채팅방 상태 업데이트
          const updatedRoom = await getChatRoomById(chatRoom.no);
          setChatRoom(updatedRoom);
          console.log("✅ 채팅 시작 완료");
        } catch (error) {
          console.error("❌ 채팅 시작 오류:", error);
        }
      }
    };

    if (chatRoom) {
      handleAdminJoin();
    }
  }, [chatRoom, isAdmin]); // 웹소켓 연결 상태 관리
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false); // 웹소켓 연결 (한 번만 연결)
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        console.log("🔌 웹소켓 연결 시도...");
        await websocketService.connect();
        setIsWebSocketConnected(true);
        console.log("✅ 웹소켓 연결 완료");
      } catch (error) {
        console.error("❌ 웹소켓 연결 실패:", error);
        setIsWebSocketConnected(false);

        // JWT 토큰 만료 에러인 경우 사용자에게 알림
        if (error.message && error.message.includes("만료")) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/member/login");
          return;
        }

        // 기타 연결 오류
        console.error("웹소켓 연결 오류:", error.message);
      }
    };

    // 웹소켓이 연결되지 않은 경우에만 연결 시도
    if (!websocketService.isWebSocketConnected()) {
      connectWebSocket();
    } else {
      setIsWebSocketConnected(true);
    }

    // 컴포넌트 언마운트 시에만 연결 해제
    return () => {
      // 채팅방을 나갈 때만 웹소켓 연결 해제
      console.log("🔌 ChatRoom 언마운트 - 웹소켓 연결 유지");
    };
  }, [navigate]); // navigate 의존성 추가

  // 채팅방별 구독 관리
  useEffect(() => {
    if (!chatRoom || !isWebSocketConnected) return;

    const chatRoomNo = chatRoom.chatRoomId || chatRoom.no;
    const messageDestination =
      WEBSOCKET_DESTINATIONS.QUEUE.CHAT_MESSAGE(chatRoomNo);
    const statusDestination =
      WEBSOCKET_DESTINATIONS.QUEUE.CHAT_STATUS(chatRoomNo);

    console.log(`📡 채팅방 ${chatRoomNo} 구독 시작...`);

    // 메시지 구독
    websocketService.subscribe(messageDestination, (newMessage) => {
      console.log("📥 실시간 메시지 수신:", newMessage);
      setMessages((prevMessages) => {
        // 중복 메시지 방지 - 메시지 내용과 시간으로 비교
        const exists = prevMessages.some(
          (msg) =>
            (msg.id && msg.id === newMessage.id) ||
            (msg.no && msg.no === newMessage.no) ||
            (msg.message === newMessage.message &&
              msg.senderNo === newMessage.senderNo &&
              Math.abs(
                new Date(msg.createdAt) - new Date(newMessage.createdAt)
              ) < 1000)
        );
        if (exists) {
          console.log("📥 중복 메시지 무시:", newMessage.id || newMessage.no);
          return prevMessages;
        }
        console.log("📥 새 메시지 추가:", newMessage);
        return [...prevMessages, newMessage];
      });
    });

    // 채팅방 상태 변경 알림 구독
    websocketService.subscribe(statusDestination, (statusNotification) => {
      console.log("📢 채팅방 상태 변경 알림 수신:", statusNotification);

      if (statusNotification.type === "STATUS_CHANGE") {
        console.log(`🔄 채팅방 상태 변경: ${statusNotification.status}`);

        // 채팅방 상태 업데이트
        setChatRoom((prevRoom) => ({
          ...prevRoom,
          status: statusNotification.status,
          adminNickname:
            statusNotification.adminNickname || prevRoom.adminNickname,
          rejectionReason:
            statusNotification.rejectionReason || prevRoom.rejectionReason,
        }));

        // 상태별 알림 표시
        if (statusNotification.status === "ACTIVE") {
          console.log("✅ 상담원이 배정되었습니다!");
          // 필요시 사용자에게 알림 표시
        } else if (statusNotification.status === "REJECTED") {
          console.log("❌ 상담이 거절되었습니다");
          // 필요시 사용자에게 알림 표시
        }
      }
    });

    console.log(`✅ 채팅방 ${chatRoomNo} 구독 완료 (메시지 + 상태변경)`);

    // 채팅방이 변경되거나 컴포넌트가 언마운트될 때 구독 해제
    return () => {
      websocketService.unsubscribe(messageDestination);
      websocketService.unsubscribe(statusDestination);
      console.log(`🔌 채팅방 ${chatRoomNo} 구독 해제 (메시지 + 상태변경)`);
    };
  }, [chatRoom, isWebSocketConnected]); // chatRoom과 웹소켓 연결 상태에 의존
  // 웹소켓 실시간 메시지 처리로 폴링 제거됨

  const loadMessages = useCallback(async () => {
    if (!chatRoom) return;

    try {
      console.log("📥 채팅 메시지 로드 중...");
      const messagesData = await getMessagesByChatRoom(
        chatRoom.chatRoomId || chatRoom.no
      );
      setMessages(messagesData);
      console.log("✅ 메시지 로드 완료:", messagesData.length, "개");

      // 메시지 읽음 처리 (관리자가 아닌 경우만)
      if (!isAdmin) {
        await markMessagesAsRead(chatRoom.chatRoomId || chatRoom.no);
      }
    } catch (error) {
      console.error("❌ 메시지 로드 오류:", error);
    }
  }, [chatRoom, isAdmin]);
  useEffect(() => {
    if (chatRoom) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoom?.no]); // 웹소켓 실시간 상태 변경 처리로 폴링 제거됨
  const handleSendMessage = async (messageText) => {
    try {
      const messageData = {
        chatRoomNo: chatRoom.chatRoomId || chatRoom.no,
        senderNo: loginState?.memberNo,
        message: messageText,
        messageType: isAdmin ? "ADMIN" : "USER",
      };

      console.log("📤 메시지 전송 중...", messageData);
      console.log("🔍 로그인 상태:", loginState);
      console.log("🔍 senderNo 확인:", loginState?.memberNo);

      // 웹소켓이 연결되어 있으면 웹소켓으로 전송
      if (websocketService.isWebSocketConnected()) {
        console.log("🔌 웹소켓을 통해 메시지 전송...");
        const success = websocketService.sendMessage(
          "/app/chat/send",
          messageData
        );

        if (success) {
          console.log("✅ 웹소켓 메시지 전송 완료");
          return;
        } else {
          console.log("❌ 웹소켓 전송 실패, HTTP API 사용...");
        }
      }

      // 웹소켓이 연결되지 않았거나 전송 실패 시 HTTP API 사용
      console.log("📤 HTTP API를 통해 메시지 전송...");
      const sentMessage = await sendMessage(messageData);
      setMessages((prev) => [...prev, sentMessage]);
      console.log("✅ HTTP 메시지 전송 완료");
    } catch (error) {
      console.error("❌ 메시지 전송 오류:", error);
      alert("메시지 전송 중 오류가 발생했습니다.");
    }
  };
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const handleLeave = () => {
    if (isAdmin) {
      // 관리자는 채팅 관리자 페이지로 이동
      navigate("/admin/chat");
    } else {
      // 종료된 상태(ENDED, REJECTED)에서는 모달 없이 바로 이동
      if (chatRoom.status === "REJECTED" || chatRoom.status === "ENDED") {
        if (chatRoom.status === "REJECTED") {
          alert("상담이 거절된 채팅방에서 나갑니다.");
        } else {
          alert("상담이 완료된 채팅방에서 나갑니다.");
        }
        navigate("/support/faq");
      } else {
        // 활성 상태에서는 확인 모달 표시
        setShowExitConfirm(true);
      }
    }
  };
  const handleExitConfirm = async () => {
    try {
      console.log("📤 채팅방 종료 요청...");

      // 거절되거나 이미 종료된 채팅방인 경우 바로 나가기
      if (chatRoom.status === "REJECTED") {
        console.log("✅ 거절된 채팅방에서 나가기");
        alert("상담이 거절된 채팅방에서 나갑니다.");
        setShowExitConfirm(false);
        navigate("/support/faq");
        return;
      }

      if (chatRoom.status === "ENDED") {
        console.log("✅ 종료된 채팅방에서 나가기");
        alert("상담이 완료된 채팅방에서 나갑니다.");
        setShowExitConfirm(false);
        navigate("/support/faq");
        return;
      }

      // 활성 상태인 경우 채팅방 종료 API 호출
      await endChat(chatRoom.chatRoomId || chatRoom.no);

      console.log("✅ 채팅방 종료 완료");
      alert("채팅이 종료되었습니다.");

      setShowExitConfirm(false);
      navigate("/support/faq");
    } catch (error) {
      console.error("❌ 채팅방 종료 오류:", error);
      alert("채팅방 종료 중 오류가 발생했습니다.");
    }
  };

  const handleExitCancel = () => {
    setShowExitConfirm(false);
  };

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
    <div className="flex h-full bg-gray-100 overflow-hidden">
      {/* 사이드바 - 채팅방 정보 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h2 className="text-xl font-bold mb-2">💬 1대1 채팅 상담</h2>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                chatRoom.status === "ACTIVE"
                  ? "bg-green-400"
                  : chatRoom.status === "WAITING"
                  ? "bg-yellow-400"
                  : chatRoom.status === "REJECTED"
                  ? "bg-red-400"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm">
              {chatRoom.status === "ACTIVE"
                ? "상담 진행중"
                : chatRoom.status === "WAITING"
                ? "상담원 배정 대기 중"
                : chatRoom.status === "REJECTED"
                ? "상담 거절됨"
                : "상담 종료"}
            </span>
            {chatRoom.status === "WAITING" && (
              <div className="mt-1 text-xs text-yellow-200 animate-pulse">
                곧 상담원이 배정됩니다
              </div>
            )}
            {chatRoom.status === "REJECTED" && (
              <div className="mt-1 text-xs text-red-200">
                상담이 거절되었습니다
              </div>
            )}
          </div>
        </div>
        {/* 사용자 정보 */}
        <div className="p-4 border-b border-gray-200 bg-teal-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              {chatRoom.memberNickname?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-semibold">
                {chatRoom.memberNickname || "익명"}
              </div>
              <div className="text-sm text-gray-600">고객</div>
            </div>
          </div>
        </div>
        {/* 상담원 정보 */}
        {chatRoom.status === "WAITING" ? (
          <div className="p-4 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
              <div>
                <div className="font-semibold text-yellow-700">
                  상담원 배정 중
                </div>
                <div className="text-sm text-yellow-600">
                  잠시만 기다려 주세요
                </div>
              </div>
            </div>
          </div>
        ) : chatRoom.status === "REJECTED" ? (
          <div className="p-4 border-b border-gray-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                ❌
              </div>
              <div className="flex-1">
                <div className="font-semibold text-red-700">상담 거절됨</div>
                <div className="text-sm text-red-600">
                  상담원이 요청을 거절했습니다
                </div>
                {chatRoom.rejectionReason && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                    <strong>거절 사유:</strong> {chatRoom.rejectionReason}
                  </div>
                )}
                {chatRoom.rejectedAt && (
                  <div className="text-xs text-red-500 mt-1">
                    거절 일시:
                    {new Date(chatRoom.rejectedAt).toLocaleString("ko-KR")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : chatRoom.adminNickname ? (
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                {chatRoom.adminNickname?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <div className="font-semibold">{chatRoom.adminNickname}</div>
                <div className="text-sm text-gray-600">상담원</div>
              </div>
            </div>
          </div>
        ) : null}
        {/* 문의 정보 */}
        <div className="p-4 flex-1">
          <h3 className="font-semibold mb-3 text-gray-800">📋 문의 정보</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">문의 유형</label>
              <div className="bg-gray-100 p-2 rounded text-sm mt-1">
                {chatRoom.questionType || "일반 문의"}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">상세 문의사항</label>
              <div className="bg-gray-100 p-2 rounded text-sm mt-1 max-h-20 overflow-y-auto">
                {chatRoom.questionDetail || "문의사항이 없습니다."}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">생성 시간</label>
              <div className="bg-gray-100 p-2 rounded text-sm mt-1">
                {chatRoom.createdAt
                  ? new Date(chatRoom.createdAt).toLocaleString("ko-KR")
                  : "-"}
              </div>
            </div>
          </div>
        </div>
        {/* 나가기 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLeave}
            className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200"
          >
            {isAdmin
              ? "관리자 페이지로"
              : chatRoom.status === "REJECTED" || chatRoom.status === "ENDED"
              ? "나가기"
              : "채팅 종료"}
          </button>
        </div>
      </div>
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
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
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {chatRoom.status === "REJECTED" || chatRoom.status === "ENDED"
                    ? "채팅방에서 나가시겠습니까?"
                    : "채팅을 종료하시겠습니까?"}
                </h3>
                <p className="text-sm text-gray-600">
                  {chatRoom.status === "REJECTED"
                    ? "상담이 거절된 채팅방에서 나갑니다. 새로운 문의를 하려면 새로운 채팅방을 생성해야 합니다."
                    : chatRoom.status === "ENDED"
                    ? "상담이 완료된 채팅방에서 나갑니다. 새로운 문의를 하려면 새로운 채팅방을 생성해야 합니다."
                    : "채팅을 종료하면 상담이 완료되며, 다시 문의하려면 새로운 채팅방을 생성해야 합니다."}
                </p>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleExitCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
              >
                취소
              </button>
              <button
                onClick={handleExitConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                {chatRoom.status === "REJECTED" || chatRoom.status === "ENDED"
                  ? "나가기"
                  : "채팅 종료"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
