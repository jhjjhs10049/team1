import React, { useState } from "react";
import Modal from "./Modal";

const COLOR_OPTIONS = [
  { label: "파랑", value: "bg-blue-500" },
  { label: "초록", value: "bg-green-500" },
  { label: "빨강", value: "bg-red-500" },
  { label: "오렌지", value: "bg-orange-500" },
  { label: "보라", value: "bg-purple-500" },
  { label: "틸", value: "bg-teal-500" },
];

const RoutineCreateModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    exerciseList: "",
  });
  const handleCreate = () => {
    if (!form.name.trim()) return alert("루틴 이름을 입력하세요.");
    if (!form.exerciseList.trim()) return alert("운동 항목을 입력하세요.");

    const routine = {
      name: form.name.trim(),
      description: form.description.trim() || `${form.name.trim()} 루틴입니다.`,
      exerciseList: form.exerciseList.trim(),
    };

    onCreate?.(routine);
    onClose?.();
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
          <span className="text-xl">➕</span>새 루틴 추가
        </h3>

        <div className="space-y-4">
          {" "}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              루틴 이름
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="예) 내 상체 루틴"
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
              placeholder="벤치프레스 4세트 x 8-12회&#10;랫풀다운 4세트 x 10-12회&#10;숄더프레스 3세트 x 10-12회"
            />
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

export default RoutineCreateModal;
