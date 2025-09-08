import React, { useState } from "react";

const WithdrawModal = ({ isOpen, onClose, onConfirm, memberEmail }) => {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (confirmText !== "회원탈퇴") {
      alert("'회원탈퇴'를 정확히 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ 회원탈퇴
          </div>

          <div className="text-gray-700 mb-6">
            <p className="mb-2">정말로 회원탈퇴를 하시겠습니까?</p>
            <p className="mb-2 text-sm text-gray-500">
              탈퇴한 계정은 복구할 수 없습니다.
            </p>
            <p className="text-sm text-red-500 font-semibold">{memberEmail}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              확인을 위해 <span className="text-red-500">'회원탈퇴'</span>를
              입력해주세요
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="회원탈퇴"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || confirmText !== "회원탈퇴"}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "처리중..." : "탈퇴하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;
