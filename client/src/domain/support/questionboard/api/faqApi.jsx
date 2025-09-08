import axios from "axios";
import jwtAxios from "../../../member/util/JWTUtil";
import { API_SERVER_HOST } from "../../../global/api/axios.jsx";

// 공통 prefix
const host = `${API_SERVER_HOST}/api/support/faq`;

// 📌 FAQ 관련 API

// FAQ 전체 목록 조회 (공개)
export const getAllFAQs = async () => {
  const res = await axios.get(`${host}/all`);
  return res.data; // List<QuestionBoardDTO>
};

// FAQ 목록 조회 (페이징, 공개)
export const getFAQList = async (page = 0, size = 10, keyword = null) => {
  const params = { page, size };
  if (keyword && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  const res = await axios.get(host, { params });
  return res.data; // Page<QuestionBoardDTO>
};

// FAQ 개별 조회 (공개)
export const getFAQDetail = async (no) => {
  const res = await axios.get(`${host}/${no}`);
  return res.data; // QuestionBoardDTO
};

// FAQ 등록 (관리자용)
export const createFAQ = async ({ question, answer }) => {
  const res = await jwtAxios.post(host, { question, answer });
  return res.data; // 성공 시 201 Created
};

// FAQ 수정 (관리자용)
export const updateFAQ = async ({ no, question, answer }) => {
  const res = await jwtAxios.put(`${host}/${no}`, { question, answer });
  return res.data; // 성공 시 204 No Content
};

// FAQ 삭제 (관리자용)
export const deleteFAQ = async (no) => {
  const res = await jwtAxios.delete(`${host}/${no}`);
  return res.data; // 성공 시 204 No Content
};
