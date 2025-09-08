import { useState, useEffect } from "react";
import { fetchWeeklyGoal, upsertWeeklyGoal } from "../api/scheduleApi";

const useWeeklyGoal = (weekStartISO) => {
    // 초기 상태를 null이 아닌 기본값 객체로 설정하여 오류 방지
    const [weeklyGoal, setWeeklyGoal] = useState({
        targetPercent: 100,
        donePercent: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!weekStartISO) return;
        setLoading(true);
        fetchWeeklyGoal(weekStartISO)
            .then((data) => {
                // 데이터가 있을 경우에만 상태를 업데이트
                if (data) {
                    setWeeklyGoal(data);
                }
            })
            .finally(() => setLoading(false));
    }, [weekStartISO]);

    const saveWeeklyGoal = async (dto) => {
        const saved = await upsertWeeklyGoal(dto);
        setWeeklyGoal(saved);
    };

    // setWeeklyGoal을 반환 객체에 추가
    return { weeklyGoal, setWeeklyGoal, saveWeeklyGoal, loading };
};

export default useWeeklyGoal;