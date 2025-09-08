// src/domain/schedule/components/WeeklyGrid.jsx
import React from "react";

const HOUR_HEIGHT = 42;

// "HH:mm" -> 소수 시간
const toHour = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h + m / 60;
};

// 로컬 타임존 기준 YYYY-MM-DD -> 0(일)~6(토)
const localDayOfWeek = (yyyyMMdd) => {
    // 안전 파싱: new Date(y, m-1, d)는 로컬 기준이라 UTC로 틀어지지 않음
    const [y, m, d] = yyyyMMdd.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getDay(); // 0=일
};

// 블록이 갖는 요일을 "그리드 열 인덱스"로 정규화
const colIndexForBlock = (b, dayShift = 0) => {
    // 1) 우선순위: b.dayIdx가 있으면 그대로 사용
    if (Number.isInteger(b.dayIdx)) {
        return (b.dayIdx + dayShift + 7) % 7;
    }
    // 2) 차선: b.date(YYYY-MM-DD)가 있으면 로컬 기준으로 요일 계산
    if (typeof b.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
        const dow = localDayOfWeek(b.date);
        return (dow + dayShift + 7) % 7;
    }
    // 3) 실패 시 0(일)로 폴백
    return (0 + dayShift + 7) % 7;
};

const WeeklyGrid = ({ blocks = [], onBlockClick, highlightDayIdx, dayShift = 0 }) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 06~20시

    return (
        <div className="p-4 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">주간 시간표</h3>
            </div>

            {/* 헤더 */}
            <div className="grid" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
                <div />
                {days.map((d, idx) => (
                    <div
                        key={d}
                        className={`text-center text-sm font-semibold py-2 rounded-md ${highlightDayIdx === idx ? "bg-blue-50" : ""
                            }`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* 본문: 눈금 */}
            <div className="relative border-t">
                <div className="grid" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
                    {/* 시간축 */}
                    <div className="relative">
                        {hours.map((h) => (
                            <div key={h} className="h-[42px] text-xs text-right pr-2 text-gray-500 border-b">
                                {String(h).padStart(2, "0")}:00
                            </div>
                        ))}
                    </div>
                    {/* 요일 칼럼 */}
                    {days.map((_, col) => (
                        <div key={col} className="relative">
                            {hours.map((h) => (
                                <div key={h} className="h-[42px] border-b" />
                            ))}
                            <div className="absolute inset-y-0 left-0 w-px bg-gray-200" />
                        </div>
                    ))}
                </div>

                {/* 블록 배치 */}
                <div className="absolute inset-0" style={{ left: 80 }}>
                    <div className="grid h-full" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
                        {Array.from({ length: 7 }).map((_, dayIdx) => (
                            <div key={dayIdx} className="relative">
                                {blocks
                                    .filter((b) => colIndexForBlock(b, dayShift) === dayIdx)
                                    .map((b) => {
                                        const top = (toHour(b.start) - 6) * HOUR_HEIGHT;
                                        const height = (toHour(b.end) - toHour(b.start)) * HOUR_HEIGHT;
                                        return (
                                            <div
                                                key={b.id}
                                                role={onBlockClick ? "button" : undefined}
                                                tabIndex={onBlockClick ? 0 : undefined}
                                                onClick={onBlockClick ? () => onBlockClick(b) : undefined}
                                                onKeyDown={
                                                    onBlockClick
                                                        ? (e) => (e.key === "Enter" || e.key === " ") && onBlockClick(b)
                                                        : undefined
                                                }
                                                className={`absolute left-1 right-1 rounded-lg text-xs text-white p-2 shadow ${b.color} ${onBlockClick ? "cursor-pointer focus:outline-2 focus:outline-white/70" : ""
                                                    }`}
                                                style={{ top, height, minHeight: 28 }}
                                                title={`${b.title} • ${b.start}~${b.end}${b.gym ? " • " + b.gym : ""}`}
                                            >
                                                <div className="font-semibold truncate">{b.title}</div>
                                                <div className="opacity-90">
                                                    {b.start}~{b.end}
                                                </div>
                                                {b.gym && <div className="opacity-90 truncate">{b.gym}</div>}
                                            </div>
                                        );
                                    })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 범례 */}
            <div className="mt-3 flex gap-3 text-xs text-gray-600">
                <Legend color="bg-blue-500" label="PT/세션" />
                <Legend color="bg-green-500" label="유산소" />
                <Legend color="bg-orange-500" label="하체 루틴" />
                <Legend color="bg-purple-500" label="스트레칭" />
            </div>
        </div>
    );
};

const Legend = ({ color, label }) => (
    <div className="flex items-center gap-1">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span>{label}</span>
    </div>
);

export default WeeklyGrid;