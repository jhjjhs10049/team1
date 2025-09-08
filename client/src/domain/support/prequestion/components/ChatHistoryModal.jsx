import React, { useState, useEffect } from "react";
import { getMyChatQuestions } from "../api/chatQuestionApi";
import { getMyChatRooms, endChat } from "../../chat/api/chatRoomApi";
import { useNavigate } from "react-router-dom";

const ChatHistoryModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("ongoing"); // ongoing, history
  const [chatRooms, setChatRooms] = useState([]);
  const [_chatQuestions, setChatQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, questionsData] = await Promise.all([
        getMyChatRooms(),
        getMyChatQuestions(),
      ]);

      setChatRooms(Array.isArray(roomsData) ? roomsData : []);
      setChatQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (error) {
      console.error("❌ 데이터 로드 오류:", error);
      setChatRooms([]);
      setChatQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 진행중인 채팅방 필터링
  const ongoingChats = chatRooms.filter(
    (room) => room.status === "WAITING" || room.status === "ACTIVE"
  );

  // 완료된 채팅방 필터링
  const completedChats = chatRooms.filter(
    (room) => room.status === "ENDED" || room.status === "REJECTED"
  );

  // 채팅방 입장
  const handleEnterChat = (chatRoomId) => {
    navigate(`/support/chat/${chatRoomId}`);
    onClose();
  };

  // 채팅방 종료
  const handleEndChat = async (chatRoomNo) => {
    if (!window.confirm("정말로 이 채팅을 종료하시겠습니까?")) {
      return;
    }

    try {
      await endChat(chatRoomNo);
      alert("채팅이 종료되었습니다.");
      loadData(); // 데이터 새로고침
    } catch (error) {
      console.error("❌ 채팅 종료 오류:", error);
      alert("채팅 종료 중 오류가 발생했습니다.");
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status) => {
    switch (status) {
      case "WAITING":
        return "상담원 대기중";
      case "ACTIVE":
        return "상담 진행중";
      case "ENDED":
        return "상담 완료";
      case "REJECTED":
        return "상담 거절됨";
      default:
        return status;
    }
  };

  // 상태 색상 클래스
  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "ENDED":
        return "bg-gray-100 text-gray-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">💬 상담 기록</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "ongoing"
                ? "border-b-2 border-teal-500 text-teal-600 bg-teal-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            🔥 진행중인 상담 ({ongoingChats.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === "history"
                ? "border-b-2 border-teal-500 text-teal-600 bg-teal-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            📝 상담 내역 ({completedChats.length})
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-600">로딩 중...</div>
            </div>
          ) : (
            <>
              {/* 진행중인 상담 탭 */}
              {activeTab === "ongoing" && (
                <div className="space-y-4">
                  {ongoingChats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      진행중인 상담이 없습니다.
                    </div>
                  ) : (
                    ongoingChats.map((room) => (
                      <div
                        key={room.no}
                        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-800">
                                상담방 #{room.no}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  room.status
                                )}`}
                              >
                                {getStatusText(room.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <strong>문의 유형:</strong>
                                {room.questionType || "일반 문의"}
                              </div>
                              <div>
                                <strong>문의 내용:</strong>
                                {room.questionDetail &&
                                room.questionDetail.length > 50
                                  ? `${room.questionDetail.substring(0, 50)}...`
                                  : room.questionDetail || "문의 내용 없음"}
                              </div>
                              <div>
                                <strong>생성일:</strong>
                                {new Date(room.createdAt).toLocaleString(
                                  "ko-KR"
                                )}
                              </div>
                              {room.adminNickname && (
                                <div>
                                  <strong>담당 상담원:</strong>
                                  {room.adminNickname}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() =>
                                handleEnterChat(room.chatRoomId || room.no)
                              }
                              className="px-3 py-1 bg-teal-500 text-white text-sm rounded hover:bg-teal-600 transition-colors"
                            >
                              입장하기
                            </button>
                            <button
                              onClick={() => handleEndChat(room.no)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            >
                              종료하기
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 상담 내역 탭 */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  {completedChats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      상담 내역이 없습니다.
                    </div>
                  ) : (
                    completedChats.map((room) => (
                      <div
                        key={room.no}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-gray-800">
                                상담방 #{room.no}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  room.status
                                )}`}
                              >
                                {getStatusText(room.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <strong>문의 유형:</strong>
                                {room.questionType || "일반 문의"}
                              </div>
                              <div>
                                <strong>문의 내용:</strong>
                                {room.questionDetail &&
                                room.questionDetail.length > 50
                                  ? `${room.questionDetail.substring(0, 50)}...`
                                  : room.questionDetail || "문의 내용 없음"}
                              </div>
                              <div>
                                <strong>생성일:</strong>
                                {new Date(room.createdAt).toLocaleString(
                                  "ko-KR"
                                )}
                              </div>
                              {room.endedAt && (
                                <div>
                                  <strong>종료일:</strong>
                                  {new Date(room.endedAt).toLocaleString(
                                    "ko-KR"
                                  )}
                                </div>
                              )}
                              {room.adminNickname && (
                                <div>
                                  <strong>담당 상담원:</strong>
                                  {room.adminNickname}
                                </div>
                              )}
                              {room.rejectionReason && (
                                <div>
                                  <strong>거절 사유:</strong>
                                  {room.rejectionReason}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() =>
                                handleEnterChat(room.chatRoomId || room.no)
                              }
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              기록 보기
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;
