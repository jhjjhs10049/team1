const RoutineList = ({ routines, onStart, onEdit }) => {
    return (
        <div className="space-y-3">
            <h3 className="font-semibold">나의 루틴</h3>
            {routines.map((r) => (
                <div key={r.key} className="p-4 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`w-3 h-3 rounded-full ${r.color}`} />
                        <b>{r.name}</b>
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                        {r.items.map((it, idx) => (
                            <li key={idx}>{it}</li>
                        ))}
                    </ul>
                    <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1 text-sm rounded border" onClick={() => onStart?.(r)}>
                            시작
                        </button>
                        <button className="px-3 py-1 text-sm rounded border" onClick={() => onEdit?.(r)}>
                            수정
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RoutineList;