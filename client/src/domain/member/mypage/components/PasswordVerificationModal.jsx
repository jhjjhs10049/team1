import React, { useState } from "react";

const PasswordVerificationModal = ({
  isOpen,
  onClose,
  onVerify,
  memberEmail,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      await onVerify(password);
      setPassword(""); // 비밀번호 필드 초기화
    } catch (error) {
      console.error("비밀번호 확인 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-teal-600 mb-4">
            🔒 비밀번호 확인
          </div>
          <div className="text-gray-700 mb-6">
            <p className="mb-2">정보 수정을 위해 비밀번호를 확인해주세요.</p>
            <p className="mb-2 text-sm text-gray-500">
              보안을 위해 현재 비밀번호 입력이 필요합니다.
            </p>
            <p className="text-sm text-teal-500 font-semibold">{memberEmail}</p>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 비밀번호를 입력해주세요
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-blue-500"
              placeholder="현재 비밀번호를 입력하세요"
              disabled={isLoading}
              autoFocus
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
              onClick={handleVerify}
              disabled={isLoading || !password.trim()}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "확인중..." : "확인"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordVerificationModal;
