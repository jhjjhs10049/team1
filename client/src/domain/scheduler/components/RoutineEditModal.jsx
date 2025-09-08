import { useState } from "react";
import Modal from "./Modal";

const COLOR_OPTIONS = [
    { label: "Sky", value: "bg-sky-500" },
    { label: "Orange", value: "bg-orange-500" },
    { label: "Blue", value: "bg-blue-500" },
    { label: "Green", value: "bg-green-500" },
    { label: "Purple", value: "bg-purple-500" },
];

const RoutineEditModal = ({ routine, onSave, onDelete, onClose }) => {
    const [form, setForm] = useState({
        key: routine.key,
        name: routine.name || "",
        color: routine.color || "bg-sky-500",
        itemsText: (routine.items || []).join("\n"),
    });

    const handleSave = () => {
        const items = form.itemsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        if (!form.name.trim()) return alert("루틴 이름을 입력하세요.");
        if (items.length === 0) return alert("운동 항목을 1개 이상 입력하세요.");
        onSave?.({ key: form.key, name: form.name.trim(), color: form.color, items });
        onClose?.();
    };

    return (
        <Modal onClose={onClose}>
            <h3 className="text-lg font-semibold mb-4">루틴 수정</h3>

            <label className="block text-sm text-gray-600 mb-1">루틴 이름</label>
            <input
                className="border rounded px-3 py-2 w-full mb-3"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="예) 상체 루틴"
            />

            <label className="block text-sm text-gray-600 mb-1">색상</label>
            <select
                className="border rounded px-3 py-2 w-full mb-3"
                value={form.color}
                onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
            >
                {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                        {c.label}
                    </option>
                ))}
            </select>

            <label className="block text-sm text-gray-600 mb-1">운동 항목 (줄바꿈으로 구분)</label>
            <textarea
                className="border rounded px-3 py-2 w-full mb-4 h-32"
                value={form.itemsText}
                onChange={(e) => setForm((p) => ({ ...p, itemsText: e.target.value }))}
                placeholder={"벤치프레스 4x10\n랫풀다운 4x12\n숄더프레스 3x12"}
            />

            <div className="flex justify-between">
                <button
                    className="px-3 py-2 rounded border text-red-600 border-red-300"
                    onClick={() => {
                        if (confirm("이 루틴을 삭제하시겠습니까?")) {
                            onDelete?.(form.key);
                            onClose?.();
                        }
                    }}
                >
                    삭제
                </button>
                <div className="flex gap-2">
                    <button className="px-3 py-2 rounded border" onClick={onClose}>
                        취소
                    </button>
                    <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>
                        저장
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default RoutineEditModal;