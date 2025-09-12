import React, { useState } from "react";
import Modal from "./Modal";

const getClock = (ts) => (ts?.split(" ")[1] ?? "").slice(0, 5); // "YYYY-MM-DD HH:MM" → "HH:MM"

const ScheduleModal = ({ item, onClose, onSave }) => {
  const [form, setForm] = useState({
    id: item.id,
    date: item.date, // 유지
    title: item.title ?? "",
    startClock: getClock(item.startTime), // "HH:MM"
    endClock: getClock(item.endTime), // "HH:MM"
    gym: item.gym ?? "",
    trainer: item.trainer ?? "",
    color: item.color ?? "bg-blue-500",
    completed: !!item.completed, // ✅ 완료 여부 토글
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const buildPayload = (overrides = {}) => {
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
    const completed = overrides.completed ?? form.completed;

    return {
      id: form.id,
      date: form.date,
      title: form.title,
      startTime: `${form.date} ${form.startClock}`,
      endTime: `${form.date} ${form.endClock}`,
      gym: form.gym,
      trainer: form.trainer || null,
      color: form.color,
      completed, // ✅ 완료 상태 포함
    };
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
            {" "}
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              onClick={onClose}
            >
              닫기
            </button>{" "}
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
