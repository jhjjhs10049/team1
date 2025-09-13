// 웹소켓 목적지 상수 정의
export const WEBSOCKET_DESTINATIONS = {
  // Topic (브로드캐스트) - 1:N 전달
  TOPIC: {
    ADMIN_STATUS: "/topic/chat/admin/status", // 관리자 전체 알림
    ONLINE_USERS: "/topic/onlineUsers", // 온라인 사용자 목록
    PUBLIC: "/topic/public", // 공개 채널

    // 단체채팅 관련 Topic
    MULT_CHAT_ROOM_STATUS: "/topic/multchat/room/status", // 전체 단체채팅방 상태 변경
    MULT_CHAT_ROOM: (roomNo) => `/topic/multchat/room/${roomNo}`, // 특정 단체채팅방 메시지
    MULT_CHAT_ROOM_NOTIFICATION: (roomNo) =>
      `/topic/multchat/room/${roomNo}/notification`, // 특정 단체채팅방 알림
    MULT_CHAT_ROOMS_UPDATES: "/topic/multchat/rooms/updates", // 전체 채팅방 리스트 업데이트
  },

  // Queue (점대점) - 1:1 전달
  QUEUE: {
    CHAT_MESSAGE: (roomNo) => `/queue/chat/${roomNo}`, // 개별 채팅 메시지
    CHAT_STATUS: (roomNo) => `/queue/chat/${roomNo}/status`, // 개별 채팅방 상태
    MEMBER_LOGOUT: (memberNo) => `/queue/member/${memberNo}/logout`, // 개별 회원 강제 로그아웃

    // 단체채팅 개인 알림
    MULT_CHAT_PERSONAL: (memberNo) => `/queue/multchat/member/${memberNo}`, // 단체채팅 개인 알림
  },
};

// 사용 용도별 구분
export const DESTINATION_PURPOSE = {
  // 브로드캐스트: 모든 구독자가 동일한 메시지 수신
  BROADCAST: "TOPIC",

  // 개별 전달: 한 명씩 순차적으로 메시지 수신 (라운드로빈)
  INDIVIDUAL: "QUEUE",
};
