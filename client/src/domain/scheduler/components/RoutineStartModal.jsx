import { useState } from "react";
import Modal from "./Modal";

const RoutineStartModal = ({ routine, onClose, onComplete }) => {
    const [done, setDone] = useState(() => new Set());

    const toggle = (idx) =>
        setDone((prev) => {
            const n = new Set(prev);
            n.has(idx) ? n.delete(idx) : n.add(idx);
            return n;
        });

    return (
        <Modal onClose={onClose}>
            <h3 className="text-lg font-semibold mb-4">{routine.name} 시작</h3>
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {routine.items.map((it, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={done.has(idx)}
                            onChange={() => toggle(idx)}
                            className="w-4 h-4"
                        />
                        <span className={`${done.has(idx) ? "line-through text-gray-400" : ""}`}>{it}</span>
                    </label>
                ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <button className="px-3 py-2 rounded border" onClick={onClose}>
                    닫기
                </button>
                <button
                    className="px-3 py-2 rounded bg-blue-600 text-white"
                    onClick={() => {
                        onComplete?.({ doneCount: done.size, total: routine.items.length });
                        onClose?.();
                    }}
                >
                    완료
                </button>
            </div>
        </Modal>
    );
}

export default RoutineStartModal;