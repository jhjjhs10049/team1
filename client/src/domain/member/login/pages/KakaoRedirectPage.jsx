import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getAccessToken, getMemberWithAccessToken } from "../../api/kakaoApi";
import { useDispatch } from "react-redux";
import { login } from "../slices/loginSlice";
import useCustomLogin from "../hooks/useCustomLogin";
import BannedMemberModal from "../components/BannedMemberModal";
import { getCookie } from "../../util/cookieUtil";

//소셜 로그인 한 경우 카카오 서버가 여기로 데이터를 보내준다.
//카카오 앱에서 설정한 Redirect URI 경로(http://localhost:5173/member/kakao)에 대한 처리 페이지 이다.
const KakaoRedirectPage = () => {
  //소셜 로그인 후 이동할 경로
  const { moveToPath } = useCustomLogin();
  // 정지된 회원 모달 상태
  const [bannedModalOpen, setBannedModalOpen] = useState(false);
  const [banInfo, setBanInfo] = useState(null);

  // useEffect 중복 실행 방지를 위한 ref
  const isProcessingRef = useRef(false);

  //쿼리 스트링을 searchParams 에 저장
  const [searchParams] = useSearchParams(); // 카카오 서버에서 보내준 데이터가 저장됨
  //읽어온 쿼리 스트링에서 code가 가르키는 값(인가코드)을 저장
  const authCode = searchParams.get("code");
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("KakaoRedirectPage - authCode:", authCode);

    if (!authCode) {
      console.error("인가 코드가 없습니다.");
      alert("카카오 로그인에 실패했습니다. 인가 코드가 없습니다.");
      moveToPath("/member/login");
      return;
    } // 인가 코드가 이미 처리된 경우 중복 실행 방지
    if (isProcessingRef.current) {
      console.log("이미 처리 중인 카카오 로그인 요청입니다.");
      return;
    }

    isProcessingRef.current = true;

    getAccessToken(authCode)
      .then((accessToken) => {
        console.log("Access Token 발급 성공:", accessToken);
        return getMemberWithAccessToken(accessToken);
      })
      .then((memberInfo) => {
        // 정상 로그인 처리
        console.log("카카오 로그인 성공:", memberInfo);
        console.log("memberInfo.accessToken:", memberInfo.accessToken);
        console.log("memberInfo.refreshToken:", memberInfo.refreshToken);

        dispatch(login(memberInfo));

        // 쿠키 확인
        const cookie = getCookie("member");
        console.log("쿠키 확인:", cookie);

        moveToPath("/");
      })
      .catch((error) => {
        console.error("카카오 로그인 오류:", error);
        console.error("오류 상세:", error.response?.data);

        isProcessingRef.current = false; // 오류 발생 시 플래그 초기화
        // KOE320 오류 (인가 코드 만료/재사용) 처리
        if (error.response?.data?.error_code === "KOE320") {
          alert(
            "카카오 로그인 세션이 만료되었습니다.\n페이지를 새로고침하거나 뒤로가기 후 다시 로그인해주세요."
          );
          moveToPath("/member/login");
          return;
        }

        // invalid_grant 오류 (일반적인 인가 코드 문제) 처리
        if (error.response?.data?.error === "invalid_grant") {
          alert(
            "카카오 로그인 처리 중 문제가 발생했습니다.\n다시 로그인을 시도해주세요."
          );
          moveToPath("/member/login");
          return;
        }

        // 403 에러이고 정지된 회원인 경우 처리
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

        // 일반 에러 처리
        alert("카카오 로그인 중 오류가 발생했습니다.");
        moveToPath("/member/login");
      });
  }, [authCode, dispatch, moveToPath]);

  const handleBannedModalClose = () => {
    setBannedModalOpen(false);
    moveToPath("/member/login");
  };

  return (
    <div>
      <div>Kakao Login Redirect</div>
      <div>{authCode}</div> {/* 카카오에서 전송해준 '인가코드'  */}
      {/* 정지된 회원 모달 */}
      <BannedMemberModal
        isOpen={bannedModalOpen}
        onClose={handleBannedModalClose}
        banInfo={banInfo}
      />
    </div>
  );
};

export default KakaoRedirectPage;
