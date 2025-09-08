import axios from "axios";
import {
  getCookie,
  isTokenExpired,
  setCookie,
} from "../../member/util/cookieUtil";
import { API_SERVER_HOST } from "../api/axios.jsx";

class TokenManager {
  async ensureValidToken() {
    let memberInfo = getCookie("member");
    if (!memberInfo || !memberInfo.accessToken) {
      throw new Error("인증 토큰이 없습니다.");
    }

    // 토큰 만료 확인 및 자동 갱신 시도
    if (isTokenExpired(memberInfo.accessToken)) {
      console.log("🔄 토큰 만료 감지 - 자동 갱신 시도 중...");

      const refreshResult = await this.refreshToken(memberInfo);
      if (refreshResult) {
        console.log("✅ 토큰 갱신 성공");
        memberInfo = getCookie("member"); // 갱신된 토큰 정보 다시 가져오기
      } else {
        throw new Error("토큰 갱신 실패");
      }
    }

    return memberInfo;
  }

  async refreshToken(memberInfo) {
    try {
      const header = {
        headers: { Authorization: `Bearer ${memberInfo.accessToken}` },
      };
      const response = await axios.get(
        `${API_SERVER_HOST}/api/member/refresh?refreshToken=${memberInfo.refreshToken}`,
        header
      );

      // 새로운 토큰 정보로 쿠키 업데이트
      const newTokenData = {
        ...memberInfo,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      };

      setCookie("member", JSON.stringify(newTokenData), 1);
      console.log("🔄 토큰 갱신 완료");
      return true;
    } catch (error) {
      console.error("❌ 토큰 갱신 실패:", error);
      // 토큰 갱신 실패 시 강제 로그아웃 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("forceLogout", {
          detail: { reason: "토큰 갱신 실패" },
        })
      );
      return false;
    }
  }
}

export default new TokenManager();
