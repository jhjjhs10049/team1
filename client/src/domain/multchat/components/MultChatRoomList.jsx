import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPublicChatRooms,
  searchChatRooms,
  getMyChatRooms,
} from "../api/multChatApi";
import useMultChatWebSocket from "../hooks/useMultChatWebSocket";

const MultChatRoomList = () => {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentTab, setCurrentTab] = useState("public"); // 'public', 'my'
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
  }); // 웹소켓 Hook 사용 (목록 페이지용 - isInRoom: false)
  const { isWebSocketConnected, registerRoomUpdateCallback } =
    useMultChatWebSocket(null, false);

  // 실시간 채팅방 정보 상태
  const [realTimeRoomInfo, setRealTimeRoomInfo] = useState(new Map());
  // 웹소켓 실시간 업데이트 콜백 등록
  useEffect(() => {
    if (!registerRoomUpdateCallback) return;
    const handleRoomUpdate = (notification) => {
      // null 체크 (주의: JavaScript에서 typeof null === 'object')
      if (
        notification === null ||
        notification === undefined ||
        typeof notification !== "object"
      ) {
        return;
      }

      if (!notification.type) {
        return;
      }

      // 채팅방 정보 업데이트 처리
      if (notification.type === "ROOM_PARTICIPANT_COUNT_UPDATE") {
        setRealTimeRoomInfo((prev) => {
          const newMap = new Map(prev);
          newMap.set(notification.roomNo, {
            currentParticipants: notification.currentParticipants,
            lastUpdated: new Date().toISOString(),
          });
          return newMap;
        });

        // 현재 표시중인 채팅방 목록도 업데이트
        const updateRoomList = (rooms) =>
          rooms.map((room) =>
            room.no === notification.roomNo
              ? {
                  ...room,
                  currentParticipants: notification.currentParticipants,
                }
              : room
          );

        setChatRooms((prev) => updateRoomList(prev));
        setMyRooms((prev) => updateRoomList(prev));
      }
    };

    registerRoomUpdateCallback(handleRoomUpdate);
  }, [registerRoomUpdateCallback]);

  // 공개 채팅방 목록 조회
  const loadPublicChatRooms = useCallback(
    async (page = 0, keyword = "") => {
      setLoading(true);
      setError(null);

      try {
        let data;
        if (keyword.trim()) {
          data = await searchChatRooms(keyword, page, pagination.size);
        } else {
          data = await getPublicChatRooms(page, pagination.size);
        }

        setChatRooms(data.content || []);
        setPagination({
          page: data.number || 0,
          size: data.size || 20,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          hasNext: !data.last,
        });
      } catch (err) {
        console.error("채팅방 목록 조회 실패:", err);
        setError("채팅방 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [pagination.size]
  );

  // 내 채팅방 목록 조회
  const loadMyChatRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyChatRooms();
      setMyRooms(data || []);
    } catch (err) {
      console.error("내 채팅방 목록 조회 실패:", err);
      setError("내 채팅방 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    if (currentTab === "public") {
      loadPublicChatRooms();
    } else if (currentTab === "my") {
      loadMyChatRooms();
    }
  }, [currentTab, loadPublicChatRooms, loadMyChatRooms]);

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    if (currentTab === "public") {
      loadPublicChatRooms(0, searchKeyword);
    }
  };

  // 채팅방 입장
  const handleJoinRoom = (roomNo) => {
    navigate(`/multchat/room/${roomNo}`);
  };

  // 채팅방 생성
  const handleCreateRoom = () => {
    navigate("/multchat/create");
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    if (currentTab === "public") {
      loadPublicChatRooms(newPage, searchKeyword);
    }
  }; // 채팅방 카드 렌더링
  const renderChatRoomCard = (room) => {
    // 실시간 업데이트된 참가자 수가 있으면 그것을 사용, 없으면 기본값 사용
    const realtimeInfo = realTimeRoomInfo.get(room.no);
    const currentParticipants =
      realtimeInfo?.currentParticipants ?? room.currentParticipants;

    return (
      <div
        key={room.no}
        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 cursor-pointer relative"
        onClick={() => handleJoinRoom(room.no)}
      >
        {/* 웹소켓 연결 상태 표시 */}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isWebSocketConnected ? "bg-green-400" : "bg-red-400"
            }`}
            title={isWebSocketConnected ? "실시간 연결됨" : "연결 끊어짐"}
          />
          {room.roomType === "PRIVATE" && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              🔒 비공개
            </span>
          )}
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              room.status === "ACTIVE"
                ? "bg-teal-100 text-teal-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {room.status === "ACTIVE" ? "활성" : "비활성"}
          </span>
        </div>

        <div className="flex justify-between items-start mb-3 pr-16">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {room.roomName}
          </h3>
        </div>

        {room.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {room.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span
              className={`flex items-center ${
                realtimeInfo ? "text-teal-600 font-medium" : ""
              }`}
            >
              👥 {currentParticipants}/{room.maxParticipants}
              {realtimeInfo && (
                <span className="ml-1 text-xs text-teal-500">●</span>
              )}
            </span>
            <span>👑 {room.creatorNickname}</span>
          </div>
          {room.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {room.unreadCount > 99 ? "99+" : room.unreadCount}
            </span>
          )}
        </div>

        {room.lastMessage && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 truncate">
              <span className="font-medium">
                {room.lastMessage.senderNickname}:
              </span>
              {room.lastMessage.content}
            </p>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* 웹소켓 연결 상태 표시 */}
      <div
        className={`rounded-lg p-3 text-sm flex items-center space-x-2 ${
          isWebSocketConnected
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isWebSocketConnected ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <span>
          {isWebSocketConnected
            ? "🟢 실시간 업데이트 연결됨 - 참가자 수가 실시간으로 업데이트됩니다"
            : "🔴 실시간 연결 끊어짐 - 페이지를 새로고침해주세요"}
        </span>
      </div>
      {/* 탭 및 액션 버튼 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentTab("public")}
            className={`px-4 py-2 rounded-lg font-medium border shadow-sm hover:shadow-md transition-all duration-200 ${
              currentTab === "public"
                ? "bg-teal-500 text-white border-teal-500"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            }`}
          >
            공개 채팅방
          </button>
          <button
            onClick={() => setCurrentTab("my")}
            className={`px-4 py-2 rounded-lg font-medium border shadow-sm hover:shadow-md transition-all duration-200 ${
              currentTab === "my"
                ? "bg-teal-500 text-white border-teal-500"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            }`}
          >
            내 채팅방
          </button>
        </div>
        <button
          onClick={handleCreateRoom}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium border border-teal-500 shadow-sm hover:shadow-md transition-all duration-200"
        >
          ➕ 채팅방 만들기
        </button>
      </div>
      {/* 검색 (공개 채팅방 탭에서만) */}
      {currentTab === "public" && (
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="채팅방 이름을 검색하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
          />
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg border border-teal-500 shadow-sm hover:shadow-md transition-all duration-200"
          >
            검색
          </button>
        </form>
      )}
      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">채팅방 목록을 불러오는 중...</p>
        </div>
      )}
      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">❌ {error}</p>
          <button
            onClick={() =>
              currentTab === "public"
                ? loadPublicChatRooms()
                : loadMyChatRooms()
            }
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            다시 시도
          </button>
        </div>
      )}
      {/* 채팅방 목록 */}
      {!loading && !error && (
        <>
          {currentTab === "public" && (
            <>
              {chatRooms.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {chatRooms.map(renderChatRoomCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    {searchKeyword
                      ? "검색 결과가 없습니다."
                      : "등록된 공개 채팅방이 없습니다."}
                  </p>
                </div>
              )}

              {/* 페이지네이션 */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <span className="px-3 py-1">
                    {pagination.page + 1} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}

          {currentTab === "my" && (
            <>
              {myRooms.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myRooms.map(renderChatRoomCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">참가 중인 채팅방이 없습니다.</p>
                  <button
                    onClick={() => setCurrentTab("public")}
                    className="mt-4 text-teal-600 hover:text-teal-700 underline"
                  >
                    공개 채팅방 둘러보기
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MultChatRoomList;
