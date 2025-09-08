import React from "react";

const UpdateResultModal = ({
  isOpen,
  onClose,
  title,
  message,
  isSuccess = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* 아이콘 */}
          <div
            className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
              isSuccess ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {isSuccess ? (
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          {/* 제목 */}
          <div
            className={`text-2xl font-bold mb-4 ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {title}
          </div>

          {/* 메시지 */}
          <div className="text-gray-700 mb-6">
            <p className="text-lg mb-2">{message}</p>
            {isSuccess && (
              <p className="text-sm text-gray-500">
                변경사항이 성공적으로 저장되었습니다.
              </p>
            )}
          </div>

          {/* 확인 버튼 */}
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 text-white rounded-md transition-colors font-medium ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateResultModal;
