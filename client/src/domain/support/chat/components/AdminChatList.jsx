import React, { useState, useEffect } from "react";
import { getChatRooms, joinChatRoomAsAdmin } from "../api/chatRoomApi";

const AdminChatList = ({ onSelectChatRoom }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const response = await getChatRooms();
      setChatRooms(response.data || []);
    } catch (err) {
      setError("채팅방 목록을 불러오는데 실패했습니다.");
      console.error("Error fetching chat rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChat = async (chatRoomId) => {
    try {
      await joinChatRoomAsAdmin(chatRoomId);
      onSelectChatRoom(chatRoomId);
      await fetchChatRooms(); // 목록 새로고침
    } catch (err) {
      alert("채팅방 참여에 실패했습니다.");
      console.error("Error joining chat room:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "WAITING":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            대기중
          </span>
        );
      case "ACTIVE":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            진행중
          </span>
        );
      case "ENDED":
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            종료
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "날짜 오류";

      return date.toLocaleString("ko-KR");
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 오류";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchChatRooms}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">채팅방 관리</h2>
        <button
          onClick={fetchChatRooms}
          className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
        >
          새로고침
        </button>
      </div>

      {chatRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-500">현재 진행 중인 채팅방이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chatRooms.map((room) => (
            <div
              key={room.no}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {room.memberNickname || "익명"} 님의 상담
                    </h3>
                    {getStatusBadge(room.status)}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>문의 유형:</strong> {room.questionType}
                    </p>
                    <p>
                      <strong>문의 내용:</strong> {room.questionDetail}
                    </p>
                    <p>
                      <strong>생성 시간:</strong> {formatDate(room.createdAt)}
                    </p>
                    {room.adminNickname && (
                      <p>
                        <strong>담당 상담원:</strong> {room.adminNickname}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  {room.status === "WAITING" ? (
                    <button
                      onClick={() => handleJoinChat(room.no)}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm font-medium"
                    >
                      상담 시작
                    </button>
                  ) : room.status === "ACTIVE" ? (
                    <button
                      onClick={() => onSelectChatRoom(room.no)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                    >
                      채팅 참여
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectChatRoom(room.no)}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm font-medium cursor-default"
                      disabled
                    >
                      종료됨
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatList;
