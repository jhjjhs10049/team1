// src/domain/schedule/pages/SchedulePage.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import BasicLayout from "../../../layouts/BasicLayout";

/** 프레젠테이션용 공용 컴포넌트 */
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import WeeklyGrid from "../components/WeeklyGrid";
import DailyScheduleList from "../components/DailyScheduleList";
import ScheduleModal from "../components/ScheduleModal";
import ConfirmModal from "../components/ConfirmModal";
import TodayRecord from "../components/TodayRecord";
import RoutineList from "../components/RoutineList";
import RoutineEditModal from "../components/RoutineEditModal";
import RoutineStartModal from "../components/RoutineStartModal";
import ScheduleCreateModal from "../components/ScheduleCreateModal";
import GeminiChatComponent from "../components/GeminiChatComponent";

/** 상태/도메인 훅 */
import useTodayStats from "../hooks/useTodayStats";

/** ─────────────────────────────────────────────
 *  데모 시드 데이터 (하드코딩)
 * ──────────────────────────────────────────── */
const todayISO = "2025-08-27";

// 일정 시드 (달력/리스트/그리드 공통 소스)
const _dailySchedulesSeed = [
  {
    id: 100,
    date: "2025-08-27",
    title: "PT 세션",
    startTime: "2025-08-27 14:00",
    endTime: "2025-08-27 15:00",
    gym: "강남 휘트니스",
    trainer: "이승기",
    color: "bg-blue-500",
  },
  {
    id: 101,
    date: "2025-08-27",
    title: "개인 스트레칭",
    startTime: "2025-08-27 19:30",
    endTime: "2025-08-27 19:50",
    gym: "집",
    trainer: null,
    color: "bg-purple-500",
  },
  {
    id: 102,
    date: "2025-08-28",
    title: "런닝",
    startTime: "2025-08-28 07:00",
    endTime: "2025-08-28 08:00",
    gym: "한강공원",
    trainer: null,
    color: "bg-green-500",
  },
];

// 루틴 시드
const routinesSeed = [
  {
    key: "upper",
    name: "상체 루틴",
    items: ["벤치프레스 4x10", "랫풀다운 4x12", "숄더프레스 3x12"],
    color: "bg-sky-500",
  },
  {
    key: "lower",
    name: "하체 루틴",
    items: ["스쿼트 4x8", "레그프레스 3x12", "레그컬 3x15"],
    color: "bg-orange-500",
  },
];

// "YYYY-MM-DD HH:MM" 두 개에서 분 차이 계산
const diffMinutes = (startTs, endTs) => {
  const [d1, t1] = startTs.split(" ");
  const [d2, t2] = endTs.split(" ");
  const a = new Date(`${d1}T${t1}:00`);
  const b = new Date(`${d2}T${t2}:00`);
  return Math.max(0, Math.round((b - a) / (1000 * 60)));
};

/** ─────────────────────────────────────────────
 *  페이지 컴포넌트
 * ──────────────────────────────────────────── */
const SchedulePage = () => {
  /** 날짜 상태 */
  const [selectedDate, setSelectedDate] = useState(new Date(todayISO));
  const selectedISO = selectedDate.toISOString().split("T")[0];

  /** 상단 지표 상태 (카드 클릭 → 모달로 수동 입력 저장) */
  const { todayStats, setStat, formatCups } = useTodayStats({
    calories: 520,
    minutes: 42,
    weight: 70.4,
    water: 1200,
  });
  /** 주간 목표 (하드코딩된 데모 데이터) */
  const [weeklyGoal, setWeeklyGoal] = useState({
    targetPercent: 80,
    donePercent: 60,
  });
  const weeklyRatio =
    weeklyGoal.targetPercent > 0
      ? weeklyGoal.donePercent / weeklyGoal.targetPercent
      : 0;
  /** 일정 상태 (하드코딩된 시드 데이터 사용) */
  const [schedules, setSchedules] = useState(_dailySchedulesSeed);

  const addSchedule = (newSchedule) => {
    setSchedules((prev) => [...prev, { ...newSchedule, id: Date.now() }]);
  };

  const saveSchedule = (updatedSchedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  };

  const deleteSchedule = (scheduleId) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  /** 루틴 상태 (하드코딩된 시드 데이터 사용) */
  const [routines, setRoutines] = useState(routinesSeed);

  const saveRoutine = (updatedRoutine) => {
    setRoutines((prev) =>
      prev.map((r) => (r.key === updatedRoutine.key ? updatedRoutine : r))
    );
  };

  const deleteRoutine = (routineKey) => {
    setRoutines((prev) => prev.filter((r) => r.key !== routineKey));
  };

  /** ─ 모달 상태: 역할별로 명확한 이름 사용 */
  // 상단 지표 편집
  const [statEditModal, setStatEditModal] = useState({
    open: false,
    label: "",
    key: "",
    value: "",
  });

  // 일정 생성/수정/삭제
  const [scheduleCreateModal, setScheduleCreateModal] = useState({
    open: false,
  });
  const [scheduleEditModal, setScheduleEditModal] = useState({
    open: false,
    item: null,
  });
  const [scheduleDeleteModal, setScheduleDeleteModal] = useState({
    open: false,
    item: null,
  });

  // 루틴 시작/수정
  const [routineEditModal, setRoutineEditModal] = useState({
    open: false,
    routine: null,
  });
  const [routineStartModal, setRoutineStartModal] = useState({
    open: false,
    routine: null,
  });

  /** 선택한 날짜의 일정 리스트 */
  const todayList = useMemo(
    () => schedules.filter((d) => d.date === selectedISO),
    [schedules, selectedISO]
  );

  /** ────────────── 주간 그리드 동기화: schedules → blocks 파생 ────────────── */
  // 주(일요일 시작) 계산
  const startOfWeek = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - x.getDay()); // 일(0)로 맞춤
    return x;
  };
  const endOfWeek = useCallback((d) => {
    const s = startOfWeek(d);
    const e = new Date(s);
    e.setDate(e.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return e;
  }, []);

  // 해당 주의 스케줄만 블록으로 변환
  const weeklyBlocks = useMemo(() => {
    const ws = startOfWeek(selectedDate);
    const we = endOfWeek(selectedDate);

    return schedules
      .filter((it) => {
        const d = new Date(it.date);
        return d >= ws && d <= we;
      })
      .map((it) => ({
        id: it.id,
        title: it.title,
        gym: it.gym,
        dayIdx: new Date(it.date).getDay(), // 0=일
        start: it.startTime.split(" ")[1].slice(0, 5), // "HH:MM"
        end: it.endTime.split(" ")[1].slice(0, 5),
        color: it.color || "bg-blue-500",
        completed: !!it.completed, // 일정 완료 여부
        minutes: diffMinutes(it.startTime, it.endTime), // 일정 길이(분)
      }));
  }, [schedules, selectedDate, endOfWeek]);

  console.log("WeeklyGrid에 전달되는 데이터:", weeklyBlocks);
  // 주간 총 계획 분
  const weeklyPlannedMinutes = useMemo(
    () => weeklyBlocks.reduce((sum, b) => sum + (b.minutes || 0), 0),
    [weeklyBlocks]
  );

  // 주간 완료 분
  const weeklyCompletedMinutes = useMemo(
    () =>
      weeklyBlocks
        .filter((b) => b.completed)
        .reduce((sum, b) => sum + (b.minutes || 0), 0),
    [weeklyBlocks]
  );
  // 시간 기반으로 주간 목표 퍼센트 자동 동기화
  useEffect(() => {
    const donePercent =
      weeklyPlannedMinutes > 0
        ? Math.min(
            100,
            Math.round((weeklyCompletedMinutes / weeklyPlannedMinutes) * 100)
          )
        : 0;

    setWeeklyGoal((prev) => ({ ...prev, donePercent }));
  }, [weeklyPlannedMinutes, weeklyCompletedMinutes]);

  // 같은 주를 보고 있을 때만 오늘 요일 헤더 하이라이트
  const today = new Date();
  const highlightDayIdx = (() => {
    const ws = startOfWeek(selectedDate);
    const we = endOfWeek(selectedDate);
    if (today >= ws && today <= we) return today.getDay();
    return undefined;
  })();

  return (
    <BasicLayout>
      <div className="p-6 space-y-6">
        {/* ───────────────── 상단: 오늘 지표 ───────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="칼로리"
            value={`${todayStats.calories} kcal`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "칼로리",
                key: "calories",
                value: todayStats.calories,
              })
            }
          />
          <StatCard
            label="운동시간"
            value={`${todayStats.minutes} 분`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "운동시간",
                key: "minutes",
                value: todayStats.minutes,
              })
            }
          />
          <StatCard
            label="몸무게"
            value={`${todayStats.weight.toFixed(1)} kg`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "몸무게",
                key: "weight",
                value: todayStats.weight,
              })
            }
          />
          <StatCard
            label="수분섭취"
            value={`${formatCups(todayStats.water)} 잔 (${
              todayStats.water
            } ml)`}
            onClick={() =>
              setStatEditModal({
                open: true,
                label: "수분섭취",
                key: "water",
                value: todayStats.water,
              })
            }
          />
        </section>

        {/* 상단 지표 입력 모달 */}
        {statEditModal.open && (
          <Modal
            onClose={() =>
              setStatEditModal({ open: false, label: "", key: "", value: "" })
            }
          >
            <h3 className="text-lg font-semibold mb-4">
              {statEditModal.label} 입력
            </h3>
            <input
              type="number"
              value={statEditModal.value}
              onChange={(e) =>
                setStatEditModal((prev) => ({ ...prev, value: e.target.value }))
              }
              className="border rounded px-3 py-2 w-full mb-4"
            />
            {statEditModal.key === "water" && (
              <p className="text-sm text-gray-500 mb-2">
                단위: ml (예: 200ml = 1잔)
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 rounded border"
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
                className="px-3 py-2 rounded bg-blue-600 text-white"
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
          </Modal>
        )}

        {/* ───────────────── 주간 목표 ───────────────── */}
        <section className="p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">주간 목표</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {weeklyGoal.donePercent}% / {weeklyGoal.targetPercent}%
              </span>
            </div>
          </div>
          <ProgressBar ratio={weeklyRatio} />
        </section>

        {/* ───────────────── 본문: 달력 + 일정 + 주간시간표 ───────────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 달력 + 선택일 일정 */}
          <div className="space-y-4 xl:col-span-1">
            {/* 달력 (점 표시: 해당 날짜에 일정 존재) */}
            <div className="border rounded-lg p-3">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={({ date }) => {
                  const dateIso = date.toISOString().split("T")[0];
                  const has = schedules.some((d) => d.date === dateIso);
                  return has ? (
                    <div className="mt-1 w-2 h-2 bg-blue-600 rounded-full mx-auto" />
                  ) : null;
                }}
              />
            </div>

            {/* 선택일 일정 리스트 */}
            <DailyScheduleList
              dateISO={selectedISO}
              items={todayList}
              onAdd={() => setScheduleCreateModal({ open: true })}
              onEdit={(item) => setScheduleEditModal({ open: true, item })}
              onDelete={(item) => setScheduleDeleteModal({ open: true, item })}
            />

            {/* 일정 추가 모달 */}
            {scheduleCreateModal.open && (
              <ScheduleCreateModal
                dateISO={selectedISO}
                onClose={() => setScheduleCreateModal({ open: false })}
                onCreate={(item) => {
                  addSchedule(item);
                  setScheduleCreateModal({ open: false });
                }}
              />
            )}

            {/* 일정 수정 모달 */}
            {scheduleEditModal.open && (
              <ScheduleModal
                item={scheduleEditModal.item}
                onClose={() =>
                  setScheduleEditModal({ open: false, item: null })
                }
                onSave={(updated) => {
                  saveSchedule(updated);
                  setScheduleEditModal({ open: false, item: null });
                }}
              />
            )}

            {/* 일정 삭제 확인 모달 */}
            {scheduleDeleteModal.open && (
              <ConfirmModal
                message={`'${scheduleDeleteModal.item.title}' 일정을 삭제하시겠습니까?`}
                onClose={() =>
                  setScheduleDeleteModal({ open: false, item: null })
                }
                onConfirm={() => {
                  deleteSchedule(scheduleDeleteModal.item.id);
                  setScheduleDeleteModal({ open: false, item: null });
                }}
              />
            )}
          </div>

          {/* 주간 시간표: schedules → 파생 블록, 블록 클릭 시 수정 모달 */}
          <div className="xl:col-span-2">
            <WeeklyGrid
              blocks={weeklyBlocks}
              highlightDayIdx={highlightDayIdx}
              onBlockClick={(block) => {
                const item = schedules.find((s) => s.id === block.id);
                if (item) setScheduleEditModal({ open: true, item });
              }}
              onBlockComplete={(block) => {
                const item = schedules.find((s) => s.id === block.id);
                if (!item || item.completed) return; // 중복 방지
                saveSchedule({ ...item, completed: true });
              }}
            />
          </div>
        </section>

        {/* ───────────────── 아래: 루틴 + 오늘 기록 + AI 코치 ───────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 루틴 목록 + 모달들 */}
          <div className="space-y-3">
            <RoutineList
              routines={routines}
              onStart={(r) => setRoutineStartModal({ open: true, routine: r })}
              onEdit={(r) => setRoutineEditModal({ open: true, routine: r })}
            />

            {routineEditModal.open && (
              <RoutineEditModal
                routine={routineEditModal.routine}
                onSave={(updated) => saveRoutine(updated)}
                onDelete={(key) => deleteRoutine(key)}
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

          {/* 오늘 기록: 몸무게 저장, 수분 +/− 200ml (상단 지표에 즉시 반영) */}
          <TodayRecord
            weight={todayStats.weight}
            water={todayStats.water}
            onSaveWeight={(v) => setStat("weight", v)}
            onAddWater={(amt = 200) => setStat("water", todayStats.water + amt)}
          />

          {/* AI 코치 (임베드만) */}
          <div className="space-y-3">
            <h3 className="font-semibold">AI 코치</h3>
            <GeminiChatComponent />
          </div>
        </section>
      </div>
    </BasicLayout>
  );
};

export default SchedulePage;
