const DailyScheduleList = ({ dateISO, items, onEdit, onDelete, onAdd }) => {
  console.log("선택된 날짜:", dateISO);
  console.log("전달받은 items:", items);

  // 시간 포맷팅 함수 추가
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 선택된 날짜를 한국어 형식으로 포맷 (timezone 이슈 해결)
  const displayDate = (() => {
    // YYYY-MM-DD 문자열을 로컬 시간대로 안전하게 파싱
    const [year, month, day] = dateISO.split('-').map(Number);
    const date = new Date(year, month - 1, day); // 로컬 시간대 기준
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  })();

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">{displayDate} 일정</h4>
        {onAdd && (
          <button
            className="px-4 py-2 text-sm font-medium rounded-md bg-teal-500 text-white hover:bg-teal-600 transition-colors"
            onClick={onAdd}
            aria-label="일정 추가"
            title="일정 추가"
          >
            + 일정
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">일정이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-4 h-4 rounded-full ${s.color} shadow-sm`} />
                <h5 className="font-semibold text-gray-800">{s.title}</h5>
              </div>
              <div className="space-y-1 mb-3">

                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400">🕐</span>
                  {formatTime(s.startTime)} ~ {formatTime(s.endTime)}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400">📍</span>
                  {s.gym}
                </div>
                {s.trainerName && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-gray-400">👤</span>
                    트레이너: {s.trainerName}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => onEdit(s)}
                >
                  수정
                </button>
                <button
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => onDelete(s)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyScheduleList;
