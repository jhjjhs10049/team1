import React from "react";

const BannedMemberModal = ({ isOpen, onClose, banInfo }) => {
  if (!isOpen || !banInfo) return null;
  const formatDate = (dateString) => {
    if (!dateString) return "무기한";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "무기한";
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "무기한";
    }
  };
  const getBanDuration = () => {
    if (!banInfo.bannedUntil) return "무기한";

    const now = new Date();
    const endDate = new Date(banInfo.bannedUntil);
    const diffTime = endDate - now;

    if (diffTime <= 0) return "정지 기간 만료";

    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days === 1) return "오늘까지";
    return `${days}일 남음`;
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* 아이콘 */}
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          {/* 제목 */}
          <div className="text-2xl font-bold text-red-600 mb-4">
            정지된 회원입니다
          </div>
          {/* 메시지 */}
          <div className="text-gray-700 mb-6">
            <p className="mb-4 text-lg font-medium text-red-600">
              귀하의 계정은 현재 정지 상태입니다.
            </p>
            <p className="mb-4">관리자에게 문의하시기 바랍니다.</p>

            {/* 정지 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">정지 사유:</span>
                  <span className="text-red-600 font-medium">
                    {banInfo.reason || "규정 위반"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">정지 시작:</span>
                  <span>{formatDate(banInfo.bannedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">정지 종료:</span>
                  <span>{formatDate(banInfo.bannedUntil)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">남은 기간:</span>
                  <span className="text-orange-600 font-medium">
                    {getBanDuration()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* 안내 메시지 */}
          <div className="text-sm text-gray-500 mb-6">
            <p>문의사항이 있으시면 고객센터로 연락해주세요.</p>
            <p className="mt-1">
              <span className="font-medium">고객센터: </span>
              <span className="text-teal-600">1588-xxxx</span>
            </p>
          </div>
          {/* 확인 버튼 */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannedMemberModal;
