import { Cookies } from "react-cookie";

// 로그인을 유지하거나 애플리케이션의 상태가 변경되는 상황에 대해서는 정상 동작 하지만
// "새로 고침"을 할 경우 애플리케이션의 상태역시 초기화 되는 문제가 발생한다.
// 예 : 로그인 상태 에서 "새로고침(F5)" 을 하게 되면 자동으로 로그아웃이 되는 문제가 생긴다.
// 이문제를 해결하기 위해서 애플리케이션의 상태 데이터를 보관하고
// 애플리케이션이 로딩될 때 저장된 정보들을 로딩 해서 사용해야 한다.
// 그래서 쿠키를 사용합니다.
const cookies = new Cookies();
/**
 * 쿠키 설정 (유지기간: days일)
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {number} days - 유지 기간(일)
 */
export const setCookie = (name, value, days = 1) => {
  const maxAge = days * 24 * 60 * 60; // 일 → 초 단위 변환
  return cookies.set(name, value, {
    path: "/", // 사이트 전체에서 사용
    maxAge, // 초 단위 유지기간
  });
};
export const getCookie = (name) => {
  return cookies.get(name);
};

// JWT 토큰 만료 시간 확인 함수
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // JWT 토큰의 payload 부분 디코딩
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)

    // exp (만료 시간)과 현재 시간 비교
    return payload.exp < currentTime;
  } catch (error) {
    console.error("토큰 디코딩 오류:", error);
    return true; // 디코딩 실패 시 만료된 것으로 처리
  }
};

// 토큰 만료까지 남은 시간 (초 단위)
export const getTokenTimeToExpiry = (token) => {
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    console.error("토큰 디코딩 오류:", error);
    return 0;
  }
};

export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
};
