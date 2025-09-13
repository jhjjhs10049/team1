import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginPostAsync } from "../slices/loginSlice";
import useCustomLogin from "../hooks/useCustomLogin";
import KakaoLoginComponent from "./KakaoLoginComponent";
import BannedMemberModal from "./BannedMemberModal";
import PasswordResetModal from "./PasswordResetModal";

const initState = {
  email: "",
  pw: "",
};

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const [bannedModalOpen, setBannedModalOpen] = useState(false);
  const [banInfo, setBanInfo] = useState(null);
  const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false);
  const { moveToPath } = useCustomLogin();

  // Redux 상태에서 ban 정보 가져오기
  const loginState = useSelector((state) => state.loginSlice);
  const reduxBanInfo = loginState.banInfo;

  const dispatch = useDispatch();
  const handleChange = (e) => {
    loginParam[e.target.name] = e.target.value;
    setLoginParam({ ...loginParam });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleClickLogin();
    }
  };

  const handleClickLogin = () => {
    dispatch(loginPostAsync(loginParam))
      .unwrap()
      .then((data) => {
        if (data.error) {
          alert("이메일과 패스워드를 다시 확인 하세요");
        } else {
          alert("로그인 성공");
          moveToPath("/");
        }
      })
      .catch((error) => {
        // BannedMemberError인 경우 처리
        if (
          error.name === "BannedMemberError" ||
          error.message === "MEMBER_BANNED"
        ) {
          // Redux에서 가져온 banInfo 우선 사용, 없으면 error에서 가져오기
          const banInfoData = reduxBanInfo ||
            error.banInfo || {
              reason: "규정 위반",
              bannedAt: new Date().toISOString(),
              bannedUntil: null,
            };

          setBanInfo(banInfoData);
          setBannedModalOpen(true);
          return;
        }

        // AxiosError에서 직접 서버 응답 데이터 확인 (fallback)
        if (error.response && error.response.status === 403) {
          const responseData = error.response.data;

          if (responseData.error === "MEMBER_BANNED") {
            const banInfoData = responseData.banInfo || {
              reason: "규정 위반",
              bannedAt: new Date().toISOString(),
              bannedUntil: null,
            };

            setBanInfo(banInfoData);
            setBannedModalOpen(true);
            return;
          }
        }

        // 일반적인 로그인 실패
        alert("이메일과 패스워드를 다시 확인하세요");
      });
  };
  return (
    <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">로그인</h1>
        <p className="text-gray-600">계정에 로그인하여 서비스를 이용하세요</p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            name="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={loginParam.email}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            name="pw"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={loginParam.pw}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
          />
        </div>
        <button
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium 
          py-3 px-4 rounded-lg transition-colors duration-200"
          onClick={handleClickLogin}
        >
          로그인
        </button>
        <div className="text-center text-sm text-gray-600">
          계정이 없으신가요?
          <button
            className="text-teal-500 hover:text-teal-600 font-medium underline"
            onClick={() => moveToPath("/member/join")}
          >
            회원가입 하기
          </button>
        </div>
        {/* 비밀번호 찾기 버튼 */}
        <div className="text-center">
          <button
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            onClick={() => setPasswordResetModalOpen(true)}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>
      <div className="mt-8">
        <KakaoLoginComponent />
      </div>
      {/* 정지된 회원 모달 */}
      <BannedMemberModal
        isOpen={bannedModalOpen}
        onClose={() => setBannedModalOpen(false)}
        banInfo={banInfo}
      />
      {/* 비밀번호 재설정 모달 */}
      <PasswordResetModal
        isOpen={passwordResetModalOpen}
        onClose={() => setPasswordResetModalOpen(false)}
      />
    </div>
  );
};

export default LoginComponent;
