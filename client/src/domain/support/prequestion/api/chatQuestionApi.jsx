import jwtAxios from "../../../member/util/JWTUtil";
import { API_SERVER_HOST } from "../../../global/api/axios.jsx";

// 공통 prefix
const host = `${API_SERVER_HOST}/api/support/chat-question`;

// 📌 채팅 질문 관련 API

// 채팅 질문 등록 (로그인 필요)
export const createChatQuestion = async (chatQuestionData) => {
  const response = await jwtAxios.post(`${host}`, chatQuestionData);
  return response.data;
};

// 모든 채팅 질문 조회 (관리자용)
export const getAllChatQuestions = async () => {
  const response = await jwtAxios.get(`${host}/all`);
  return response.data;
};

// 채팅 질문 목록 조회 (페이징, 관리자용)
export const getChatQuestionList = async (
  page = 0,
  size = 10,
  sortBy = "no",
  sortDir = "desc"
) => {
  const response = await jwtAxios.get(`${host}`, {
    params: { page, size, sortBy, sortDir },
  });
  return response.data;
};

// 특정 채팅 질문 조회
export const getChatQuestion = async (no) => {
  const response = await jwtAxios.get(`${host}/${no}`);
  return response.data;
};

// 내 채팅 질문 조회
export const getMyChatQuestions = async () => {
  const response = await jwtAxios.get(`${host}/my`);
  return response.data;
};

// 상태별 채팅 질문 조회 (관리자용)
export const getChatQuestionsByStatus = async (status) => {
  const response = await jwtAxios.get(`${host}/status/${status}`);
  return response.data;
};

// 채팅 질문 검색 (관리자용)
export const searchChatQuestions = async (keyword, page = 0, size = 10) => {
  const response = await jwtAxios.get(`${host}/search`, {
    params: { keyword, page, size },
  });
  return response.data;
};

// 채팅 질문 상태 변경 (관리자용)
export const updateChatQuestionStatus = async (no, status) => {
  const response = await jwtAxios.put(`${host}/${no}/status`, { status });
  return response.data;
};

// 채팅 질문 삭제 (관리자용)
export const deleteChatQuestion = async (no) => {
  const response = await jwtAxios.delete(`${host}/${no}`);
  return response.data;
};
