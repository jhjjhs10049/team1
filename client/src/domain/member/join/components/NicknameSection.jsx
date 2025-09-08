import { checkNickname } from "../../api/memberApi";

const NicknameSection = ({
  nickname,
  nicknameCheck,
  setNicknameCheck,
  onChange,
  onKeyPress,
}) => {
  // 닉네임 중복확인 함수
  const handleNicknameCheck = async () => {
    if (!nickname.trim()) {
      setNicknameCheck({
        checked: true,
        available: false,
        message: "닉네임을 입력해주세요.",
      });
      return;
    }

    if (nickname.length < 2) {
      setNicknameCheck({
        checked: true,
        available: false,
        message: "닉네임은 2자 이상 입력해주세요.",
      });
      return;
    }

    try {
      const response = await checkNickname(nickname);

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
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">
        닉네임 <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          name="nickname"
          type="text"
          placeholder="닉네임을 입력하세요 (2자 이상)"
          value={nickname}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
        <button
          type="button"
          className="px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors whitespace-nowrap disabled:bg-gray-400"
          onClick={handleNicknameCheck}
          disabled={!nickname.trim()}
        >
          중복확인
        </button>
      </div>
      {/* 중복확인 결과 메시지 */}
      {nicknameCheck.checked && (
        <div
          className={`text-sm px-3 py-2 rounded-lg ${
            nicknameCheck.available
              ? "text-green-700 bg-green-50 border border-green-200"
              : "text-red-700 bg-red-50 border border-red-200"
          }`}
        >
          {nicknameCheck.message}
        </div>
      )}
    </div>
  );
};

export default NicknameSection;
