import React from "react";
import { checkNickname } from "../../api/memberApi";

const ProfileSection = ({
  editData,
  memberData,
  nicknameCheck,
  setNicknameCheck,
  onChange,
}) => {
  // 닉네임 중복확인 함수
  const handleNicknameCheck = async () => {
    if (!editData.nickname.trim()) {
      setNicknameCheck({
        checked: true,
        available: false,
        message: "닉네임을 입력해주세요.",
      });
      return;
    }

    if (editData.nickname.length < 2) {
      setNicknameCheck({
        checked: true,
        available: false,
        message: "닉네임은 2자 이상 입력해주세요.",
      });
      return;
    }

    // 현재 닉네임과 같다면 사용 가능
    if (editData.nickname === memberData.nickname) {
      setNicknameCheck({
        checked: true,
        available: true,
        message: "현재 사용중인 닉네임입니다.",
      });
      return;
    }

    try {
      const response = await checkNickname(editData.nickname);

      if (response.exists) {
        setNicknameCheck({
          checked: true,
          available: false,
          message: "이미 사용중인 닉네임입니다.",
        });
      } else {
        setNicknameCheck({
          checked: true,
          available: true,
          message: "사용 가능한 닉네임입니다.",
        });
      }
    } catch (error) {
      console.error("닉네임 중복확인 오류:", error);
      setNicknameCheck({
        checked: true,
        available: false,
        message: "중복확인 중 오류가 발생했습니다.",
      });
    }
  };
  return (
    <>
      {/* 이메일 (읽기 전용) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <div className="w-full p-3 bg-gray-50 rounded-md border border-gray-300">
          {editData.email}
        </div>
      </div>

      {/* 닉네임 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          닉네임
        </label>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            name="nickname"
            type="text"
            placeholder="닉네임을 입력하세요 (2자 이상)"
            value={editData.nickname}
            onChange={onChange}
          />
          <button
            type="button"
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors whitespace-nowrap"
            onClick={handleNicknameCheck}
            disabled={!editData.nickname.trim()}
          >
            중복확인
          </button>
        </div>
        {nicknameCheck.checked && (
          <div
            className={`w-full text-sm px-3 py-2 rounded ${
              nicknameCheck.available
                ? "text-green-700 bg-green-100 border border-green-200"
                : "text-red-700 bg-red-100 border border-red-200"
            }`}
          >
            {nicknameCheck.message}
          </div>
        )}
      </div>

      {/* 전화번호 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          전화번호
        </label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          name="phone"
          type="tel"
          placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
          value={editData.phone}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default ProfileSection;
