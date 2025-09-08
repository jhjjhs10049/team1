import { useEffect } from "react";
import { getCookie, isTokenExpired } from "../../domain/member/util/cookieUtil";
import { showLogoutAlert } from "../utils/logoutModal.jsx";

/**
 * 브라우저 네비게이션 이벤트를 감지하여 리프레시 토큰 만료 체크
 * - React Router 네비게이션, 뒤로가기/앞으로가기 등을 감지
 * - 액세스 토큰은 API 호출 시 자동 갱신되므로 체크하지 않음
 */
const useNavigationTokenChecker = () => {
  useEffect(() => {
    const checkTokenOnNavigation = () => {
      const memberInfo = getCookie("member");

      if (!memberInfo) return;

      let parsedMemberInfo;
      try {
        parsedMemberInfo =
          typeof memberInfo === "string" ? JSON.parse(memberInfo) : memberInfo;
      } catch {
        return;
      }

      const { refreshToken } = parsedMemberInfo;
      if (!refreshToken) return;

      // 리프레시 토큰 만료 체크
      if (isTokenExpired(refreshToken)) {
        console.log("🚨 브라우저 네비게이션 시 리프레시 토큰 만료 감지");
        showLogoutAlert(
          "리프레시 토큰이 만료되었습니다.\n\n다시 로그인해 주세요.",
          () => {
            document.cookie =
              "member=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/member/login";
          },
          "TOKEN_EXPIRED"
        );
      }
    };

    // popstate 이벤트 (뒤로가기/앞으로가기)
    window.addEventListener("popstate", checkTokenOnNavigation);

    // pushstate/replacestate 가로채기 (React Router 네비게이션)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      setTimeout(checkTokenOnNavigation, 50);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      setTimeout(checkTokenOnNavigation, 50);
    };

    return () => {
      window.removeEventListener("popstate", checkTokenOnNavigation);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null;
};

export default useNavigationTokenChecker;
