import { checkEmail } from "../../api/memberApi";

const EmailSection = ({
  email,
  emailCheck,
  setEmailCheck,
  onChange,
  onKeyPress,
}) => {
  // 이메일 중복확인 함수
  const handleEmailCheck = async () => {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailCheck({
        checked: true,
        available: false,
        message: "이메일을 입력해주세요.",
      });
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailCheck({
        checked: true,
        available: false,
        message: "올바른 이메일 형식을 입력해주세요.",
      });
      return;
    }

    try {
      const response = await checkEmail(email);

      if (response.exists) {
        setEmailCheck({
          checked: true,
          available: false,
          message: "이미 사용중인 이메일입니다.",
        });
      } else {
        setEmailCheck({
          checked: true,
          available: true,
          message: "사용 가능한 이메일입니다.",
        });
      }
    } catch (error) {
      console.error("이메일 중복확인 오류:", error);
      setEmailCheck({
        checked: true,
        available: false,
        message: "중복확인 중 오류가 발생했습니다.",
      });
    }
  };
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">
        이메일 <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2 mb-2">
        <input
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          name="email"
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
        <button
          type="button"
          className="px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors whitespace-nowrap disabled:bg-gray-400"
          onClick={handleEmailCheck}
          disabled={!email.trim()}
        >
          중복확인
        </button>
      </div>
      {emailCheck.checked && (
        <div
          className={`text-sm px-3 py-2 rounded-lg ${
            emailCheck.available
              ? "text-green-700 bg-green-50 border border-green-200"
              : "text-red-700 bg-red-50 border border-red-200"
          }`}
        >
          {emailCheck.message}
        </div>
      )}
    </div>
  );
};

export default EmailSection;
