import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import WeeklyGrid from "./WeeklyGrid";
import DailyScheduleList from "./DailyScheduleList";
import ScheduleModal from "./ScheduleModal";
import ConfirmModal from "./ConfirmModal";
import ScheduleCreateModal from "./ScheduleCreateModal";

const CalendarSection = ({
  selectedDate,
  setSelectedDate,
  selectedISO,
  schedules,
  todayList,
  weeklyBlocks,
  highlightDayIdx,
  addSchedule,
  saveSchedule,
  deleteSchedule,
}) => {
  // 일정 관련 모달 상태
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

  return (
    <>
      {/* 본문: 달력 + 일정 + 주간시간표 */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
          <span className="text-xl">📅</span>
          일정 관리
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 달력 + 선택일 일정 */}
          <div className="space-y-4 xl:col-span-1">
            {/* 달력 (점 표시: 해당 날짜에 일정 존재) */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                calendarType="gregory" // 일요일 시작으로 설정
                formatDay={(locale, date) => date.getDate()}
                tileContent={({ date }) => {
                  // timezone 문제 해결: 로컬 날짜를 YYYY-MM-DD 형식으로 안전하게 변환
                  const dateIso = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

                  // 오늘 날짜 계산 (timezone 문제 해결)
                  const today = new Date();
                  const todayIso = `${today.getFullYear()}-${String(
                    today.getMonth() + 1
                  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

                  // 오늘 이후의 날짜인지 확인 (오늘 포함)
                  const isTodayOrFuture = dateIso >= todayIso;

                  const has = schedules.some((d) => {
                    // d.date가 YYYY-MM-DD 형식이라고 가정하고 직접 비교
                    const scheduleDate = d.date.split("T")[0]; // ISO 문자열일 경우를 대비
                    return scheduleDate === dateIso;
                  });

                  // 오늘 이후의 날짜이면서 일정이 있는 경우에만 점 표시
                  return has && isTodayOrFuture ? (
                    <div className="mt-1 w-2 h-2 bg-teal-500 rounded-full mx-auto" />
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
          </div>

          {/* 주간 시간표: schedules → 파생 블록, 블록 클릭 시 수정 모달 */}
          <div className="xl:col-span-2">
            <WeeklyGrid
              blocks={weeklyBlocks}
              highlightDayIdx={highlightDayIdx}
              onBlockClick={(block) => {
                const item = schedules.find((s) => s.scheduleNo === block.id);
                if (item) setScheduleEditModal({ open: true, item });
              }}
              onBlockComplete={(block) => {
                const item = schedules.find((s) => s.scheduleNo === block.id);
                if (!item || item.completed) return; // 중복 방지

                // 완료 처리 시 기존 데이터 유지 (시간 변경 방지)
                const completedItem = {
                  ...item, // 기존 데이터 유지
                  completed: true, // 완료 상태만 변경
                };
                saveSchedule(completedItem);
              }}
            />
          </div>
        </div>
      </div>
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
          onClose={() => setScheduleEditModal({ open: false, item: null })}
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
          onClose={() => setScheduleDeleteModal({ open: false, item: null })}
          onConfirm={() => {
            deleteSchedule(scheduleDeleteModal.item.scheduleNo);
            setScheduleDeleteModal({ open: false, item: null });
          }}
        />
      )}
    </>
  );
};

export default CalendarSection;
