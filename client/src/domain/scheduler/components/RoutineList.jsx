const RoutineList = ({ routines, onStart, onEdit }) => {
  return (
    <div className="space-y-4">
      {routines.map((r) => (
        <div
          key={r.key}
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-4 h-4 rounded-full ${r.color} shadow-sm`} />
            <h4 className="font-semibold text-gray-800">{r.name}</h4>
          </div>
          <ul className="space-y-1 mb-4">
            {r.items.map((it, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-700 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                {it}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            {" "}
            <button
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              onClick={() => onStart?.(r)}
            >
              시작
            </button>{" "}
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
