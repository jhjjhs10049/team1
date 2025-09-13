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

const WeeklyGrid = ({
  blocks = [],
  onBlockClick,
  highlightDayIdx,
  dayShift = 0,
}) => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const hours = Array.from({ length: 19 }, (_, i) => i + 4); // 04~22시

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">주간 시간표</h4>
      </div>
      {/* 헤더 */}
      <div
        className="grid mb-2"
        style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}
      >
        <div />
        {days.map((d, idx) => (
          <div
            key={d}
            className={`text-center text-sm font-semibold py-3 rounded-lg transition-colors ${
              highlightDayIdx === idx
                ? "bg-teal-100 text-teal-700"
                : "text-gray-600"
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      {/* 본문: 눈금 */}
      <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div
          className="grid"
          style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}
        >
          {/* 시간축 */}
          <div className="relative bg-gray-50 border-r border-gray-200">
            {hours.map((h) => (
              <div
                key={h}
                className="h-[42px] text-xs text-right pr-3 text-gray-500 border-b border-gray-100 flex items-center justify-end"
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {/* 요일 칼럼 */}
          {days.map((_, col) => (
            <div key={col} className="relative">
              {hours.map((h) => (
                <div
                  key={h}
                  className="h-[42px] border-b border-gray-100 hover:bg-gray-25 transition-colors"
                />
              ))}
              <div className="absolute inset-y-0 left-0 w-px bg-gray-200" />
            </div>
          ))}
        </div>

        {/* 블록 배치 */}
        <div className="absolute inset-0" style={{ left: 80 }}>
          <div
            className="grid h-full"
            style={{ gridTemplateColumns: `repeat(7, 1fr)` }}
          >
            {Array.from({ length: 7 }).map((_, dayIdx) => (
              <div key={dayIdx} className="relative">
                {blocks
                  .filter((b) => colIndexForBlock(b, dayShift) === dayIdx)
                  .map((b) => {
                    const top = (toHour(b.start) - 4) * HOUR_HEIGHT;
                    const height =
                      (toHour(b.end) - toHour(b.start)) * HOUR_HEIGHT;
                    return (
                      <div
                        key={b.id}
                        role={onBlockClick ? "button" : undefined}
                        tabIndex={onBlockClick ? 0 : undefined}
                        onClick={
                          onBlockClick ? () => onBlockClick(b) : undefined
                        }
                        onKeyDown={
                          onBlockClick
                            ? (e) =>
                                (e.key === "Enter" || e.key === " ") &&
                                onBlockClick(b)
                            : undefined
                        }
                        className={`absolute left-1 right-1 rounded-xl text-xs text-white p-3 shadow-md hover:shadow-lg transition-all duration-200 ${
                          b.color
                        } ${
                          onBlockClick
                            ? "cursor-pointer hover:scale-105 focus:outline-2 focus:outline-white/70"
                            : ""
                        }`}
                        style={{ top, height, minHeight: 32 }}
                        title={`${b.title} • ${b.start}~${b.end}${
                          b.gym ? " • " + b.gym : ""
                        }`}
                      >
                        <div className="font-semibold truncate text-shadow-sm">
                          {b.title}
                        </div>
                        <div className="opacity-90 text-xs mt-1">
                          {b.start}~{b.end}
                        </div>
                        {b.gym && (
                          <div className="opacity-90 truncate text-xs">
                            {b.gym}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>{" "}
      {/* 동적 범례 - 실제 일정 데이터에서 사용된 색상만 표시 */}
      {blocks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
          {/* 실제 사용된 색상들을 유니크하게 추출해서 범례 생성 */}
          {[...new Set(blocks.map((b) => b.color))]
            .filter((color) => color) // 색상이 있는 것만
            .map((color, index) => {
              // 색상별 기본 라벨 매핑
              const colorLabels = {
                "bg-blue-500": "PT/세션",
                "bg-teal-500": "유산소",
                "bg-orange-500": "하체 운동",
                "bg-purple-500": "스트레칭",
                "bg-green-500": "기타 운동",
                "bg-red-500": "개인 운동",
                "bg-yellow-500": "그룹 운동",
                "bg-pink-500": "재활 운동",
                "bg-indigo-500": "근력 운동",
                "bg-sky-500": "상체 운동",
              };
              const label = colorLabels[color] || `운동 ${index + 1}`;
              return <Legend key={color} color={color} label={label} />;
            })}
        </div>
      )}
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
