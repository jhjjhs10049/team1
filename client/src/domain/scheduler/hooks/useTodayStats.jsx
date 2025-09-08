import { useState } from "react";

const useTodayStats = (initial) => {
    const [todayStats, setTodayStats] = useState(initial);

    const setStat = (key, value) =>
        setTodayStats((prev) => ({ ...prev, [key]: value }));

    // 잔 표기: 소수 1자리, .0 제거
    const formatCups = (ml) => {
        const cups = ml / 200;
        const s = cups.toFixed(1);
        return s.endsWith(".0") ? s.slice(0, -2) : s;
    };

    return { todayStats, setStat, formatCups };
}

export default useTodayStats;