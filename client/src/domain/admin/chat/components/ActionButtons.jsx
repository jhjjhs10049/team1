import { useNavigate } from "react-router-dom";

const ActionButtons = ({
  chatRoom,
  loading,
  onEnterChat,
  onEndChat,
  onShowRejectForm,
  onShowActiveRejectForm,
}) => {
  const navigate = useNavigate();

  const renderWaitingButtons = () => (
    <>
      <button
        onClick={onEnterChat}
        disabled={loading}
        className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "처리중..." : "📞 채팅방 입장"}
      </button>
      <button
        onClick={onShowRejectForm}
        disabled={loading}
        className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ❌ 채팅 거절
      </button>
    </>
  );

  const renderActiveButtons = () => (
    <div className="space-y-2">
      <button
        onClick={() => navigate(`/support/chat/${chatRoom.no}`)}
        disabled={loading}
        className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        💬 채팅방 입장
      </button>
      <button
        onClick={onEndChat}
        disabled={loading}
        className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "처리중..." : "✅ 채팅 종료"}
      </button>
      <button
        onClick={onShowActiveRejectForm}
        disabled={loading}
        className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ❌ 상담 거절
      </button>
    </div>
  );

  const renderEndedMessage = () => (
    <div className="text-center text-gray-500 py-4">
      이미 종료된 채팅방입니다.
    </div>
  );

  const renderRejectedMessage = () => (
    <div className="text-center text-red-500 py-4">거절된 채팅방입니다.</div>
  );

  if (chatRoom.status === "WAITING") {
    return renderWaitingButtons();
  }

  if (chatRoom.status === "ACTIVE") {
    return renderActiveButtons();
  }

  if (chatRoom.status === "ENDED") {
    return renderEndedMessage();
  }

  if (chatRoom.status === "REJECTED") {
    return renderRejectedMessage();
  }

  return null;
};

export default ActionButtons;
