import { useState } from "react";
import Modal from "./Modal";

const COLOR_OPTIONS = [
    { label: "파랑", value: "bg-blue-500" },
    { label: "초록", value: "bg-green-500" },
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
        color: "bg-blue-500",
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleCreate = () => {
        if (!form.title.trim()) return alert("제목을 입력하세요.");
        if (!/^\d{2}:\d{2}$/.test(form.startClock) || !/^\d{2}:\d{2}$/.test(form.endClock)) {
            return alert("시간 형식이 올바르지 않습니다. (HH:MM)");
        }
        const item = {
            date: form.date,  // 선택된 날짜
            title: form.title.trim(),
            startTime: `${form.date} ${form.startClock}`,
            endTime: `${form.date} ${form.endClock}`,
            gym: form.gym.trim() || "미정",
            trainer: form.trainer.trim() || null,
            color: form.color,
        };
        onCreate?.(item);
        onClose?.();
    };

    return (
        <Modal onClose={onClose}>
            <h3 className="text-lg font-semibold mb-4">일정 추가</h3>

            <label className="block text-sm text-gray-600 mb-1">날짜</label>
            <input
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
                className="border rounded px-3 py-2 w-full mb-3"
            />

            <label className="block text-sm text-gray-600 mb-1">제목</label>
            <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="border rounded px-3 py-2 w-full mb-3"
                placeholder="예) PT 세션"
            />

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">시작</label>
                    <input
                        type="time"
                        name="startClock"
                        value={form.startClock}
                        onChange={onChange}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">종료</label>
                    <input
                        type="time"
                        name="endClock"
                        value={form.endClock}
                        onChange={onChange}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>
            </div>

            <label className="block text-sm text-gray-600 mt-3 mb-1">장소</label>
            <input
                name="gym"
                value={form.gym}
                onChange={onChange}
                className="border rounded px-3 py-2 w-full mb-3"
                placeholder="예) 강남 휘트니스"
            />

            <label className="block text-sm text-gray-600 mb-1">트레이너(선택)</label>
            <input
                name="trainer"
                value={form.trainer}
                onChange={onChange}
                className="border rounded px-3 py-2 w-full mb-3"
                placeholder="예) 이승기"
            />

            <label className="block text-sm text-gray-600 mb-1">색상</label>
            <select
                name="color"
                value={form.color}
                onChange={onChange}
                className="border rounded px-3 py-2 w-full mb-4"
            >
                {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                        {c.label}
                    </option>
                ))}
            </select>

            <div className="flex justify-end gap-2">
                <button className="px-3 py-2 rounded border" onClick={onClose}>
                    취소
                </button>
                <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={handleCreate}>
                    추가
                </button>
            </div>
        </Modal>
    );
};

export default ScheduleCreateModal;