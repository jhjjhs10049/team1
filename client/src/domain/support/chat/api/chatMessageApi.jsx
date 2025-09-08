import api, { API_SERVER_HOST } from "../../../global/api/axios";
const prefix = `${API_SERVER_HOST}/api/support/chat-message`;

// 메시지 전송
export const sendMessage = async (messageData) => {
  const res = await api.post(`${prefix}/send`, messageData);
  return res.data;
};

// 채팅방의 모든 메시지 조회
export const getMessagesByChatRoom = async (chatRoomNo) => {
  const res = await api.get(`${prefix}/room/${chatRoomNo}`);
  return res.data;
};

// 채팅방의 읽지 않은 메시지 수 조회
export const getUnreadMessageCount = async (chatRoomNo) => {
  const res = await api.get(`${prefix}/room/${chatRoomNo}/unread-count`);
  return res.data;
};

// 메시지 읽음 처리
export const markMessagesAsRead = async (chatRoomNo) => {
  const res = await api.post(`${prefix}/room/${chatRoomNo}/mark-as-read`);
  return res.data;
};

// 메시지 삭제
export const deleteMessage = async (messageNo) => {
  const res = await api.delete(`${prefix}/${messageNo}`);
  return res.data;
};

// 시스템 메시지 전송 (관리자만)
export const sendSystemMessage = async (systemMessageData) => {
  const res = await api.post(`${prefix}/system`, systemMessageData);
  return res.data;
};
