import axios from "axios";

const API_SERVER_HOST = "http://localhost:8022";

const prefix = `${API_SERVER_HOST}/api/admin/chat`;

// 채팅방 목록 조회
export const getChatRoomList = async (pageParam) => {
  const { page, size } = pageParam;
  const res = await axios.get(`${prefix}/list`, {
    params: { page, size },
  });
  return res.data;
};

// 상태별 채팅방 조회
export const getChatRoomListByStatus = async (pageParam, status) => {
  const { page, size } = pageParam;
  const res = await axios.get(`${prefix}/list/${status}`, {
    params: { page, size },
  });
  return res.data;
};

// 채팅방 상태 변경
export const updateChatRoomStatus = async (chatRoomId, status) => {
  const res = await axios.put(`${prefix}/${chatRoomId}/status`, status, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

// 채팅방 삭제
export const deleteChatRoom = async (chatRoomId) => {
  const res = await axios.delete(`${prefix}/${chatRoomId}`);
  return res.data;
};

// 이메일로 검색
export const searchChatRoomByEmail = async (pageParam, email) => {
  const { page, size } = pageParam;
  const res = await axios.get(`${prefix}/search`, {
    params: { page, size, email },
  });
  return res.data;
};
