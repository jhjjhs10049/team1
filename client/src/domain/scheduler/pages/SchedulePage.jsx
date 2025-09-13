// src/domain/schedule/pages/SchedulePage.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import BasicLayout from "../../../layouts/BasicLayout";

/** 분할된 섹션 컴포넌트들 */
import StatsSection from "../components/StatsSection";
import WeeklyGoalSection from "../components/WeeklyGoalSection";
import CalendarSection from "../components/CalendarSection";
import BottomSection from "../components/BottomSection";

/** 상태/도메인 훅 */
import useRoutines from "../hooks/useRoutines";
import useDailyRecords from "../hooks/useDailyRecords";
import useSchedules from "../hooks/useSchedules";

/** ─────────────────────────────────────────────
 *  일정 시드 데이터 제거 - 빈 배열로 시작
 * ──────────────────────────────────────────── */
// timezone 문제 해결: 로컬 날짜를 YYYY-MM-DD 형식으로 안전하게 변환
const today = new Date();
const todayISO = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

// 하드코딩된 시드 데이터 제거 - 사용자가 직접 일정을 추가하도록 변경
const _dailySchedulesSeed = [];

// "LocalDateTime → LocalDateTime" 두 개에서 분 차이 계산
const diffMinutes = (startTime, endTime) => {
  const a = new Date(startTime);
  const b = new Date(endTime);
  return Math.max(0, Math.round((b - a) / (1000 * 60)));
};

/** ─────────────────────────────────────────────
 *  페이지 컴포넌트
 * ──────────────────────────────────────────── */
const SchedulePage = () => {
  /** 날짜 상태 */
  const [selectedDate, setSelectedDate] = useState(new Date(todayISO));
  // timezone 문제 해결: 로컬 날짜를 YYYY-MM-DD 형식으로 안전하게 변환
  const selectedISO = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  /** 날짜별 기록 상태 (선택된 날짜에 따라 동적으로 변경) */
  const { currentRecord: todayStats, updateRecord } =
    useDailyRecords(selectedDate);

  // 편의를 위한 setter 함수들
  const setStat = useCallback(
    (field, value) => {
      updateRecord(selectedDate, field, value);
    },
    [updateRecord, selectedDate]
  );
  /** 주간 목표 (하드코딩된 데모 데이터) */
  const [weeklyGoal, setWeeklyGoal] = useState({
    targetPercent: 80,
    donePercent: 60,
  });
  const weeklyRatio =
    weeklyGoal.targetPercent > 0
      ? weeklyGoal.donePercent / weeklyGoal.targetPercent
      : 0; /** 일정 상태 - 서버에서 가져오기 */
  const {
    schedules,
    addSchedule,
    saveSchedule,
    removeSchedule: deleteSchedule,
  } = useSchedules(selectedISO); /** 루틴 상태 - 서버에서 가져오기 */
  const {
    routines,
    create: addRoutine,
    update: saveRoutine,
    remove: deleteRoutine,
  } = useRoutines();
  /** 선택한 날짜의 일정 리스트 */
  const todayList = useMemo(
    () => {
      console.log("전체 schedules:", schedules);
      console.log("selectedISO:", selectedISO);

      const filtered = schedules.filter((d) => {
        // d.date가 YYYY-MM-DD 형식이라고 가정하고 직접 비교
        const scheduleDate = d.date.split("T")[0]; // ISO 문자열일 경우를 대비
        console.log("비교중 - scheduleDate:", scheduleDate, "selectedISO:", selectedISO);
        return scheduleDate === selectedISO;
      });

      console.log("필터링된 todayList:", filtered);
      return filtered;
    },
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
        id: it.scheduleNo,
        title: it.title,
        gym: it.gym,
        dayIdx: new Date(it.date).getDay(), // 0=일
        start: new Date(it.startTime).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }), // "HH:MM"
        end: new Date(it.endTime).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        color: it.color || "bg-teal-500",
        completed: !!it.completed, // 일정 완료 여부
        minutes: diffMinutes(it.startTime, it.endTime), // 일정 길이(분)
      }));
  }, [schedules, selectedDate, endOfWeek]);

  console.log("WeeklyGrid에 전달되는 데이터:", weeklyBlocks);
  console.log("전체 스케줄 데이터:", schedules);
  console.log("선택된 날짜:", selectedDate);
  console.log(
    "주간 시작/끝:",
    startOfWeek(selectedDate),
    endOfWeek(selectedDate)
  );
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
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 space-y-8">
          {/* 페이지 헤더 */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
              💪 운동 스케줄 관리
            </h1>
            <div className="mt-4 text-center">
              <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto"></div>
            </div>
          </div>
          {/* 상단 지표 카드들 - 분할된 컴포넌트 사용 */}
          <StatsSection
            todayStats={todayStats}
            setStat={setStat}
            selectedDate={selectedDate}
          />
          {/* 주간 목표 - 분할된 컴포넌트 사용 */}
          <WeeklyGoalSection
            weeklyGoal={weeklyGoal}
            weeklyRatio={weeklyRatio}
          />
          {/* 달력 + 일정 관리 - 분할된 컴포넌트 사용 */}
          <CalendarSection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedISO={selectedISO}
            schedules={schedules}
            todayList={todayList}
            weeklyBlocks={weeklyBlocks}
            highlightDayIdx={highlightDayIdx}
            addSchedule={addSchedule}
            saveSchedule={saveSchedule}
            deleteSchedule={deleteSchedule}
          />
          {/* 하단: 루틴 + 오늘 기록 + AI 코치 - 분할된 컴포넌트 사용 */}
          <BottomSection
            routines={routines}
            addRoutine={addRoutine}
            saveRoutine={saveRoutine}
            deleteRoutine={deleteRoutine}
            todayStats={todayStats}
            setStat={setStat}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </BasicLayout>
  );
};

export default SchedulePage;
