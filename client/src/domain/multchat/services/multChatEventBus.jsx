// 간단한 이벤트 버스 (싱글톤)
// 방 내부 훅에서 참가자 수 변경을 브로드캐스트하고,
// 리스트 화면에서 이를 수신해 실시간으로 반영하기 위한 용도

const listeners = new Map(); // eventName -> Set(callback)

const on = (eventName, callback) => {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(callback);
  return () => off(eventName, callback);
};

const off = (eventName, callback) => {
  const set = listeners.get(eventName);
  if (!set) return;
  set.delete(callback);
  if (set.size === 0) listeners.delete(eventName);
};

const emit = (eventName, payload) => {
  const set = listeners.get(eventName);
  if (!set) return;
  set.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      // no-op
    }
  });
};

export const MultChatEventBus = { on, off, emit };

// 이벤트 명 상수
export const MultChatEvents = {
  ROOM_PARTICIPANT_COUNT_UPDATE: "ROOM_PARTICIPANT_COUNT_UPDATE",
};
