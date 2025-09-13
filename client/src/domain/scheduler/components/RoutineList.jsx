const RoutineList = ({ routines, onStart, onEdit, onAdd }) => {
  return (
    <div className="space-y-4">
      {/* 루틴 추가 버튼 */}
      {onAdd && (
        <button
          className="w-full px-4 py-3 text-sm font-medium rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
          onClick={onAdd}
        >
          <span className="text-lg">➕</span>새 루틴 추가
        </button>
      )}
      {/* 루틴이 없을 때 표시할 메시지 */}
      {routines.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🏋️</div>
          <p className="text-gray-500 text-sm">아직 운동 루틴이 없습니다.</p>
          <p className="text-gray-400 text-xs mt-1">
            위의 버튼을 클릭해서 새 루틴을 추가해보세요!
          </p>
        </div>
      )}{" "}
      {routines.map((r) => (
        <div
          key={r.routineNo}
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-4 h-4 rounded-full bg-teal-500 shadow-sm" />
            <h4 className="font-semibold text-gray-800">{r.name}</h4>
          </div>
          {r.description && (
            <p className="text-sm text-gray-600 mb-3">{r.description}</p>
          )}
          <div className="mb-4">
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {r.exerciseList}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              onClick={() => onStart?.(r)}
            >
              시작
            </button>
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => onEdit?.(r)}
            >
              수정
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoutineList;
