import axios from "axios";
import { getCookie, setCookie } from "./cookieUtil";
import { API_SERVER_HOST } from "../../global/api/axios.jsx";
import { showLogoutAlert } from "../../../common/utils/logoutModal.jsx";

/*****************************************************************************************************
 * 최초 로그인시 -> 액세트 토큰 과 리프레쉬 토큰을 을 서버로 부터 전송 받아서 쿠키에 저장
 * 액세스 토큰이 만료 된 경우 -> 클라이언트가 리프레쉬 토큰을 서버에 보내서 새로운 액세스 토큰을 요청하고 전송받는다.
 * 리프레쉬 토큰도 만료된 경우 -> 로그인 페이지로 리다이렉트 한다.
 *****************************************************************************************************/

/***************************************************************************************************************
 * API 호출에서 JWT 토큰을 처리하는 유틸리티
 * jwtAxios는 axios에 토큰 처리 기능이 추가된 인스턴스입니다.
 * 코드의 흐름을 살펴보자.
 * API 함수가 호출되었을 때 jwtAxios.get을 바로 실행하는게 아니라 인터셉터가 먼저 실행된다.
 * jwtAxios.interceptors.request.use( beforeReq, requestFail) 가 먼저 실행 되는 것이다.
 * 매개변수인 beforeReq , requestFail 함수가 호출된다.
 * 그런데 requestFail 는 오류가 발생 했을때만 호출된다.
 * 정상일때 config를 리턴 해준다.
 * 그런데 매개변수 뿐만 아니라 리턴으로도 사용되고 있는 config 는 어떤 객체일까?
 * config ?
 * config는 Axios 요청을 설정할 때 사용하는 옵션들을 담고 있는 객체로, 아래와 같은 주요 속성을 포함합니다
 * url, method (예: get, post)
 * baseURL, headers, params, data
 * timeout, withCredentials, responseType 등 다양한 설정이 가능합니다.
 * 정상처리가 되었다면
 * 수정된 config 객체를 반환하고
 * jwtAxios.interceptors.response.use(beforeRes, responseFail)  를 수행합니다.
 * 이후에 원래 수행 하려고 했던 getOne 혹은 getList가 수행 됩니다.
 ****************************************************************************************************************/

const jwtAxios = axios.create({
  baseURL: API_SERVER_HOST, // baseURL 설정 추가
});

const refreshJWT = async (accessToken, refreshToken) => {
  // Access Token이 만료된 경우 Refresh Token을 활용해서 새로운 토큰 요청
  const host = API_SERVER_HOST;
  const header = { headers: { Authorization: `Bearer ${accessToken}` } };

  try {
    const res = await axios.get(
      `${host}/api/member/refresh?refreshToken=${refreshToken}`,
      header
    );
    return res.data;
  } catch (error) {
    // 리프레시 토큰 만료 감지
    if (
      error.response?.status === 401 ||
      error.response?.data?.error === "REFRESH_TOKEN_EXPIRED"
    ) {
      console.log("🚨 리프레시 토큰 만료 감지 - 직접 모달 표시");
      // 직접 모달 표시 (페이지 이동 시에도 동작)
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
    }
    throw error; // 에러를 다시 던져서 catch 블록에서 처리되도록 함
  }
};

//before request
const beforeReq = (config) => {
  console.log(
    `🔍 JWT 인터셉터 시작: ${config.method?.toUpperCase()} ${config.url}`
  );

  const memberInfo = getCookie("member");

  if (!memberInfo) {
    console.error("JWT 인터셉터: 쿠키에 member 정보가 없음");
    return Promise.reject({
      response: { data: { error: "REQUIRE_LOGIN" } },
    });
  }

  console.log("🍪 쿠키에서 member 정보 추출:", typeof memberInfo);

  // memberInfo가 문자열인지 객체인지 확인
  let parsedMemberInfo;
  if (typeof memberInfo === "string") {
    try {
      parsedMemberInfo = JSON.parse(memberInfo);
    } catch (e) {
      console.error("JWT 인터셉터: memberInfo 파싱 실패:", e);
      return Promise.reject({
        response: { data: { error: "INVALID_MEMBER_INFO" } },
      });
    }
  } else {
    parsedMemberInfo = memberInfo;
  }

  const { accessToken } = parsedMemberInfo;

  if (!accessToken) {
    console.error("JWT 인터셉터: accessToken이 없음");
    console.log("🔍 parsedMemberInfo:", parsedMemberInfo);
    return Promise.reject({
      response: { data: { error: "NO_ACCESS_TOKEN" } },
    });
  }

  console.log(`✅ JWT 토큰 추가: Bearer ${accessToken.substring(0, 20)}...`);
  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
};

//fail request
const requestFail = (err) => {
  return Promise.reject(err);
};

//before return response
const beforeRes = async (res) => {
  const data = res.data;
  if (data && data.error === "ERROR_ACCESS_TOKEN") {
    const memberCookieValue = getCookie("member");

    if (!memberCookieValue) {
      console.error("JWT 응답 인터셉터: 쿠키에 member 정보가 없음");
      return Promise.reject({
        response: { data: { error: "REQUIRE_LOGIN" } },
      });
    }

    // memberInfo가 문자열인지 객체인지 확인
    let parsedMemberInfo;
    if (typeof memberCookieValue === "string") {
      try {
        parsedMemberInfo = JSON.parse(memberCookieValue);
      } catch (e) {
        console.error("JWT 응답 인터셉터: memberInfo 파싱 실패:", e);
        return Promise.reject({
          response: { data: { error: "INVALID_MEMBER_INFO" } },
        });
      }
    } else {
      parsedMemberInfo = memberCookieValue;
    }

    if (!parsedMemberInfo.accessToken || !parsedMemberInfo.refreshToken) {
      console.error("JWT 응답 인터셉터: 토큰이 없음");
      return Promise.reject({
        response: { data: { error: "NO_TOKENS" } },
      });
    }
    try {
      // accessToken와 refreshToken을 서버로 전송해서 새로운 토큰을 받아온다.
      console.log("🔄 리프레시 토큰으로 새 액세스 토큰 요청 중...");
      const result = await refreshJWT(
        parsedMemberInfo.accessToken,
        parsedMemberInfo.refreshToken
      );

      console.log("✅ 토큰 갱신 성공");
      parsedMemberInfo.accessToken = result.accessToken;
      parsedMemberInfo.refreshToken = result.refreshToken;

      setCookie("member", JSON.stringify(parsedMemberInfo), 1);

      // 원래의 호출을 새로운 토큰으로 재시도
      const originalResult = res.config;
      originalResult.headers.Authorization = `Bearer ${result.accessToken}`;

      return await axios(originalResult);
    } catch (refreshError) {
      console.error("❌ 리프레시 토큰 갱신 실패:", refreshError);
      console.log("📊 리프레시 에러 상세:", {
        status: refreshError.response?.status,
        error: refreshError.response?.data?.error,
        url: refreshError.config?.url,
      }); // 🔥 리프레시 토큰도 만료된 경우에만 로그아웃 처리
      if (
        refreshError.response?.status === 401 ||
        refreshError.response?.data?.error === "REFRESH_TOKEN_EXPIRED"
      ) {
        console.log(
          "🚨 beforeRes에서 리프레시 토큰 만료 감지 - 직접 모달 표시"
        );
        // 직접 모달 표시 (페이지 이동 시에도 동작)
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
      }

      return Promise.reject(refreshError);
    }
  }

  return res;
};

//fail response
const responseFail = (err) => {
  console.error("🚨 JWT 응답 실패:", {
    url: err.config?.url,
    method: err.config?.method,
    status: err.response?.status,
    statusText: err.response?.statusText,
    data: err.response?.data,
  });

  // 중요한 에러만 로깅
  if (err.response?.status === 401) {
    console.error("인증 실패:", err.config?.url); // 리프레시 토큰 관련 401 에러인 경우 강제 로그아웃 처리
    if (
      err.response?.data?.error === "REFRESH_TOKEN_EXPIRED" ||
      err.config?.url?.includes("/api/member/refresh")
    ) {
      console.log("🚨 responseFail에서 리프레시 토큰 만료 감지");
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
    }
  } else if (err.response?.status >= 500) {
    console.error("서버 에러:", err.response?.status, err.config?.url);
  }

  return Promise.reject(err);
};

//인터셉터를 사용해서 JWT 관련 요청과 응답을 처리
jwtAxios.interceptors.request.use(beforeReq, requestFail);
jwtAxios.interceptors.response.use(beforeRes, responseFail);

export default jwtAxios;
