import api, { API_SERVER_HOST } from "../../../global/api/axios";
const prefix = `${API_SERVER_HOST}/api/support/chat-room`;

// 사전 질문으로부터 채팅방 생성
export const createChatRoomFromQuestion = async (questionData) => {
  const res = await api.post(`${prefix}/create-from-question`, questionData);
  return res.data;
};

// 회원의 활성화된 채팅방 조회
export const getActiveChatRoom = async () => {
  const res = await api.get(`${prefix}/active`);
  return res.data;
};

// 회원의 모든 채팅방 목록 조회
export const getMyChatRooms = async () => {
  const res = await api.get(`${prefix}/my`);
  return res.data;
};

// 채팅방 상세 조회
export const getChatRoomById = async (chatRoomNo) => {
  console.log("🔍 채팅방 상세 조회 API 호출:", chatRoomNo);
  const res = await api.get(`${prefix}/${chatRoomNo}`);
  console.log("📥 채팅방 상세 조회 응답:", res.data);
  return res.data;
};

// 채팅방 삭제
export const deleteChatRoom = async (chatRoomNo) => {
  const res = await api.delete(`${prefix}/${chatRoomNo}`);
  return res.data;
};

// === 관리자용 API ===

// 대기중인 채팅방 목록 조회 (관리자용)
export const getWaitingChatRooms = async () => {
  const res = await api.get(`${prefix}/admin/waiting`);
  return res.data;
};

// 진행중인 채팅방 목록 조회 (관리자용)
export const getActiveChatRooms = async () => {
  const res = await api.get(`${prefix}/admin/active`);
  return res.data;
};

// 관리자가 담당하는 채팅방 목록 조회
export const getAdminChatRooms = async () => {
  const res = await api.get(`${prefix}/admin/my`);
  return res.data;
};

// 관리자가 채팅방에 입장하여 채팅 시작
export const startChat = async (chatRoomNo) => {
  const res = await api.post(`${prefix}/${chatRoomNo}/start`);
  return res.data;
};

// 채팅방 종료
export const endChat = async (chatRoomNo) => {
  const res = await api.post(`${prefix}/${chatRoomNo}/end`);
  return res.data;
};

// 모든 채팅방 목록 조회 (관리자용 - 대기 + 진행 중)
export const getChatRooms = async () => {
  try {
    const [waitingResponse, activeResponse] = await Promise.all([
      api.get(`${prefix}/admin/waiting`),
      api.get(`${prefix}/admin/active`),
    ]);

    const allChatRooms = [...waitingResponse.data, ...activeResponse.data];

    return { data: allChatRooms };
  } catch (error) {
    console.error("채팅방 목록 조회 오류:", error);
    throw error;
  }
};

// 관리자가 채팅방에 참여 (별칭)
export const joinChatRoomAsAdmin = async (chatRoomNo) => {
  return await startChat(chatRoomNo);
};
