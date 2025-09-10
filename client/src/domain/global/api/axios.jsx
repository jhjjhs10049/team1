import axios from "axios";
import { getCookie } from "../../member/util/cookieUtil";

export const API_SERVER_HOST = "http://localhost:8022";

const api = axios.create({
  baseURL: API_SERVER_HOST, // 백엔드 주소
  withCredentials: true,
});

// 요청 인터셉터: 모든 요청에 JWT 토큰을 자동으로 추가
api.interceptors.request.use(
  (config) => {
    const memberInfo = getCookie("member");
    console.log("🔍 Request interceptor - memberInfo:", memberInfo);

    if (memberInfo && memberInfo.accessToken) {
      config.headers.Authorization = `Bearer ${memberInfo.accessToken}`;
      console.log(
        "✅ Authorization header added:",
        config.headers.Authorization
      );
    } else {
      console.log("❌ No accessToken found in memberInfo");
    }

    console.log("📤 API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리 및 로깅
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 로깅
    if (error.response) {
      console.error(`❌ API Error [${error.response.status}]:`, {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response.status,
        data: error.response.data,
      });

      // 에러 메시지 정리
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }
    } else if (error.request) {
      console.error("❌ Network Error:", error.message);
    } else {
      console.error("❌ Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
