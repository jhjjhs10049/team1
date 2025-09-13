import React, { useState } from "react";
import StatCard from "./StatCard";
import Modal from "./Modal";

const StatsSection = ({ todayStats, setStat, selectedDate }) => {
  const [statEditModal, setStatEditModal] = useState({
    open: false,
    label: "",
    key: "",
    value: "",
  });
  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 로컬 날짜로 비교 (시간대 문제 해결)
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterdayStr = `${yesterday.getFullYear()}-${String(
      yesterday.getMonth() + 1
    ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(
      tomorrow.getMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    if (dateStr === todayStr) return "오늘";
    if (dateStr === yesterdayStr) return "어제";
    if (dateStr === tomorrowStr) return "내일";

    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {" "}
      {/* 상단 지표 카드들 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            <span className="text-xl">📊</span>
            {formatDate(selectedDate)}의 운동 기록
          </h2>
          <div className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </div>
        </div>{" "}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="칼로리"
            value={`${todayStats.calories || 0} kcal`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "칼로리",
                key: "calories",
                value: todayStats.calories || 0,
              })
            }
          />
          <StatCard
            label="운동시간"
            value={`${todayStats.minutes || 0} 분`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "운동시간",
                key: "minutes",
                value: todayStats.minutes || 0,
              })
            }
          />
          <StatCard
            label="몸무게"
            value={`${(todayStats.weightKg || 70).toFixed(1)} kg`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "몸무게",
                key: "weight",
                value: todayStats.weightKg || 70,
              })
            }
          />{" "}
          <StatCard
            label="수분섭취"
            value={`${todayStats.waterMl || 0} ml`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "수분섭취",
                key: "water",
                value: todayStats.waterMl || 0,
              })
            }
          />
        </div>
      </div>
      {/* 상단 지표 입력 모달 */}
      {statEditModal.open && (
        <Modal
          onClose={() =>
            setStatEditModal({ open: false, label: "", key: "", value: "" })
          }
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
              <span className="text-xl">📊</span>
              {statEditModal.label} 입력
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {statEditModal.label}
                </label>
                <input
                  type="number"
                  value={statEditModal.value}
                  onChange={(e) =>
                    setStatEditModal((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                  placeholder={`${statEditModal.label}를 입력하세요`}
                />
                {statEditModal.key === "water" && (
                  <p className="text-sm text-gray-500 mt-2">
                    단위: ml (예: 200ml = 1잔)
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                onClick={() =>
                  setStatEditModal({
                    open: false,
                    label: "",
                    key: "",
                    value: "",
                  })
                }
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium"
                onClick={() => {
                  setStat(statEditModal.key, Number(statEditModal.value));
                  setStatEditModal({
                    open: false,
                    label: "",
                    key: "",
                    value: "",
                  });
                }}
              >
                저장
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default StatsSection;
