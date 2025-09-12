import { useRef } from "react";

const TodayRecord = ({ weight, water, onSaveWeight, onAddWater }) => {
  const weightRef = useRef(null);
  const filled = Math.round(water / 200); // 잔 시각화(8칸)

  return (
    <div className="space-y-4">
      {/* 몸무게 */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-gray-600">⚖️</span>
          몸무게 기록
        </h4>
        <div className="flex gap-3">
          <input
            ref={weightRef}
            type="number"
            step="0.1"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            defaultValue={Number.isFinite(weight) ? weight.toFixed(1) : ""}
            placeholder="몸무게 (kg)"
            aria-label="몸무게 입력"
          />{" "}
          <button
            className="px-4 py-2 rounded-md bg-teal-500 text-white hover:bg-teal-600 transition-colors font-medium"
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-gray-600">💧</span>
          수분 섭취
        </h4>
        <div className="space-y-4">
          {/* 수분 시각화 */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1" aria-label="수분 섭취 잔 시각화">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-10 rounded-lg transition-colors duration-200 ${
                    i < filled
                      ? "bg-gradient-to-t from-blue-400 to-blue-300 shadow-sm"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {filled}/8 잔 ({water}ml)
            </div>
          </div>

          {/* 수분 조절 버튼 */}
          <div className="flex gap-2">
            <button
              className={`flex-1 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                water <= 0
                  ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                  : "border-red-300 text-red-600 hover:bg-red-50"
              }`}
              disabled={water <= 0}
              onClick={() => {
                const delta = Math.min(200, water);
                if (delta > 0) onAddWater?.(-delta);
              }}
              aria-label="수분 200ml 감소"
              title="– 200ml"
            >
              – 200ml
            </button>{" "}
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors font-medium text-sm"
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
};

export default TodayRecord;
