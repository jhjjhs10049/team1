import axios from "axios";
import jwtAxios from "../../member/util/JWTUtil";
import { API_SERVER_HOST } from "../../global/api/axios.jsx";

// 공통 prefix
const host = `${API_SERVER_HOST}/api/board`;
const fileHost = `${API_SERVER_HOST}/api/files`;

// 📌 게시판 관련 API

// 목록 (공개 GET)
export const listBoards = async (searchParams, page, size) => {
  // searchParams가 문자열인 경우 (기존 호환성)
  if (typeof searchParams === "string") {
    const res = await axios.get(host, {
      params: { q: searchParams, page, size },
    });
    return res.data; // Page<BoardDto>
  }

  // searchParams가 객체인 경우 (새로운 검색 방식)
  const { keyword, type } = searchParams;
  const params = { page, size };

  if (keyword && keyword.trim()) {
    params.q = keyword.trim();
    params.type = type || "all";
  }

  const res = await axios.get(host, { params });
  return res.data; // Page<BoardDto>
};

// 상세 (공개 GET)
export const getBoardDetail = async (boardId) => {
  const res = await axios.get(`${host}/${boardId}`);
  return res.data; // BoardDetailDto
};

// 조회수 증가 (공개 POST)
export const increaseViewCount = async (boardId) => {
  try {
    const res = await axios.post(`${host}/${boardId}/view`);
    return res.data;
  } catch (error) {
    console.error("조회수 증가 실패:", error);
    // 조회수 증가 실패해도 게시글 조회는 가능하도록 에러를 던지지 않음
    return null;
  }
};

// 생성 (로그인 필요)
export const createBoard = async ({ title, content, images, locationLat, locationLng, locationAddress }) => {
  const res = await jwtAxios.post(host, {
    title,
    content,
    images,
    locationLat,
    locationLng,
    locationAddress
  });
  return res.data; // 성공 시 201 Created
};

// 수정 (로그인 필요)
export const updateBoard = async ({ boardId, title, content, images, locationLat, locationLng, locationAddress }) => {
  const res = await jwtAxios.put(`${host}/${boardId}`, {
    title,
    content,
    images,
    locationLat,
    locationLng,
    locationAddress
  });
  return res.data; // 성공 시 204 No Content
};

// 삭제 (로그인 필요)
export const deleteBoard = async (boardId) => {
  const res = await jwtAxios.delete(`${host}/${boardId}`);
  return res.data;
};

// 이미지 업로드 (로그인 필요)
export const uploadImages = async (files) => {
  const form = new FormData();
  for (let i = 0; i < files.length; i++) {
    form.append("files", files[i]);
  }

  const res = await jwtAxios.post(`${fileHost}/upload`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data; // ["saved-1.jpg", ...]
};

// 이미지 표시 URL
export const imageUrl = (fileName) =>
  `${fileHost}/view/${encodeURIComponent(fileName)}`;

// 📌 댓글(Reply) 관련 API

// 댓글 목록 조회 (페이징) - 인증 불필요
export const getReplies = async (boardId, page = 0, size = 5) => {
  const res = await axios.get(`${host}/${boardId}/replies`, {
    params: { page, size },
  });
  return res.data; // Page<ReplyDto> 형태
};

// 댓글 등록
export const addReply = async (boardId, content) => {
  try {
    const res = await jwtAxios.post(`${host}/${boardId}/replies`, { content });
    return res.data; // 성공 시 201 Created
  } catch (error) {
    console.error("댓글 등록 실패:", error.response?.status);
    throw error;
  }
};

// 댓글 수정
export const updateReply = async (boardId, replyId, content) => {
  try {
    const res = await jwtAxios.put(`${host}/${boardId}/replies/${replyId}`, {
      content,
    });
    return res.data; // 성공 시 204 No Content
  } catch (error) {
    console.error("댓글 수정 실패:", error.response?.status);
    throw error;
  }
};

// 댓글 삭제
export const deleteReply = async (boardId, replyId) => {
  try {
    const res = await jwtAxios.delete(`${host}/${boardId}/replies/${replyId}`);
    return res.data; // 성공 시 204 No Content
  } catch (error) {
    console.error("댓글 삭제 실패:", error.response?.status);
    throw error;
  }
};

// 📌 공지사항 관련 API

// 공지사항 목록 조회 (공개 GET)
export const getNotices = async () => {
  const res = await axios.get(`${host}/notices`);
  return res.data; // List<BoardDto>
};

// 광고 목록 조회 (공개 GET)
export const getAds = async () => {
  const res = await axios.get(`${host}/ads`);
  return res.data; // List<BoardDto>
};

// 메인 페이지용 - 최신 공지사항 1개 조회
export const getLatestNotice = async () => {
  const notices = await getNotices();
  return notices.length > 0 ? notices[0] : null;
};

// 메인 페이지용 - 최신 광고 1개 조회
export const getLatestAd = async () => {
  const ads = await getAds();
  return ads.length > 0 ? ads[0] : null;
};

// 공지사항/광고 생성 (관리자/매니저만 가능)
export const createNotice = async ({
  title,
  content,
  images,
  type = "ANN",
  locationLat,
  locationLng,
  locationAddress,
}) => {
  const res = await jwtAxios.post(`${host}/notice`, {
    title,
    content,
    images,
    type,
    locationLat,
    locationLng,
    locationAddress,
  });
  return res.data; // 성공 시 201 Created
};
