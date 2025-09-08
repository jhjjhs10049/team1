import React from "react";

const PasswordSection = ({ editData, onChange }) => {
  return (
    <>
      {/* 새 비밀번호 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          새 비밀번호 (변경시에만 입력)
        </label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          name="pw"
          type="password"
          placeholder="새 비밀번호를 입력하세요 (6자리 이상)"
          value={editData.pw}
          onChange={onChange}
        />
      </div>

      {/* 비밀번호 확인 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 확인
        </label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          name="pwConfirm"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={editData.pwConfirm}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default PasswordSection;
