import axios from "axios";
import { API_SERVER_HOST } from "../../global/api/axios.jsx";

const rest_api_key = import.meta.env.VITE_KAKAO_REST_KEY;
const redirect_uri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;

const access_token_url = `https://kauth.kakao.com/oauth/token`;

export const getKakaoLoginLink = () => {
  //REST 키 값, 로그인 후 이동할 RedirectURI 정보 를 가지는 링크를 저장한다.
  const kakaoURL = `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;

  return kakaoURL; // 카카오 로그인 페이지로 이동한다
};

export const getAccessToken = async (authCode) => {
  // authCode : 카카오 에서 전송해준 '인가 코드'
  console.log("getAccessToken 호출 - authCode:", authCode);
  console.log("REST API Key:", rest_api_key);
  console.log("Redirect URI:", redirect_uri);

  const header = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const params = {
    grant_type: "authorization_code",
    client_id: rest_api_key,
    redirect_uri: redirect_uri,
    code: authCode,
  };

  console.log("카카오 토큰 요청 파라미터:", params);

  try {
    //Access Token 을 서버에서 받아온다.
    const res = await axios.post(access_token_url, params, header);
    console.log("카카오 토큰 응답:", res.data);

    const accessToken = res.data.access_token;
    console.log("발급받은 Access Token:", accessToken);

    return accessToken;
  } catch (error) {
    console.error("카카오 토큰 발급 오류:", error);
    console.error("오류 응답:", error.response?.data);
    throw error;
  }
};

/*******************************************************
 *  [React]
        ↓ 카카오 로그인 요청
    [카카오 서버]
        ↓ 인가코드 전달
    [React]
        ↓ 인가코드 → API 서버
    [API 서버]
        ↓ 인가코드 → 카카오 서버 (accessToken 요청)
    [카카오 서버]
        ↓ accessToken 반환
    [API 서버]
        ↓ accessToken → 카카오 서버 (사용자 정보 요청)
    [카카오 서버]
        ↓ 사용자 정보 반환
    [API 서버]
        ↓ 사용자 정보 → 프론트 or 리다이렉트
 *******************************************************/

export const getMemberWithAccessToken = async (accessToken) => {
  const res = await axios.get(
    `${API_SERVER_HOST}/api/member/kakao?accessToken=${accessToken}`
  );
  /*
    const res = await axios.get(`${API_SERVER_HOST}/api/member/kakao`, {
        headers : {
            Authorization : `Bearer ${accessToken}`
        }
    });
    */
  return res.data;
};
