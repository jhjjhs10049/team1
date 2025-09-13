import axios from "axios";
import { API_SERVER_HOST } from "../../global/api/axios.jsx";
import jwtAxios from "../util/JWTUtil";

const host = `${API_SERVER_HOST}/api/member`;
const authHost = `${API_SERVER_HOST}/api/auth`;

export const loginPost = async (loginParam) => {
  //x-www-form-urlencoded : 주로 HTML 폼 데이터를 서버에 전송할 때 사용되는 MIME 타입.
  //post 또는 put 방식에서 사용. HTML 폼의 기본 인코딩 방식
  //application/json: 데이터를 JSON 형식 문자열로 전송 (주로 REST API에서 사용됨)
  const header = {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  };
  const params = new URLSearchParams();
  params.append("username", loginParam.email);
  params.append("password", loginParam.pw);
  try {
    const res = await axios.post(`${host}/login`, params, header);
    return res.data;
  } catch (error) {
    // 403 에러이고 정지된 회원인 경우
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data.error === "MEMBER_BANNED"
    ) {
      const bannedError = {
        name: "BannedMemberError",
        message: "MEMBER_BANNED",
        banInfo: error.response.data.banInfo,
        serverMessage: error.response.data.message,
        isBannedMember: true,
      };

      throw bannedError;
    }

    // 다른 에러는 그대로 throw
    throw error;
  }
};

export const joinPost = async (joinParam) => {
  const header = { headers: { "Content-Type": "application/json" } };

  const res = await axios.post(`${host}/join`, joinParam, header);

  return res.data;
};

export const modifyMember = async (member) => {
  const res = await jwtAxios.put(`${host}/modify`, member);
  return res.data;
};

export const checkNickname = async (nickname) => {
  const res = await axios.get(
    `${host}/check-nickname?nickname=${encodeURIComponent(nickname)}`
  );
  return res.data;
};

export const checkEmail = async (email) => {
  const res = await axios.get(
    `${host}/check-email?email=${encodeURIComponent(email)}`
  );
  return res.data;
};

export const getMyPage = async (email) => {
  const res = await jwtAxios.get(
    `${host}/mypage?email=${encodeURIComponent(email)}`
  );
  return res.data;
};

export const updateMyPage = async (memberData) => {
  const header = { headers: { "Content-Type": "application/json" } };
  const res = await jwtAxios.put(`${host}/mypage`, memberData, header);
  return res.data;
};

export const verifyPassword = async (email, password) => {
  const header = { headers: { "Content-Type": "application/json" } };
  const res = await jwtAxios.post(
    `${host}/verify-password`,
    { email, password },
    header
  );
  return res.data;
};

export const withdrawMember = async (email) => {
  const res = await jwtAxios.delete(
    `${host}/withdraw?email=${encodeURIComponent(email)}`
  );
  return res.data;
};

// 이메일 인증 관련 API
export const sendVerificationCode = async (email) => {
  const res = await axios.post(
    `${authHost}/send-code?email=${encodeURIComponent(email)}`
  );
  return res.data;
};

export const verifyEmailCode = async (email, code) => {
  const res = await axios.post(
    `${authHost}/verify-code?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}`
  );
  return res.data;
};

export const checkVerificationStatus = async (email) => {
  const res = await axios.get(
    `${authHost}/verify-status?email=${encodeURIComponent(email)}`
  );
  return res.data;
};

// 비밀번호 재설정 관련 API
export const sendPasswordResetCode = async (email) => {
  const res = await axios.post(
    `${API_SERVER_HOST}/api/password-reset/send-code?email=${encodeURIComponent(
      email
    )}`
  );
  return res.data;
};

export const verifyPasswordResetCode = async (email, code) => {
  const res = await axios.post(
    `${API_SERVER_HOST}/api/password-reset/verify-code?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}`
  );
  return res.data;
};

export const resetPassword = async (email, code, newPassword) => {
  const res = await axios.post(
    `${API_SERVER_HOST}/api/password-reset/reset-password?email=${encodeURIComponent(
      email
    )}&code=${encodeURIComponent(code)}&newPassword=${encodeURIComponent(
      newPassword
    )}`
  );
  return res.data;
};
