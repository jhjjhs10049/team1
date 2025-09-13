import { useState, useEffect } from "react";
import {
  fetchSchedulesByRange,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../api/scheduleApi";

const useSchedules = (dateISO) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 날짜별 일정 로드 (해당 주의 모든 일정 가져오기)
  useEffect(() => {
    if (!dateISO) return;

    // 해당 주의 시작과 끝 날짜 계산
    const selectedDate = new Date(dateISO);
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const fromISO = startOfWeek.toISOString().split("T")[0];
    const toISO = endOfWeek.toISOString().split("T")[0];

    setLoading(true);
    fetchSchedulesByRange(fromISO, toISO)
      .then((data) => setSchedules(data))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [dateISO]);

  // ✅ 추가/수정/삭제
  const addSchedule = async (dto) => {
    const created = await createSchedule(dto);
    setSchedules((prev) => [...prev, created]);
  };
  const saveSchedule = async (dto) => {
    const updated = await updateSchedule(dto.scheduleNo, dto);
    setSchedules((prev) =>
      prev.map((s) => (s.scheduleNo === updated.scheduleNo ? updated : s))
    );
  };

  const removeSchedule = async (scheduleNo) => {
    await deleteSchedule(scheduleNo);
    setSchedules((prev) => prev.filter((s) => s.scheduleNo !== scheduleNo));
  };

  return {
    schedules,
    loading,
    error,
    addSchedule,
    saveSchedule,
    removeSchedule,
  };
};

export default useSchedules;
