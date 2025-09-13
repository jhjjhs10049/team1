import React from "react";

/**
 * 멀티채팅 나가기 확인 모달
 */
const MultChatExitModal = ({ isOpen, onConfirm, onCancel, roomInfo, isCreator }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            채팅방에서 나가시겠습니까?
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {isCreator ? (
                                <>
                                    <span className="font-semibold text-orange-600">방장으로서 나가면</span> 다른 참가자에게 방장 권한이 위임되거나,
                                    마지막 참가자인 경우 채팅방이 폐쇄됩니다.
                                </>
                            ) : (
                                <>
                                    채팅방에서 나가면 <span className="font-semibold">"내 채팅방" 목록에서 제거</span>되며,
                                    다시 참가하려면 채팅방을 다시 찾아 입장해야 합니다.
                                </>
                            )}
                        </p>
                        {roomInfo && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-left">
                                <p className="text-sm font-medium text-gray-700">
                                    채팅방: {roomInfo.roomName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    현재 참가자: {roomInfo.currentParticipants}명
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:justify-end p-6 pt-0">
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
                        나가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultChatExitModal;
