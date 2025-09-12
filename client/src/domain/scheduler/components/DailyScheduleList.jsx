const DailyScheduleList = ({ dateISO, items, onEdit, onDelete, onAdd }) => {
  console.log("오늘날짜 : ", dateISO);
  const nextDate = new Date(dateISO);
  nextDate.setDate(nextDate.getDate() + 1);
  const formattedDate = nextDate.toISOString().split("T")[0];
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">{formattedDate} 일정</h4>{" "}
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
                  {s.startTime} ~ {s.endTime}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400">📍</span>
                  {s.gym}
                </div>
                {s.trainer && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-gray-400">👤</span>
                    트레이너: {s.trainer}
                  </div>
                )}
              </div>{" "}
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
