import React, { useState } from "react";
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
  resetPassword,
} from "../../api/memberApi";

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증번호 입력, 3: 새 비밀번호 입력
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5분
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error', 'info'

  // 모달 닫기 및 초기화
  const handleClose = () => {
    setStep(1);
    setEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setMessageType("");
    setCountdown(300);
    onClose();
  };

  // 이메일 형식 검증
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 타이머 시작
  const startTimer = () => {
    setCountdown(300);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setMessage("인증 시간이 만료되었습니다. 다시 시도해주세요.");
          setMessageType("error");
          setStep(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1단계: 이메일 입력 및 인증번호 전송
  const handleSendCode = async () => {
    if (!email.trim()) {
      setMessage("이메일을 입력해주세요.");
      setMessageType("error");
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("올바른 이메일 형식을 입력해주세요.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await sendPasswordResetCode(email);
      setMessage("인증번호가 전송되었습니다. 이메일을 확인해주세요.");
      setMessageType("success");
      setStep(2);
      startTimer();
    } catch (error) {
      console.error("인증코드 전송 오류:", error);
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message || "인증번호 전송에 실패했습니다.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setMessage("인증번호를 입력해주세요.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await verifyPasswordResetCode(email, verificationCode);
      setMessage("인증이 완료되었습니다!");
      setMessageType("success");
      setStep(3);
    } catch (error) {
      console.error("인증코드 확인 오류:", error);
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message ||
            "인증번호가 올바르지 않거나 만료되었습니다.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계: 비밀번호 재설정
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setMessage("새 비밀번호를 입력해주세요.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("비밀번호는 6자리 이상 입력해주세요.");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      await resetPassword(email, verificationCode, newPassword);
      setMessage("비밀번호가 성공적으로 변경되었습니다!");
      setMessageType("success");

      // 성공 후 2초 뒤에 모달 닫기
      setTimeout(() => {
        handleClose();
        alert("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.");
      }, 2000);
    } catch (error) {
      console.error("비밀번호 재설정 오류:", error);
      const errorMessage =
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message || "비밀번호 재설정에 실패했습니다.";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 시간 포맷팅 (mm:ss)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🔐 비밀번호 찾기
          </h2>
          <p className="text-gray-600">
            {step === 1 && "이메일 주소를 입력하여 인증번호를 받으세요"}
            {step === 2 && "이메일로 전송된 인증번호를 입력하세요"}
            {step === 3 && "새로운 비밀번호를 설정하세요"}
          </p>
        </div>

        {/* 단계 표시 */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1
                  ? "bg-teal-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`w-12 h-1 ${
                step >= 2 ? "bg-teal-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2
                  ? "bg-teal-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
            <div
              className={`w-12 h-1 ${
                step >= 3 ? "bg-teal-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 3
                  ? "bg-teal-600 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : messageType === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* 1단계: 이메일 입력 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                이메일 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendCode()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="가입시 사용한 이메일을 입력하세요"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              onClick={handleSendCode}
              disabled={isLoading || !email.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "전송중..." : "인증번호 전송"}
            </button>
          </div>
        )}

        {/* 2단계: 인증번호 입력 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-800">
                  인증번호 (6자리) <span className="text-red-500">*</span>
                </label>
                {countdown > 0 && (
                  <span className="text-sm text-orange-600 font-mono">
                    ⏰ {formatTime(countdown)}
                  </span>
                )}
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  인증번호가
                  <span className="font-semibold text-teal-600">{email}</span>로
                  전송되었습니다.
                </p>
              </div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleVerifyCode()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-lg font-mono"
                placeholder="000000"
                maxLength="6"
                disabled={isLoading || countdown === 0}
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleVerifyCode}
                disabled={
                  isLoading || !verificationCode.trim() || countdown === 0
                }
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "확인중..." : "인증 확인"}
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleSendCode}
                  disabled={isLoading || countdown > 0}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  재전송
                </button>
                <button
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  이메일 변경
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3단계: 새 비밀번호 입력 */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                새 비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="새 비밀번호를 입력하세요 (6자리 이상)"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleResetPassword()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="비밀번호를 다시 입력하세요"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={
                isLoading || !newPassword.trim() || !confirmPassword.trim()
              }
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "변경중..." : "비밀번호 변경"}
            </button>
          </div>
        )}

        {/* 닫기 버튼 */}
        <div className="mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            닫기
          </button>
        </div>

        {/* 안내사항 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            📋 안내사항
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 인증번호는 5분간 유효합니다</li>
            <li>• 이메일이 오지 않으면 스팸함을 확인해주세요</li>
            <li>• 소셜 로그인 회원은 비밀번호 재설정을 할 수 없습니다</li>
            <li>• 비밀번호는 6자리 이상 입력해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;
