import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomChatAdmin from "../hooks/useCustomChatAdmin";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const StatusModal = ({ isOpen, onClose, chatRoom, onUpdate }) => {
  const { updateChatRoomStatus, rejectChatRoom } = useCustomChatAdmin();
  const { loginState } = useCustomLogin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showActiveRejectForm, setShowActiveRejectForm] = useState(false);

  if (!isOpen || !chatRoom) return null;

  // 채팅방 입장
  const handleEnterChat = async () => {
    setLoading(true);
    try {
      console.log("🔍 현재 로그인된 사용자 정보:", loginState);
      if (loginState?.email) {
        console.log("🔍 사용자 권한:", loginState.roleNames);
        await updateChatRoomStatus(chatRoom.no, "ACTIVE");
        alert("채팅방에 입장합니다.");
        onUpdate();
        onClose();
        // 채팅방 페이지로 이동
        navigate(`/support/chat/${chatRoom.no}`);
      } else {
        alert("로그인 정보가 없습니다.");
      }
    } catch (error) {
      console.error("❌ 채팅방 입장 실패:", error);
      if (error.response?.status === 401) {
        alert("인증이 필요합니다. 다시 로그인해주세요.");
      } else if (error.response?.status === 403) {
        alert("권한이 없습니다. 관리자 권한이 필요합니다.");
      } else if (
        error.response?.status === 400 ||
        error.response?.status === 500
      ) {
        // 관리자 접근 제한 에러 처리
        const errorMessage = error.response?.data?.message || error.message;
        if (errorMessage && errorMessage.includes("다른 관리자")) {
          alert(errorMessage);
        } else {
          alert("채팅방 입장에 실패했습니다: " + errorMessage);
        }
      } else {
        alert("채팅방 입장에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };
  // 채팅 거절 (거절 사유와 함께)
  const handleRejectChat = async () => {
    if (!rejectionReason.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    console.log(
      "🔥 거절 요청 시작 - 채팅방:",
      chatRoom.no,
      "사유:",
      rejectionReason
    );

    if (window.confirm("정말로 이 채팅방을 거절하시겠습니까?")) {
      setLoading(true);
      try {
        console.log("📤 거절 API 호출 중...");
        await rejectChatRoom(chatRoom.no, rejectionReason);
        alert("채팅방을 거절했습니다.");
        onUpdate();
        onClose();
        setShowRejectForm(false);
        setRejectionReason("");
      } catch (error) {
        console.error("❌ 채팅방 거절 실패:", error);
        if (error.response?.status === 403) {
          alert("권한이 없습니다. 관리자 권한이 필요합니다.");
        } else if (error.response?.status === 401) {
          alert("인증이 필요합니다. 다시 로그인해주세요.");
        } else if (
          error.response?.status === 400 ||
          error.response?.status === 500
        ) {
          // 관리자 접근 제한 에러 처리
          const errorMessage = error.response?.data?.message || error.message;
          if (errorMessage && errorMessage.includes("다른 관리자")) {
            alert(errorMessage);
          } else {
            alert("채팅방 거절에 실패했습니다: " + errorMessage);
          }
        } else {
          alert("채팅방 거절에 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    }
  };
  // 거절 취소
  const handleCancelReject = () => {
    setShowRejectForm(false);
    setShowActiveRejectForm(false);
    setRejectionReason("");
  };
  // 채팅 종료 (상태를 ENDED로 변경)
  const handleEndChat = async () => {
    if (window.confirm("채팅을 종료하시겠습니까?")) {
      setLoading(true);
      try {
        console.log("🔥 채팅 종료 시도:", chatRoom.no);
        await updateChatRoomStatus(chatRoom.no, "ENDED");
        alert("채팅을 종료했습니다.");
        onUpdate();
        onClose();
      } catch (error) {
        console.error("❌ 채팅 종료 실패:", error);
        if (error.response?.status === 401) {
          alert("인증이 필요합니다. 다시 로그인해주세요.");
        } else if (error.response?.status === 403) {
          alert("권한이 없습니다. 관리자 권한이 필요합니다.");
        } else if (
          error.response?.status === 400 ||
          error.response?.status === 500
        ) {
          // 관리자 접근 제한 에러 처리
          const errorMessage = error.response?.data?.message || error.message;
          if (errorMessage && errorMessage.includes("다른 관리자")) {
            alert(errorMessage);
          } else {
            alert("채팅 종료에 실패했습니다: " + errorMessage);
          }
        } else {
          alert("채팅 종료에 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "WAITING":
        return "대기";
      case "ACTIVE":
        return "상담중";
      case "ENDED":
        return "완료";
      case "REJECTED":
        return "거절";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">상태 관리</h2>
        <div className="mb-6">
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
              <span className="font-medium">
                {chatRoom.questionType || "-"}
              </span>
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
                className={`px-2 py-1 rounded text-xs font-medium ${
                  chatRoom.status === "WAITING"
                    ? "bg-yellow-100 text-yellow-600"
                    : chatRoom.status === "ACTIVE"
                    ? "bg-teal-100 text-teal-600"
                    : chatRoom.status === "ENDED"
                    ? "bg-green-100 text-green-600"
                    : chatRoom.status === "REJECTED"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
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
        </div>
        <div className="space-y-3">
          {/* 다른 관리자가 담당하고 있는 경우 접근 제한 메시지 표시 */}
          {chatRoom.admin && chatRoom.admin.email !== loginState?.email && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-orange-600">🔒</span>
                <div>
                  <h4 className="font-medium text-orange-800">접근 제한</h4>
                  <p className="text-sm text-orange-700">
                    이 채팅방은 다른 관리자(
                    {chatRoom.admin.nickname || chatRoom.admin.email})가
                    담당하고 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
          {chatRoom.status === "WAITING" && !showRejectForm && (
            <>
              <button
                onClick={handleEnterChat}
                disabled={loading}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "처리중..." : "📞 채팅방 입장"}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
                className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ 채팅 거절
              </button>
            </>
          )}
          {chatRoom.status === "WAITING" && showRejectForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거절 사유를 입력해주세요
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="거절 사유를 상세히 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {rejectionReason.length}/500
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRejectChat}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "처리중..." : "거절 확정"}
                </button>
                <button
                  onClick={handleCancelReject}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
              </div>
            </div>
          )}
          {chatRoom.status === "ACTIVE" && !showActiveRejectForm && (
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/support/chat/${chatRoom.no}`)}
                disabled={loading}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💬 채팅방 입장
              </button>
              <button
                onClick={handleEndChat}
                disabled={loading}
                className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "처리중..." : "✅ 채팅 종료"}
              </button>
              <button
                onClick={() => setShowActiveRejectForm(true)}
                disabled={loading}
                className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ 상담 거절
              </button>
            </div>
          )}
          {chatRoom.status === "ACTIVE" && showActiveRejectForm && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거절 사유를 입력해주세요
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="상담 거절 사유를 상세히 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {rejectionReason.length}/500
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRejectChat}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "처리중..." : "거절 확정"}
                </button>
                <button
                  onClick={handleCancelReject}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
              </div>
            </div>
          )}
          {chatRoom.status === "ENDED" && (
            <div className="text-center text-gray-500 py-4">
              이미 종료된 채팅방입니다.
            </div>
          )}
          {chatRoom.status === "REJECTED" && (
            <div className="text-center text-red-500 py-4">
              거절된 채팅방입니다.
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
