import React from "react";

const JoinRoomModal = ({ show, roomInfo, onJoin, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-2-4h.01M9 16h6m-6 0l2-2m-2 2l2 2M3 18V8a2 2 0 012-2h.828a2 2 0 001.414.586L9 8.414"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            채팅방에 입장하시겠습니까?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {roomInfo?.title ? `"${roomInfo.title}"` : "이 채팅방"}에 입장하여
            대화에 참여할 수 있습니다.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              취소
            </button>
            <button
              onClick={onJoin}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              입장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
