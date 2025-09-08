import React from "react";

const ChatSidebar = ({
  chatRoom,
  isMobile,
  showSidebar,
  setShowSidebar,
  onLeave,
  isAdmin,
}) => {
  return (
    <div
      className={`
        ${
          isMobile
            ? `fixed left-0 top-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out z-50
             ${showSidebar ? "translate-x-0" : "-translate-x-full"}`
            : "w-80 relative"
        } 
        bg-white border-r border-gray-200 flex flex-col
      `}
    >
      {/* 모바일용 헤더 (닫기 버튼 포함) */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-teal-500 text-white">
          <h2 className="text-lg font-bold">💬 채팅 정보</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 hover:bg-teal-600 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 데스크톱용 헤더 */}
      {!isMobile && (
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold mb-2 text-gray-900">
            💬 1대1 채팅 상담
          </h2>
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
            <span className="text-sm text-gray-600">
              {chatRoom.status === "ACTIVE"
                ? "상담 진행중"
                : chatRoom.status === "WAITING"
                ? "상담원 배정 대기 중"
                : chatRoom.status === "REJECTED"
                ? "상담 거절됨"
                : "상담 종료"}
            </span>
          </div>
        </div>
      )}

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
      <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
        <h3 className="font-semibold mb-3 text-gray-800 text-sm sm:text-base">
          📋 문의 정보
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 block mb-1">
              문의 유형
            </label>
            <div className="bg-gray-100 p-2 rounded text-xs sm:text-sm">
              {chatRoom.questionType || "일반 문의"}
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 block mb-1">
              상세 문의사항
            </label>
            <div className="bg-gray-100 p-2 rounded text-xs sm:text-sm max-h-16 sm:max-h-20 overflow-y-auto">
              {chatRoom.questionDetail || "문의사항이 없습니다."}
            </div>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 block mb-1">
              생성 시간
            </label>
            <div className="bg-gray-100 p-2 rounded text-xs sm:text-sm">
              {chatRoom.createdAt
                ? new Date(chatRoom.createdAt).toLocaleString("ko-KR")
                : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* 나가기 버튼 */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <button
          onClick={onLeave}
          className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 text-sm sm:text-base"
        >
          {isAdmin
            ? "관리자 페이지로"
            : chatRoom.status === "REJECTED" || chatRoom.status === "ENDED"
            ? "나가기"
            : "채팅 종료"}
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
