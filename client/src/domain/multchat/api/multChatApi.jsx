import jwtAxios from "../../member/util/JWTUtil";

const prefix = "/api/multchat";

// ===== 채팅방 관리 API =====

// 공개 채팅방 목록 조회
export const getPublicChatRooms = async (page = 0, size = 20) => {
  const res = await jwtAxios.get(`${prefix}/rooms`, {
    params: { page, size },
  });
  return res.data;
};

// 인기 채팅방 목록 조회
export const getPopularChatRooms = async (page = 0, size = 10) => {
  const res = await jwtAxios.get(`${prefix}/rooms/popular`, {
    params: { page, size },
  });
  return res.data;
};

// 최근 활성화된 채팅방 목록 조회
export const getRecentActiveChatRooms = async (page = 0, size = 10) => {
  const res = await jwtAxios.get(`${prefix}/rooms/recent`, {
    params: { page, size },
  });
  return res.data;
};

// 채팅방 검색
export const searchChatRooms = async (keyword, page = 0, size = 20) => {
  const res = await jwtAxios.get(`${prefix}/rooms/search`, {
    params: { keyword, page, size },
  });
  return res.data;
};

// 내가 참가 중인 채팅방 목록 조회
export const getMyChatRooms = async () => {
  const res = await jwtAxios.get(`${prefix}/rooms/my`);
  return res.data;
};

// 내가 만든 채팅방 목록 조회
export const getMyCreatedChatRooms = async () => {
  const res = await jwtAxios.get(`${prefix}/rooms/created`);
  return res.data;
};

// 채팅방 상세 조회
export const getChatRoomDetail = async (roomNo) => {
  const res = await jwtAxios.get(`${prefix}/rooms/${roomNo}`);
  return res.data;
};

// 채팅방 생성
export const createChatRoom = async (roomData) => {
  const res = await jwtAxios.post(`${prefix}/rooms`, roomData);
  return res.data;
};

// 채팅방 참가
export const joinChatRoom = async (roomNo, password = null) => {
  const requestData = password ? { password } : {};
  const res = await jwtAxios.post(
    `${prefix}/rooms/${roomNo}/join`,
    requestData
  );
  return res.data;
};

// 채팅방 나가기
export const leaveChatRoom = async (roomNo) => {
  const res = await jwtAxios.post(`${prefix}/rooms/${roomNo}/leave`);
  return res.data;
};

// 채팅방 설정 수정
export const updateChatRoom = async (roomNo, updateData) => {
  const res = await jwtAxios.put(`${prefix}/rooms/${roomNo}`, updateData);
  return res.data;
};

// 채팅방 삭제
export const deleteChatRoom = async (roomNo) => {
  const res = await jwtAxios.delete(`${prefix}/rooms/${roomNo}`);
  return res.data;
};

// ===== 메시지 관리 API =====

// 채팅방 메시지 목록 조회
export const getChatMessages = async (roomNo, page = 0, size = 50) => {
  const res = await jwtAxios.get(`${prefix}/rooms/${roomNo}/messages`, {
    params: { page, size },
  });
  return res.data;
};

// 채팅방 최근 메시지 조회
export const getRecentMessages = async (roomNo, limit = 50) => {
  const res = await jwtAxios.get(`${prefix}/rooms/${roomNo}/messages/recent`, {
    params: { limit },
  });
  return res.data;
};

// 읽지 않은 메시지 수 조회
export const getUnreadMessageCount = async (roomNo) => {
  const res = await jwtAxios.get(
    `${prefix}/rooms/${roomNo}/messages/unread-count`
  );
  return res.data;
};

// 메시지 읽음 처리
export const markMessagesAsRead = async (roomNo) => {
  const res = await jwtAxios.post(
    `${prefix}/rooms/${roomNo}/messages/mark-read`
  );
  return res.data;
};

// 메시지 삭제
export const deleteMessage = async (messageNo) => {
  const res = await jwtAxios.delete(`${prefix}/messages/${messageNo}`);
  return res.data;
};

// ===== 참가자 관리 API =====

// 채팅방 참가자 목록 조회
export const getChatRoomParticipants = async (roomNo) => {
  const res = await jwtAxios.get(`${prefix}/rooms/${roomNo}/participants`);
  return res.data;
};

// 참가자 강퇴
export const kickParticipant = async (roomNo, targetMemberNo) => {
  const res = await jwtAxios.post(
    `${prefix}/rooms/${roomNo}/participants/${targetMemberNo}/kick`
  );
  return res.data;
};

// 참가자 권한 변경
export const changeParticipantRole = async (roomNo, targetMemberNo, role) => {
  const res = await jwtAxios.put(
    `${prefix}/rooms/${roomNo}/participants/${targetMemberNo}/role`,
    {
      role,
    }
  );
  return res.data;
};

// 채팅방 참가 상태 확인
export const getParticipationStatus = async (roomNo) => {
  const res = await jwtAxios.get(`${prefix}/rooms/${roomNo}/participation-status`);
  return res.data;
};

// multChatApi 객체로 묶어서 export
export const multChatApi = {
  // 채팅방 관리
  getPublicChatRooms,
  getPopularChatRooms,
  getRecentActiveChatRooms,
  searchChatRooms,
  getMyChatRooms,
  getMyCreatedChatRooms,
  getChatRoom: getChatRoomDetail,
  createChatRoom,
  joinChatRoom,
  leaveChatRoom,
  updateChatRoom,
  deleteChatRoom,

  // 메시지 관리
  getChatMessages,
  getRecentMessages,
  getUnreadMessageCount,
  markMessagesAsRead,
  deleteMessage,

  // 참가자 관리
  getChatRoomParticipants,
  kickParticipant,
  changeParticipantRole,

  // 참가 상태 확인
  getParticipationStatus,
};
