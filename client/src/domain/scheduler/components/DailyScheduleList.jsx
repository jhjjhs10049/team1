const DailyScheduleList = ({ dateISO, items, onEdit, onDelete, onAdd }) => {
    console.log("오늘날짜 : ", dateISO);
    const nextDate = new Date(dateISO);
    nextDate.setDate(nextDate.getDate() + 1);
    const formattedDate = nextDate.toISOString().split("T")[0];
    return (
        <div className="p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{formattedDate} 일정</h3>
                {onAdd && (
                    <button
                        className="px-3 py-1 text-sm rounded border"
                        onClick={onAdd}
                        aria-label="일정 추가"
                        title="일정 추가"
                    >
                        + 일정
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <p className="text-gray-500">일정이 없습니다.</p>
            ) : (
                <div className="space-y-3">
                    {items.map((s) => (
                        <div key={s.id} className="p-3 rounded-lg border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${s.color}`} />
                                <b>{s.title}</b>
                            </div>
                            <div className="text-sm text-gray-600">
                                {s.startTime} ~ {s.endTime}
                            </div>
                            <div className="text-sm">장소: {s.gym}</div>
                            {s.trainer && <div className="text-sm">트레이너: {s.trainer}</div>}
                            <div className="mt-2 flex gap-2">
                                <button className="px-3 py-1 text-sm rounded border" onClick={() => onEdit(s)}>
                                    수정
                                </button>
                                <button className="px-3 py-1 text-sm rounded border" onClick={() => onDelete(s)}>
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DailyScheduleList;