import React from "react";
import ProfileSection from "./ProfileSection";
import PasswordSection from "./PasswordSection";
import AddressSection from "../../join/components/AddressSection";

const MyPageEdit = ({
  editData,
  memberData,
  nicknameCheck,
  setNicknameCheck,
  setEditData,
  onChange,
  onSave,
  onCancel,
}) => {
  // 안전한 날짜 포맷팅 함수
  const formatDate = (dateValue) => {
    if (!dateValue) return "날짜 없음";
    try {
      const date = new Date(dateValue);
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
      {/* 회원번호 (읽기 전용) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          회원번호
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {memberData.memberNo}
        </div>
      </div>
      {/* 프로필 정보 섹션 */}
      <ProfileSection
        editData={editData}
        memberData={memberData}
        nicknameCheck={nicknameCheck}
        setNicknameCheck={setNicknameCheck}
        onChange={onChange}
      />
      {/* 비밀번호 섹션 - 소셜 로그인 사용자가 아닌 경우에만 표시 */}
      {!memberData.social && (
        <PasswordSection editData={editData} onChange={onChange} />
      )}
      {/* 주소 섹션 */}
      <AddressSection
        postalCode={editData.postalCode}
        roadAddress={editData.roadAddress}
        detailAddress={editData.detailAddress}
        setJoinParam={setEditData}
        joinParam={editData}
        onChange={onChange}
      />
      {/* 가입일 (읽기 전용) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          가입일
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {formatDate(memberData.joinedDate)}
        </div>
      </div>
      {/* 버튼 영역 */}
      <div className="flex justify-center gap-4 mt-16 pt-8 border-t border-gray-200">
        <button
          className="px-8 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
          onClick={onSave}
        >
          저장
        </button>
        <button
          className="px-8 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default MyPageEdit;
