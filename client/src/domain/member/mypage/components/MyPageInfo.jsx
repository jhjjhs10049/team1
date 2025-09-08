import React from "react";

const MyPageInfo = ({ memberData, onEditClick, onWithdrawClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "날짜 오류";
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 오류";
    }
  };
  return (
    <div className="max-w-7xl mx-auto">
      {/* 회원번호 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          회원번호
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {memberData.memberNo}
        </div>
      </div>
      {/* 이메일 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-between">
          <span>{memberData.email}</span>
          {memberData.social && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              소셜 로그인
            </span>
          )}
        </div>
      </div>
      {/* 닉네임 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          닉네임
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {memberData.nickname}
        </div>
      </div>
      {/* 전화번호 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          전화번호
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {memberData.phone || "등록된 전화번호가 없습니다."}
        </div>
      </div>
      {/* 우편번호 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          우편번호
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {memberData.postalCode || "등록된 우편번호가 없습니다."}
        </div>
      </div>
      {/* 도로명주소 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          도로명주소
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {memberData.roadAddress || "등록된 도로명주소가 없습니다."}
        </div>
      </div>
      {/* 상세주소 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상세주소
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {memberData.detailAddress || "등록된 상세주소가 없습니다."}
        </div>
      </div>
      {/* 가입일 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          가입일
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {formatDate(memberData.joinedDate)}
        </div>
      </div>
      {/* 정보 수정 및 회원탈퇴 버튼 */}
      <div className="flex justify-center gap-4 mt-16 pt-8 border-t border-gray-200">
        <button
          className="px-8 py-3 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium"
          onClick={onEditClick}
        >
          정보 수정
        </button>
        {/* 소셜 로그인 사용자가 아닌 경우에만 회원탈퇴 버튼 표시 */}
        {!memberData.social && (
          <button
            className="px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
            onClick={onWithdrawClick}
          >
            회원탈퇴
          </button>
        )}
      </div>
    </div>
  );
};

export default MyPageInfo;
