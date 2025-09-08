import { getStatusText, getStatusColor } from "../utils/chatAdminStatus";

const ChatRoomInfo = ({ chatRoom, loginState }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">채팅방 번호:</span>
        <span className="font-medium">{chatRoom.no}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600">사용자:</span>
        <span className="font-medium">
          {chatRoom.member?.email || "정보없음"}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600">문의 유형:</span>
        <span className="font-medium">{chatRoom.questionType || "-"}</span>
      </div>

      <div className="flex flex-col space-y-1">
        <span className="text-gray-600">상세문의사항:</span>
        <div className="bg-gray-100 rounded p-2 max-h-24 overflow-y-auto">
          <span className="text-sm text-gray-800">
            {chatRoom.questionDetail || "상세문의사항이 없습니다."}
          </span>
        </div>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600">현재 상태:</span>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
            chatRoom.status
          )}`}
        >
          {getStatusText(chatRoom.status)}
        </span>
      </div>

      {/* 담당 관리자 정보 표시 */}
      {chatRoom.admin && (
        <div className="flex justify-between">
          <span className="text-gray-600">담당 관리자:</span>
          <div className="flex flex-col items-end">
            <span className="font-medium text-teal-600">
              {chatRoom.admin.nickname || chatRoom.admin.email}
            </span>
            {chatRoom.admin.email === loginState?.email && (
              <span className="text-xs text-teal-500">(나)</span>
            )}
            {chatRoom.admin.email !== loginState?.email && (
              <span className="text-xs text-orange-600">
                🔒 다른 관리자 담당
              </span>
            )}
          </div>
        </div>
      )}

      {chatRoom.status === "REJECTED" && chatRoom.rejectionReason && (
        <div className="flex justify-between">
          <span className="text-gray-600">거절 사유:</span>
          <span className="font-medium text-red-600 max-w-48 text-right">
            {chatRoom.rejectionReason}
          </span>
        </div>
      )}

      {chatRoom.status === "REJECTED" && chatRoom.admin && (
        <div className="flex justify-between">
          <span className="text-gray-600">거절 관리자:</span>
          <span className="font-medium text-red-600">
            {chatRoom.admin.nickname || chatRoom.admin.email}
          </span>
        </div>
      )}

      {chatRoom.status === "REJECTED" && chatRoom.rejectedAt && (
        <div className="flex justify-between">
          <span className="text-gray-600">거절 일시:</span>
          <span className="font-medium">
            {new Date(chatRoom.rejectedAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatRoomInfo;
