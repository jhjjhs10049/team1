import { useRef } from "react";

const TodayRecord = ({ weight, water, onSaveWeight, onAddWater }) => {
    const weightRef = useRef(null);
    const filled = Math.round(water / 200); // 잔 시각화(8칸)

    return (
        <div className="space-y-3">
            <h3 className="font-semibold">오늘 기록</h3>

            {/* 몸무게 */}
            <div className="p-4 rounded-xl border shadow-sm">
                <b className="block mb-2">몸무게</b>
                <div className="flex gap-2">
                    <input
                        ref={weightRef}
                        type="number"
                        step="0.1"
                        className="border rounded px-3 py-2 w-40"
                        defaultValue={Number.isFinite(weight) ? weight.toFixed(1) : ""}
                        aria-label="몸무게 입력"
                    />
                    <button
                        className="px-3 py-2 rounded bg-gray-800 text-white"
                        onClick={() => {
                            const v = parseFloat(weightRef.current?.value);
                            if (Number.isNaN(v)) return;
                            onSaveWeight?.(v);
                        }}
                    >
                        기록
                    </button>
                </div>
            </div>

            {/* 수분 섭취 */}
            <div className="p-4 rounded-xl border shadow-sm">
                <b className="block mb-2">수분 섭취</b>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1" aria-label="수분 섭취 잔 시각화">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-6 h-10 rounded ${i < filled ? "bg-blue-400" : "bg-gray-200"}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* –200ml */}
                        <button
                            className={`px-3 py-2 rounded border ${water <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={water <= 0}
                            onClick={() => {
                                // 0ml 이하로 내려가지 않도록 delta를 조정
                                const delta = Math.min(200, water);
                                if (delta > 0) onAddWater?.(-delta);
                            }}
                            aria-label="수분 200ml 감소"
                            title="– 200ml"
                        >
                            – 200ml
                        </button>

                        {/* +200ml */}
                        <button
                            className="px-3 py-2 rounded border"
                            onClick={() => onAddWater?.(200)}
                            aria-label="수분 200ml 증가"
                            title="+ 200ml"
                        >
                            + 200ml
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TodayRecord;