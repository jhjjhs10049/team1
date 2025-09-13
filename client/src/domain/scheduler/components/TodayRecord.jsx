import React, { useState, useEffect } from "react";

const TodayRecord = ({
  weight,
  water,
  calories,
  minutes,
  onSaveWeight,
  onAddWater,
  onSaveCalories,
  onSaveMinutes,
}) => {
  // 로컬 상태 관리
  const [localWeight, setLocalWeight] = useState("");
  const [localCalories, setLocalCalories] = useState("");
  const [localMinutes, setLocalMinutes] = useState("");

  // props가 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    setLocalWeight(Number.isFinite(weight) ? weight.toString() : "");
  }, [weight]);

  useEffect(() => {
    setLocalCalories(calories ? calories.toString() : "");
  }, [calories]);

  useEffect(() => {
    setLocalMinutes(minutes ? minutes.toString() : "");
  }, [minutes]);

  // 저장 핸들러
  const handleSaveWeight = () => {
    const v = parseFloat(localWeight);
    if (!Number.isNaN(v) && v > 0) {
      onSaveWeight?.(v);
    }
  };

  const handleSaveCalories = () => {
    const v = parseInt(localCalories);
    if (!Number.isNaN(v) && v >= 0) {
      onSaveCalories?.(v);
    } else if (localCalories === "") {
      onSaveCalories?.(0);
    }
  };

  const handleSaveMinutes = () => {
    const v = parseInt(localMinutes);
    if (!Number.isNaN(v) && v >= 0) {
      onSaveMinutes?.(v);
    } else if (localMinutes === "") {
      onSaveMinutes?.(0);
    }
  };

  const filled = Math.round(water / 200); // 잔 시각화(8칸)
  return (
    <div className="space-y-4">
      {/* 몸무게와 칼로리 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {" "}
        {/* 몸무게 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-gray-600">⚖️</span>
            몸무게 기록
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors text-sm"
              value={localWeight}
              placeholder="몸무게 (kg)"
              aria-label="몸무게 입력"
              onChange={(e) => setLocalWeight(e.target.value)}
            />
            <button
              onClick={handleSaveWeight}
              className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
            >
              저장
            </button>
          </div>
        </div>{" "}
        {/* 칼로리 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-gray-600">🔥</span>
            칼로리
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors text-sm"
              value={localCalories}
              placeholder="칼로리 (kcal)"
              aria-label="칼로리 입력"
              onChange={(e) => setLocalCalories(e.target.value)}
            />
            <button
              onClick={handleSaveCalories}
              className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
            >
              저장
            </button>
          </div>
        </div>
      </div>

      {/* 운동시간과 수분섭취 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {" "}
        {/* 운동시간 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-gray-600">⏱️</span>
            운동시간
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors text-sm"
              value={localMinutes}
              placeholder="운동시간 (분)"
              aria-label="운동시간 입력"
              onChange={(e) => setLocalMinutes(e.target.value)}
            />
            <button
              onClick={handleSaveMinutes}
              className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
            >
              저장
            </button>
          </div>
        </div>
        {/* 수분 섭취 */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-gray-600">💧</span>
            수분 섭취
          </h4>
          <div className="space-y-3">
            {/* 수분 시각화 */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1" aria-label="수분 섭취 잔 시각화">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-6 rounded-md transition-colors duration-200 ${
                      i < filled
                        ? "bg-gradient-to-t from-blue-400 to-blue-300 shadow-sm"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-600 font-medium">
                {filled}/8 잔
              </div>
            </div>

            {/* 수분 조절 버튼 */}
            <div className="flex gap-2">
              <button
                className={`flex-1 px-2 py-1 rounded-lg border font-medium text-xs transition-colors ${
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
              </button>
              <button
                className="flex-1 px-2 py-1 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors font-medium text-xs"
                onClick={() => onAddWater?.(200)}
                aria-label="수분 200ml 증가"
                title="+ 200ml"
              >
                + 200ml
              </button>
            </div>
            <div className="text-center text-xs text-gray-500">{water}ml</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayRecord;
