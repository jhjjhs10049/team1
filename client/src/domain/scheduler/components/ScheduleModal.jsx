import React, { useState } from "react";
import Modal from "./Modal";

const getClock = (isoString) => {
  if (!isoString) return "";
  try {
    // ISO 문자열을 Date 객체로 변환한 후 시간 추출
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("시간 파싱 오류:", error);
    return "";
  }
};

const ScheduleModal = ({ item, onClose, onSave }) => {
  console.log("ScheduleModal에 전달된 item:", item); // 디버깅용 로그 추가

  const [form, setForm] = useState({
    scheduleNo: item.scheduleNo || item.id, // 서버 필드명에 맞춰 수정
    date: item.date, // 유지
    title: item.title ?? "",
    startClock: getClock(item.startTime), // "HH:MM"
    endClock: getClock(item.endTime), // "HH:MM"
    gym: item.gym ?? "",
    trainer: item.trainerName ?? "", // trainerName 필드 사용
    color: item.color ?? "bg-teal-500",
    completed: !!item.completed, // ✅ 완료 여부 토글
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const buildPayload = (overrides = {}) => {
    const completed = overrides.completed ?? form.completed;

    // 완료 상태만 변경하는 경우, 기존 데이터 유지
    if ("completed" in overrides && Object.keys(overrides).length === 1) {
      const payload = {
        scheduleNo: form.scheduleNo,
        date: item.date, // 원본 데이터 유지
        title: item.title, // 원본 데이터 유지
        startTime: item.startTime, // 원본 시간 유지
        endTime: item.endTime, // 원본 시간 유지
        gym: item.gym, // 원본 데이터 유지
        trainerName: item.trainerName || null, // 원본 데이터 유지
        color: item.color, // 원본 데이터 유지
        completed, // 완료 상태만 변경
      };

      console.log("완료 상태 변경용 payload (기존 시간 유지):", payload);
      return payload;
    }

    // 일반 수정의 경우 기존 로직 유지
    const startOK = /^\d{2}:\d{2}$/.test(form.startClock);
    const endOK = /^\d{2}:\d{2}$/.test(form.endClock);
    if (!form.title.trim()) {
      alert("제목을 입력하세요.");
      return null;
    }
    if (!startOK || !endOK) {
      alert("시간 형식이 올바르지 않습니다. (HH:MM)");
      return null;
    }

    // 로컬 시간대 기준으로 ISO 형식 변환
    const startDateTime = new Date(`${form.date}T${form.startClock}:00`);
    const endDateTime = new Date(`${form.date}T${form.endClock}:00`);

    // 안전한 로컬 ISO 문자열 변환
    const formatSafeLocalISO = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const payload = {
      scheduleNo: form.scheduleNo, // id -> scheduleNo로 변경
      date: form.date,
      title: form.title,
      startTime: formatSafeLocalISO(startDateTime),
      endTime: formatSafeLocalISO(endDateTime),
      gym: form.gym,
      trainerName: form.trainer || null, // trainer -> trainerName으로 변경
      color: form.color,
      completed, // ✅ 완료 상태 포함
    };

    console.log("일반 수정용 buildPayload 결과:", payload);
    return payload;
  };

  const handleSave = () => {
    const payload = buildPayload();
    if (!payload) return;
    onSave?.(payload);
    onClose?.();
  };

  const handleCompleteToggle = (next) => {
    const payload = buildPayload({ completed: next });
    if (!payload) return;
    onSave?.(payload);
    onClose?.();
  };
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
          <span className="text-xl">✏️</span>
          일정 수정
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="제목"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작
              </label>
              <input
                type="time"
                name="startClock"
                value={form.startClock}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료
              </label>
              <input
                type="time"
                name="endClock"
                value={form.endClock}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              장소
            </label>
            <input
              name="gym"
              value={form.gym}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="장소"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              트레이너(선택)
            </label>
            <input
              name="trainer"
              value={form.trainer}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="트레이너"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          {/* 좌측: 완료/취소 퀵 액션 */}
          <div className="flex gap-3">
            {!form.completed ? (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                onClick={() => handleCompleteToggle(true)}
                title="완료 처리 및 저장"
              >
                완료 처리
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
                onClick={() => handleCompleteToggle(false)}
                title="완료 취소 및 저장"
              >
                완료 취소
              </button>
            )}
          </div>

          {/* 우측: 일반 저장/닫기 */}
          <div className="flex gap-3">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              onClick={onClose}
            >
              닫기
            </button>
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium"
              onClick={handleSave}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;
