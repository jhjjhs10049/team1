import React from "react";

const ChatExitModal = ({ show, chatRoom, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-lg md:text-xl">⚠️</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              {chatRoom.status === "REJECTED" || chatRoom.status === "ENDED"
                ? "채팅방에서 나가시겠습니까?"
                : "채팅을 종료하시겠습니까?"}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {chatRoom.status === "REJECTED"
                ? "상담이 거절된 채팅방에서 나갑니다. 새로운 문의를 하려면 새로운 채팅방을 생성해야 합니다."
                : chatRoom.status === "ENDED"
                ? "상담이 완료된 채팅방에서 나갑니다. 새로운 문의를 하려면 새로운 채팅방을 생성해야 합니다."
                : "채팅을 종료하면 상담이 완료되며, 다시 문의하려면 새로운 채팅방을 생성해야 합니다."}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200 w-full sm:w-auto order-2 sm:order-1"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 w-full sm:w-auto order-1 sm:order-2"
          >
            {chatRoom.status === "REJECTED" || chatRoom.status === "ENDED"
              ? "나가기"
              : "채팅 종료"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatExitModal;
