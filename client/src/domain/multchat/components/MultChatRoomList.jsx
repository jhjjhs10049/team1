import React from "react";
import RoomCard from "./RoomCard";
import WebSocketStatus from "./WebSocketStatus";
import RoomListTabs from "./RoomListTabs";
import RoomSearchBar from "./RoomSearchBar";
import RoomListPagination from "./RoomListPagination";
import PasswordModal from "./PasswordModal";
import useRoomListLogic from "../hooks/useRoomListLogic";

const MultChatRoomList = () => {
  const {
    // 상태
    chatRooms,
    myRooms,
    loading,
    error,
    searchKeyword,
    currentTab,
    pagination,
    realTimeRoomInfo,

    // 모달 상태
    showPasswordModal,
    selectedRoom,
    passwordLoading,
    passwordError,

    // 웹소켓 상태
    isWebSocketConnected,

    // 액션
    setSearchKeyword,
    setCurrentTab,
    loadPublicChatRooms,
    loadMyChatRooms,
    checkAndReconnectWebSocket,
    handleSearch,
    handleJoinRoom,
    handlePasswordSubmit,
    handlePasswordCancel,
    handleCreateRoom,
    handlePageChange,
  } = useRoomListLogic();

  return (
    <div className="space-y-6">
      {/* 웹소켓 연결 상태 표시 */}
      <WebSocketStatus
        isWebSocketConnected={isWebSocketConnected}
        checkAndReconnectWebSocket={checkAndReconnectWebSocket}
      />

      {/* 탭 및 액션 버튼 */}
      <RoomListTabs
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onCreateRoom={handleCreateRoom}
      />

      {/* 검색 (공개 채팅방 탭에서만) */}
      <RoomSearchBar
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        onSearch={handleSearch}
        currentTab={currentTab}
      />

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
                  {chatRooms.map((room) => (
                    <RoomCard
                      key={room.no}
                      room={room}
                      realTimeRoomInfo={realTimeRoomInfo}
                      isWebSocketConnected={isWebSocketConnected}
                      onJoinRoom={handleJoinRoom}
                    />
                  ))}
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
              <RoomListPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {currentTab === "my" && (
            <>
              {myRooms.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myRooms.map((room) => (
                    <RoomCard
                      key={room.no}
                      room={room}
                      realTimeRoomInfo={realTimeRoomInfo}
                      isWebSocketConnected={isWebSocketConnected}
                      onJoinRoom={handleJoinRoom}
                    />
                  ))}
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