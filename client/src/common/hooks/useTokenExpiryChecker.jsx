import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getCookie, isTokenExpired } from "../../domain/member/util/cookieUtil";
import { showLogoutAlert } from "../utils/logoutModal.jsx";

/**
 * 페이지 이동 시마다 리프레시 토큰 만료를 체크하는 Hook
 * - 액세스 토큰은 API 호출 시 자동 갱신되므로 체크하지 않음
 * - 리프레시 토큰 만료 시에만 사용자에게 로그아웃 모달 표시
 */
const useTokenExpiryChecker = () => {
  const location = useLocation();

  useEffect(() => {
    // 페이지가 변경될 때마다 토큰 체크
    const checkTokenExpiry = () => {
      const memberInfo = getCookie("member");

      if (!memberInfo) {
        // 로그인하지 않은 상태는 체크하지 않음
        return;
      }

      let parsedMemberInfo;
      try {
        parsedMemberInfo =
          typeof memberInfo === "string" ? JSON.parse(memberInfo) : memberInfo;
      } catch (e) {
        console.error("토큰 체크: memberInfo 파싱 실패:", e);
        return;
      }

      const { accessToken, refreshToken } = parsedMemberInfo;

      if (!accessToken || !refreshToken) {
        return;
      } // 리프레시 토큰 만료 체크만 수행 (액세스 토큰은 API 호출 시 자동 갱신됨)
      if (isTokenExpired(refreshToken)) {
        console.log("🚨 페이지 이동 시 리프레시 토큰 만료 감지");
        showLogoutAlert(
          "리프레시 토큰이 만료되었습니다.\n\n다시 로그인해 주세요.",
          () => {
            // 쿠키 삭제
            document.cookie =
              "member=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // 로그인 페이지로 이동
            window.location.href = "/member/login";
          },
          "TOKEN_EXPIRED"
        );
        return;
      }
    };

    // 약간의 지연을 두어 페이지 로딩이 완료된 후 체크
    const timer = setTimeout(checkTokenExpiry, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]); // 경로가 변경될 때마다 실행

  return null;
};

export default useTokenExpiryChecker;
