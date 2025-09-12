import { useState } from "react";
import { joinPost } from "../../api/memberApi";
import useCustomLogin from "../../login/hooks/useCustomLogin";
import ResultModal from "../../../../common/components/ResultModal";
import EmailSection from "./EmailSection";
import PasswordSection from "./PasswordSection";
import NicknameSection from "./NicknameSection";
import AddressSection from "./AddressSection";

const initState = {
  email: "",
  pw: "",
  pwConfirm: "",
  nickname: "",
  phone: "",
  postalCode: "",
  roadAddress: "",
  detailAddress: "",
};

const JoinForm = ({ verifiedEmail, onBackToVerification }) => {
  // 인증된 이메일로 초기화
  const initStateWithEmail = {
    email: verifiedEmail || "",
    pw: "",
    pwConfirm: "",
    nickname: "",
    phone: "",
    postalCode: "",
    roadAddress: "",
    detailAddress: "",
  };

  const [joinParam, setJoinParam] = useState({ ...initStateWithEmail });
  const [result, setResult] = useState(null); // 이메일 중복확인 및 인증 상태 - 인증된 이메일은 이미 확인됨
  const [emailCheck, setEmailCheck] = useState({
    checked: verifiedEmail ? true : false,
    available: verifiedEmail ? true : false,
    message: verifiedEmail ? "인증 완료된 이메일입니다." : "",
  });
  const [nicknameCheck, setNicknameCheck] = useState({
    checked: false,
    available: false,
    message: "",
  });
  // 이메일 인증 상태 - 인증된 이메일은 이미 확인됨
  const [emailVerification, setEmailVerification] = useState({
    verified: verifiedEmail ? true : false,
    showModal: false,
  });

  const { moveToPath } = useCustomLogin();
  const handleChange = (e) => {
    // 인증된 이메일은 변경할 수 없음
    if (e.target.name === "email" && verifiedEmail) {
      return;
    }

    joinParam[e.target.name] = e.target.value;
    setJoinParam({ ...joinParam });

    // 이메일이 변경되면 중복확인 및 인증상태 리셋 (인증된 이메일이 아닌 경우만)
    if (e.target.name === "email" && !verifiedEmail) {
      setEmailCheck({
        checked: false,
        available: false,
        message: "",
      });
      setEmailVerification({
        verified: false,
        showModal: false,
      });
    }

    // 닉네임이 변경되면 중복확인 상태 리셋
    if (e.target.name === "nickname") {
      setNicknameCheck({
        checked: false,
        available: false,
        message: "",
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleClickJoin();
    }
  };

  const handleClickJoin = async () => {
    try {
      // 입력 값 검증
      if (
        !joinParam.email ||
        !joinParam.pw ||
        !joinParam.pwConfirm ||
        !joinParam.nickname
      ) {
        alert("모든 필수 필드를 입력해주세요.");
        return;
      }

      if (joinParam.pw.length < 6) {
        alert("비밀번호는 6자리 이상 입력해주세요.");
        return;
      }
      if (joinParam.pw !== joinParam.pwConfirm) {
        alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }

      // 이메일 중복확인 체크
      if (!emailCheck.checked) {
        alert("이메일 중복확인을 해주세요.");
        return;
      }

      if (!emailCheck.available) {
        alert("사용할 수 없는 이메일입니다. 다른 이메일을 선택해주세요.");
        return;
      } // 닉네임 중복확인 체크
      if (!nicknameCheck.checked) {
        alert("닉네임 중복확인을 해주세요.");
        return;
      }
      if (!nicknameCheck.available) {
        alert("사용할 수 없는 닉네임입니다. 다른 닉네임을 선택해주세요.");
        return;
      }

      // 이메일 인증 체크
      if (!emailVerification.verified) {
        alert("이메일 인증을 완료해주세요.");
        setEmailVerification((prev) => ({ ...prev, showModal: true }));
        return;
      }

      // 서버에 전송할 데이터에서 pwConfirm 제외
      const { pwConfirm: _pwConfirm, ...submitData } = joinParam;
      await joinPost(submitData);
      setResult(
        "🎉 회원가입이 성공적으로 완료되었습니다! 이제 로그인하여 서비스를 이용해보세요."
      );
    } catch (error) {
      console.error("Join error:", error.response?.status);

      if (error.response?.data?.message) {
        alert(`회원가입 오류: ${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        alert("입력 데이터에 오류가 있습니다. 다시 확인해주세요.");
      } else if (error.response?.status === 500) {
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        alert(`회원가입 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  const closeModal = () => {
    setResult(null);
    setJoinParam({ ...initState }); // 폼 초기화
    setEmailCheck({
      checked: false,
      available: false,
      message: "",
    });
    setNicknameCheck({
      checked: false,
      available: false,
      message: "",
    });
    moveToPath("/member/login"); // 로그인 페이지로 이동
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg p-8">
      {result ? (
        <ResultModal
          title={"환영합니다! 🎉"}
          content={result}
          callbackFn={closeModal}
          isSuccess={true}
        />
      ) : null}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
        <p className="text-gray-600">
          {verifiedEmail
            ? `${verifiedEmail}로 회원가입을 진행합니다`
            : "새 계정을 만들어 서비스를 시작하세요"}
        </p>
        {verifiedEmail && (
          <button
            onClick={onBackToVerification}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← 이메일 인증으로 돌아가기
          </button>
        )}
      </div>
      <div className="space-y-6">
        {/* 이메일 섹션 */}
        <EmailSection
          email={joinParam.email}
          emailCheck={emailCheck}
          setEmailCheck={setEmailCheck}
          emailVerification={emailVerification}
          setEmailVerification={setEmailVerification}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          isVerifiedEmail={!!verifiedEmail}
        />
        {/* 비밀번호 섹션 */}
        <PasswordSection
          pw={joinParam.pw}
          pwConfirm={joinParam.pwConfirm}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        {/* 닉네임 섹션 */}
        <NicknameSection
          nickname={joinParam.nickname}
          nicknameCheck={nicknameCheck}
          setNicknameCheck={setNicknameCheck}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        {/* 전화번호 섹션 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            전화번호 (선택)
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            name="phone"
            type="tel"
            placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
            value={joinParam.phone}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
        </div>
        {/* 주소 섹션 */}
        <AddressSection
          postalCode={joinParam.postalCode}
          roadAddress={joinParam.roadAddress}
          detailAddress={joinParam.detailAddress}
          setJoinParam={setJoinParam}
          joinParam={joinParam}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="mt-16 pt-8 space-y-4">
        <button
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          onClick={handleClickJoin}
        >
          회원가입
        </button>

        <div className="text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <button
            className="text-teal-500 hover:text-teal-600 font-medium underline"
            onClick={() => moveToPath("/member/login")}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinForm;
