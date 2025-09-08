const PasswordSection = ({ pw, pwConfirm, onChange, onKeyPress }) => {
  return (
    <>
      {/* 비밀번호 입력 */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          비밀번호 <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          name="pw"
          type="password"
          placeholder="비밀번호를 입력하세요 (6자리 이상)"
          value={pw}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          비밀번호 확인 <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          name="pwConfirm"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={pwConfirm}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </div>
    </>
  );
};

export default PasswordSection;
