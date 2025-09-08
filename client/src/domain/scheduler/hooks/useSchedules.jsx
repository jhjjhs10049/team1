import { useState, useEffect } from "react";
import {
    fetchSchedulesByDate,
    createSchedule,
    updateSchedule,
    deleteSchedule,
} from "../api/scheduleApi";

const useSchedules = (dateISO) => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ 날짜별 일정 로드
    useEffect(() => {
        if (!dateISO) return;
        setLoading(true);
        fetchSchedulesByDate(dateISO)
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
        const updated = await updateSchedule(dto.id, dto);
        setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    };

    const removeSchedule = async (id) => {
        await deleteSchedule(id);
        setSchedules((prev) => prev.filter((s) => s.id !== id));
    };

    return { schedules, loading, error, addSchedule, saveSchedule, removeSchedule };
};

export default useSchedules;