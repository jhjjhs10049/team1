import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPublicChatRooms,
  searchChatRooms,
  getMyChatRooms,
  joinChatRoom,
} from "../api/multChatApi";
import useMultChatWebSocket from "../hooks/useMultChatWebSocket";
import websocketService from "../services/multChatWebSocketService";
import { WEBSOCKET_DESTINATIONS } from "../../global/constants/websocketDestinations";
import PasswordModal from "./PasswordModal";

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
  });

  // 비밀번호 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null); // 웹소켓 Hook 사용 (목록 페이지용 - isInRoom: false)
  const { isWebSocketConnected, registerRoomUpdateCallback } =
    useMultChatWebSocket(null, false);

  // 실시간 채팅방 정보 상태
  const [realTimeRoomInfo, setRealTimeRoomInfo] = useState(new Map());

  // 🔧 웹소켓 연결 확인 및 재연결 함수
  const checkAndReconnectWebSocket = useCallback(async () => {
    console.log("🔍 웹소켓 연결 상태 체크...");
    console.log("Hook 상태:", isWebSocketConnected);
    console.log("Service 상태:", websocketService.isWebSocketConnected());

    if (!isWebSocketConnected || !websocketService.isWebSocketConnected()) {
      console.log("🔄 웹소켓 재연결 시도...");
      try {
        await websocketService.connect();
        console.log("✅ 웹소켓 재연결 성공");
      } catch (error) {
        console.error("❌ 웹소켓 재연결 실패:", error);
      }
    } else {
      console.log("✅ 웹소켓 정상 연결됨");
    }
  }, [isWebSocketConnected]);
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

  // 글로벌 채팅방 리스트 업데이트 구독
  useEffect(() => {
    console.log("🔍 [DEBUG] 웹소켓 연결 상태:", isWebSocketConnected);

    if (!isWebSocketConnected) {
      console.log("⚠️ 웹소켓이 연결되지 않아 글로벌 구독을 시작할 수 없습니다.");
      return;
    }

    const globalUpdateDestination = WEBSOCKET_DESTINATIONS.TOPIC.MULT_CHAT_ROOMS_UPDATES;
    console.log("📡 글로벌 채팅방 리스트 업데이트 구독 시작:", globalUpdateDestination);

    // 웹소켓 서비스 연결 상태 재확인
    if (!websocketService.isWebSocketConnected()) {
      console.error("❌ websocketService가 연결되지 않음!");
      return;
    }

    const subscription = websocketService.subscribe(
      globalUpdateDestination,
      (notification) => {
        console.log("📥 글로벌 채팅방 업데이트 수신:", notification);

        if (!notification || typeof notification !== "object") {
          console.warn("⚠️ 잘못된 글로벌 업데이트 알림 형식:", notification);
          return;
        }

        const { type, roomNo, roomData } = notification;

        // 참가자 수 업데이트 처리
        if (type === "PARTICIPANTS_UPDATED" && roomData?.currentParticipants !== undefined) {
          console.log(`📊 채팅방 ${roomNo} 참가자 수 업데이트: ${roomData.currentParticipants}명`);

          // 🔥 참가자 수가 0이 된 경우 채팅방을 목록에서 제거
          if (roomData.currentParticipants === 0) {
            console.log(`🗑️ 참가자 수 0으로 인한 채팅방 ${roomNo} 자동 제거`);

            // 삭제된 채팅방을 목록에서 제거
            setChatRooms((prev) => {
              const filtered = prev.filter((room) => room.no !== roomNo);
              console.log(`🗑️ 공개 채팅방 목록에서 자동 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
              return filtered;
            });

            setMyRooms((prev) => {
              const filtered = prev.filter((room) => room.no !== roomNo);
              console.log(`🗑️ 내 채팅방 목록에서 자동 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
              return filtered;
            });

            // 실시간 정보에서도 제거
            setRealTimeRoomInfo((prev) => {
              const newMap = new Map(prev);
              newMap.delete(roomNo);
              console.log(`🗑️ 실시간 정보에서 자동 제거: ${roomNo}`);
              return newMap;
            });

            return; // 더 이상 처리하지 않음
          }

          // 실시간 정보 업데이트 (참가자 수가 0이 아닌 경우)
          setRealTimeRoomInfo((prev) => {
            const newMap = new Map(prev);
            newMap.set(roomNo, {
              currentParticipants: roomData.currentParticipants,
              lastUpdated: new Date().toISOString(),
            });
            return newMap;
          });

          // 현재 표시중인 채팅방 목록 업데이트
          const updateRoomList = (rooms) =>
            rooms.map((room) =>
              room.no === roomNo
                ? {
                  ...room,
                  currentParticipants: roomData.currentParticipants,
                }
                : room
            );

          setChatRooms((prev) => updateRoomList(prev));
          setMyRooms((prev) => updateRoomList(prev));
        }

        // 새로운 채팅방 생성 처리
        else if (type === "ROOM_CREATED" && roomData) {
          console.log(`🆕 새로운 채팅방 생성: ${roomData.roomName} (${roomNo})`);

          // 공개 탭이 활성화된 경우 모든 새 채팅방을 목록에 추가
          if (currentTab === "public") {
            setChatRooms((prev) => [roomData, ...prev]);
          }
        }

        // 채팅방 삭제 처리 (방장이 나간 경우)
        else if (type === "ROOM_DELETED") {
          console.log(`🗑️ 채팅방 삭제됨: ${roomNo} (방장이 나감)`);
          console.log("🔍 [DEBUG] ROOM_DELETED 이벤트 상세:", { type, roomNo, roomData, notification });

          // 삭제된 채팅방을 목록에서 제거
          setChatRooms((prev) => {
            const filtered = prev.filter((room) => room.no !== roomNo);
            console.log(`🗑️ 공개 채팅방 목록에서 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
            console.log("🔍 [DEBUG] 제거된 방 번호:", roomNo);
            console.log("🔍 [DEBUG] 제거 전 방 목록:", prev.map(r => r.no));
            console.log("🔍 [DEBUG] 제거 후 방 목록:", filtered.map(r => r.no));
            return filtered;
          });

          setMyRooms((prev) => {
            const filtered = prev.filter((room) => room.no !== roomNo);
            console.log(`🗑️ 내 채팅방 목록에서 제거 - 이전: ${prev.length}개, 이후: ${filtered.length}개`);
            return filtered;
          });

          // 실시간 정보에서도 제거
          setRealTimeRoomInfo((prev) => {
            const newMap = new Map(prev);
            const hadInfo = newMap.has(roomNo);
            newMap.delete(roomNo);
            console.log(`🗑️ 실시간 정보에서 제거: ${roomNo} (이전 존재 여부: ${hadInfo})`);
            return newMap;
          });

          // 사용자에게 알림 표시
          alert(`채팅방이 삭제되었습니다. (방 번호: ${roomNo})`);
        }

        // 기타 알 수 없는 타입 처리
        else {
          console.log(`📥 알 수 없는 글로벌 업데이트 타입: ${type}`, notification);
        }
      }
    );

    console.log("📡 글로벌 채팅방 업데이트 구독 설정 완료");

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
        console.log("📡 글로벌 채팅방 리스트 업데이트 구독 해제");
      }
    };
  }, [isWebSocketConnected, currentTab]);

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
    // 해당 채팅방 정보 찾기
    const room = [...chatRooms, ...myRooms].find(r => r.no === roomNo);

    if (!room) {
      console.error("채팅방 정보를 찾을 수 없습니다.");
      return;
    }

    // 이미 참가 중인 채팅방이면 비밀번호 없이 바로 입장
    if (room.isParticipating) {
      console.log("이미 참가 중인 채팅방 - 바로 입장");
      navigate(`/multchat/room/${roomNo}`);
      return;
    }

    // 비공개 방이고 비밀번호가 있는 경우 비밀번호 모달 표시
    if (room.roomType === "PRIVATE" || room.hasPassword) {
      console.log("비공개 채팅방 - 비밀번호 모달 표시");
      setSelectedRoom(room);
      setShowPasswordModal(true);
      setPasswordError(null);
    } else {
      // 공개방인 경우 바로 이동
      console.log("공개 채팅방 - 바로 입장");
      navigate(`/multchat/room/${roomNo}`);
    }
  };

  // 비밀번호 확인 및 채팅방 참가
  const handlePasswordSubmit = async (password) => {
    if (!selectedRoom) return;

    setPasswordLoading(true);
    setPasswordError(null);

    try {
      // 실제 API로 비밀번호 검증 및 채팅방 참가
      await joinChatRoom(selectedRoom.no, password);

      // 성공 시 모달 닫고 채팅방으로 이동
      setShowPasswordModal(false);
      setSelectedRoom(null);
      navigate(`/multchat/room/${selectedRoom.no}`);
    } catch (error) {
      console.error("채팅방 참가 실패:", error);

      // 에러 메시지 설정
      if (error.response?.status === 400 && error.response?.data?.message?.includes("비밀번호")) {
        setPasswordError("비밀번호가 올바르지 않습니다.");
      } else if (error.response?.data?.message) {
        setPasswordError(error.response.data.message);
      } else {
        setPasswordError("채팅방 참가에 실패했습니다.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // 비밀번호 모달 취소
  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setSelectedRoom(null);
    setPasswordError(null);
    setPasswordLoading(false);
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
            className={`w-2 h-2 rounded-full ${isWebSocketConnected ? "bg-green-400" : "bg-red-400"
              }`}
            title={isWebSocketConnected ? "실시간 연결됨" : "연결 끊어짐"}
          />
          {(room.roomType === "PRIVATE" || room.hasPassword) && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              🔒 비공개
            </span>
          )}
          <span
            className={`text-xs px-2 py-1 rounded-full ${room.status === "ACTIVE"
              ? "bg-teal-100 text-teal-800"
              : "bg-gray-100 text-gray-800"
              }`}
          >
            {room.status === "ACTIVE" ? "활성" : "비활성"}
          </span>
        </div>

        <div className="flex justify-between items-start mb-3 pr-16">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center">
            {room.roomName}
            {(room.roomType === "PRIVATE" || room.hasPassword) && (
              <span className="ml-2 text-yellow-600" title="비밀번호가 필요한 채팅방">
                🔒
              </span>
            )}
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
              className={`flex items-center ${realtimeInfo ? "text-teal-600 font-medium" : ""
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
        className={`rounded-lg p-3 text-sm flex items-center justify-between ${isWebSocketConnected
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
          }`}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${isWebSocketConnected ? "bg-green-400" : "bg-red-400"
              }`}
          />
          <span>
            {isWebSocketConnected
              ? "🟢 실시간 업데이트 연결됨 - 참가자 수가 실시간으로 업데이트됩니다"
              : "🔴 실시간 연결 끊어짐 - 채팅방 삭제가 실시간으로 반영되지 않을 수 있습니다"}
          </span>
        </div>

        {/* 웹소켓 재연결 버튼 */}
        {!isWebSocketConnected && (
          <button
            onClick={checkAndReconnectWebSocket}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
          >
            🔄 재연결
          </button>
        )}

        {/* 웹소켓 상태 정보 버튼 */}
        <button
          onClick={() => {
            console.log("🔍 웹소켓 상태 정보:");
            console.log("- Hook 상태:", isWebSocketConnected);
            console.log("- Service 상태:", websocketService.isWebSocketConnected());
            console.log("- 현재 시간:", new Date().toISOString());
            alert(`웹소켓 상태: Hook=${isWebSocketConnected}, Service=${websocketService.isWebSocketConnected()}`);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors ml-2"
        >
          📊 상태확인
        </button>
      </div>
      {/* 탭 및 액션 버튼 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentTab("public")}
            className={`px-4 py-2 rounded-lg font-medium border shadow-sm hover:shadow-md transition-all duration-200 ${currentTab === "public"
              ? "bg-teal-500 text-white border-teal-500"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
          >
            채팅방
          </button>
          <button
            onClick={() => setCurrentTab("my")}
            className={`px-4 py-2 rounded-lg font-medium border shadow-sm hover:shadow-md transition-all duration-200 ${currentTab === "my"
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

      {/* 비밀번호 모달 */}
      <PasswordModal
        show={showPasswordModal}
        roomInfo={selectedRoom}
        onJoin={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        loading={passwordLoading}
        error={passwordError}
      />
    </div>
  );
};

export default MultChatRoomList;
