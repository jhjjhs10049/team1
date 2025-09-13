import { useState } from "react";
import Modal from "./Modal";

const RoutineStartModal = ({ routine, onClose, onComplete }) => {
  const [done, setDone] = useState(() => new Set());

  // exerciseList를 줄바꿈으로 분할하여 배열로 변환
  const exercises = routine.exerciseList
    ? routine.exerciseList.split("\n").filter((ex) => ex.trim())
    : [];

  const toggle = (idx) =>
    setDone((prev) => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
          <span className="text-xl">🚀</span>
          {routine.name} 시작
        </h3>
        <div className="space-y-3 max-h-72 overflow-auto pr-2">
          {exercises.map((exercise, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={done.has(idx)}
                onChange={() => toggle(idx)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span
                className={`flex-1 ${done.has(idx) ? "line-through text-gray-400" : "text-gray-700"
                  } font-medium`}
              >
                {exercise}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium"
            onClick={() => {
              onComplete?.({
                doneCount: done.size,
                total: exercises.length,
              });
              onClose?.();
            }}
          >
            완료
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RoutineStartModal;
