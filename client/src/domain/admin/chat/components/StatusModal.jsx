import useStatusActions from "../hooks/useStatusActions";
import useRejectForm from "../hooks/useRejectForm";
import ChatRoomInfo from "./ChatRoomInfo";
import ActionButtons from "./ActionButtons";
import RejectForm from "./RejectForm";
import AccessRestriction from "./AccessRestriction";

const StatusModal = ({ isOpen, onClose, chatRoom, onUpdate }) => {
  const {
    loading,
    handleEnterChat,
    handleEndChat,
    handleRejectChat,
    loginState,
  } = useStatusActions();

  const {
    showRejectForm,
    rejectionReason,
    showActiveRejectForm,
    showWaitingRejectForm,
    showActiveRejectFormModal,
    handleCancelReject,
    handleReasonChange,
    resetForm,
  } = useRejectForm();

  if (!isOpen || !chatRoom) return null;

  // 액션 핸들러들
  const onEnterChat = () => handleEnterChat(chatRoom, onUpdate, onClose);
  const onEndChat = () => handleEndChat(chatRoom, onUpdate, onClose);
  const onRejectChat = () =>
    handleRejectChat(chatRoom, rejectionReason, onUpdate, onClose, resetForm);
  // 접근 권한 확인
  const isAccessRestricted =
    chatRoom.admin && chatRoom.admin.email !== loginState?.email;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">상태 관리</h2>

        <div className="mb-6">
          <ChatRoomInfo chatRoom={chatRoom} loginState={loginState} />
        </div>

        <div className="space-y-3">
          {/* 접근 제한 메시지 */}
          {isAccessRestricted && <AccessRestriction admin={chatRoom.admin} />}

          {/* 대기 상태 - 거절 폼 표시 */}
          {chatRoom.status === "WAITING" && showRejectForm && (
            <RejectForm
              rejectionReason={rejectionReason}
              onReasonChange={handleReasonChange}
              onConfirm={onRejectChat}
              onCancel={handleCancelReject}
              loading={loading}
            />
          )}

          {/* 활성 상태 - 거절 폼 표시 */}
          {chatRoom.status === "ACTIVE" && showActiveRejectForm && (
            <RejectForm
              rejectionReason={rejectionReason}
              onReasonChange={handleReasonChange}
              onConfirm={onRejectChat}
              onCancel={handleCancelReject}
              loading={loading}
              isActive={true}
            />
          )}

          {/* 액션 버튼들 */}
          {!showRejectForm && !showActiveRejectForm && (
            <ActionButtons
              chatRoom={chatRoom}
              loading={loading}
              onEnterChat={onEnterChat}
              onEndChat={onEndChat}
              onShowRejectForm={showWaitingRejectForm}
              onShowActiveRejectForm={showActiveRejectFormModal}
            />
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
