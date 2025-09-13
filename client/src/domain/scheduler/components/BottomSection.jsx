import React, { useState } from "react";
import RoutineList from "./RoutineList";
import RoutineEditModal from "./RoutineEditModal";
import RoutineStartModal from "./RoutineStartModal";
import RoutineCreateModal from "./RoutineCreateModal";
import TodayRecord from "./TodayRecord";
import GeminiChatComponent from "./GeminiChatComponent";

const BottomSection = ({
  routines,
  addRoutine,
  saveRoutine,
  deleteRoutine,
  todayStats,
  setStat,
  selectedDate,
}) => {
  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    const today = new Date();

    // 로컬 날짜로 비교 (시간대 문제 해결)
    const dateStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (dateStr === todayStr) return "오늘";

    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
    });
  };
  // 루틴 관련 모달 상태
  const [routineCreateModal, setRoutineCreateModal] = useState({
    open: false,
  });
  const [routineEditModal, setRoutineEditModal] = useState({
    open: false,
    routine: null,
  });
  const [routineStartModal, setRoutineStartModal] = useState({
    open: false,
    routine: null,
  });
  return (
    <div className="space-y-6">
      {/* 상단: 루틴 목록 + 오늘 기록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 루틴 목록 + 모달들 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <span className="text-lg">🏋️</span>
            운동 루틴
          </h3>
          <div className="space-y-3">
            <RoutineList
              routines={routines}
              onAdd={() => setRoutineCreateModal({ open: true })}
              onStart={(r) => setRoutineStartModal({ open: true, routine: r })}
              onEdit={(r) => setRoutineEditModal({ open: true, routine: r })}
            />

            {routineCreateModal.open && (
              <RoutineCreateModal
                onClose={() => setRoutineCreateModal({ open: false })}
                onCreate={(routine) => {
                  addRoutine(routine);
                  setRoutineCreateModal({ open: false });
                }}
              />
            )}

            {routineEditModal.open && (
              <RoutineEditModal
                routine={routineEditModal.routine}
                onSave={(routineNo, updatedData) => {
                  saveRoutine(routineNo, updatedData);
                  setRoutineEditModal({ open: false, routine: null });
                }}
                onDelete={(routineNo) => {
                  deleteRoutine(routineNo);
                  setRoutineEditModal({ open: false, routine: null });
                }}
                onClose={() =>
                  setRoutineEditModal({ open: false, routine: null })
                }
              />
            )}

            {routineStartModal.open && (
              <RoutineStartModal
                routine={routineStartModal.routine}
                onComplete={(summary) => {
                  // 데모용: 완료 요약만 로그
                  console.log("[Routine] complete:", summary);
                }}
                onClose={() =>
                  setRoutineStartModal({ open: false, routine: null })
                }
              />
            )}
          </div>
        </div>

        {/* 오늘 기록: 몸무게, 수분, 칼로리, 운동시간 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
              <span className="text-lg">📝</span>
              {formatDate(selectedDate)} 기록
            </h3>
            <div className="text-sm text-gray-500">
              {selectedDate.toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}
            </div>
          </div>
          <TodayRecord
            weight={todayStats.weightKg}
            water={todayStats.waterMl}
            calories={todayStats.calories}
            minutes={todayStats.minutes}
            onSaveWeight={(v) => setStat("weight", v)}
            onAddWater={(amt = 200) =>
              setStat("water", todayStats.waterMl + amt)
            }
            onSaveCalories={(v) => setStat("calories", v)}
            onSaveMinutes={(v) => setStat("minutes", v)}
          />
        </div>
      </div>

      {/* 하단: AI 코치 (가로로 길게) */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
          <span className="text-lg">🤖</span>
          AI 코치
        </h3>
        <GeminiChatComponent />
      </div>
    </div>
  );
};

export default BottomSection;
