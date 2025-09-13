import { useState } from "react";
import Modal from "./Modal";

const COLOR_OPTIONS = [
  { label: "Sky", value: "bg-sky-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Blue", value: "bg-blue-500" },
  { label: "Teal", value: "bg-teal-500" },
  { label: "Purple", value: "bg-purple-500" },
];

const RoutineEditModal = ({ routine, onSave, onDelete, onClose }) => {
  const [form, setForm] = useState({
    routineNo: routine.routineNo,
    name: routine.name || "",
    description: routine.description || "",
    exerciseList: routine.exerciseList || "",
  });
  const handleSave = () => {
    if (!form.name.trim()) return alert("루틴 이름을 입력하세요.");
    if (!form.exerciseList.trim()) return alert("운동 항목을 입력하세요.");

    onSave?.(form.routineNo, {
      name: form.name.trim(),
      description: form.description.trim() || `${form.name.trim()} 루틴입니다.`,
      exerciseList: form.exerciseList.trim(),
    });
    onClose?.();
  };
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
          <span className="text-xl">🏋️</span>
          루틴 수정
        </h3>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              루틴 이름
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="예) 상체 루틴"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (선택사항)
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="예) 상체 근력 향상을 위한 루틴"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              운동 항목 (줄바꿈으로 구분)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors h-32 resize-none"
              value={form.exerciseList}
              onChange={(e) =>
                setForm((p) => ({ ...p, exerciseList: e.target.value }))
              }
              placeholder={"벤치프레스 4x10\n랫풀다운 4x12\n숄더프레스 3x12"}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">

          <button
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors font-medium"
            onClick={() => {
              if (confirm("이 루틴을 삭제하시겠습니까?")) {
                onDelete?.(form.routineNo);
                onClose?.();
              }
            }}
          >
            삭제
          </button>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              onClick={onClose}
            >
              취소
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

export default RoutineEditModal;
