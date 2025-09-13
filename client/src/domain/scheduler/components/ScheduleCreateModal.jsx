import { useState } from "react";
import Modal from "./Modal";

const COLOR_OPTIONS = [
  { label: "파랑", value: "bg-blue-500" },
  { label: "틸", value: "bg-teal-500" },
  { label: "오렌지", value: "bg-orange-500" },
  { label: "보라", value: "bg-purple-500" },
  { label: "없음", value: "" },
];

const ScheduleCreateModal = ({ dateISO, onClose, onCreate }) => {
  const [form, setForm] = useState({
    date: dateISO,
    title: "",
    startClock: "07:00",
    endClock: "08:00",
    gym: "",
    trainer: "",
    color: "bg-teal-500",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const handleCreate = () => {
    if (!form.title.trim()) return alert("제목을 입력하세요.");
    if (
      !/^\d{2}:\d{2}$/.test(form.startClock) ||
      !/^\d{2}:\d{2}$/.test(form.endClock)
    ) {
      return alert("시간 형식이 올바르지 않습니다. (HH:MM)");
    }

    // ISO 형식으로 시간 변환
    const startDateTime = new Date(`${form.date}T${form.startClock}:00`);
    const endDateTime = new Date(`${form.date}T${form.endClock}:00`);
    const item = {
      date: form.date, // 선택된 날짜
      title: form.title.trim(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      gym: form.gym.trim() || "미정",
      trainerName: form.trainer.trim() || null, // trainer -> trainerName으로 변경
      color: form.color,
    };
    onCreate?.(item);
    onClose?.();
  };
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
          <span className="text-xl">📅</span>
          일정 추가
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="예) PT 세션"
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
              placeholder="예) 강남 휘트니스"
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
              placeholder="예) 이승기"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상
            </label>
            <select
              name="color"
              value={form.color}
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium"
            onClick={handleCreate}
          >
            추가
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleCreateModal;
