// MapSidebar.jsx
import React from "react";

const MapSidebar = ({
  searchTerm,
  setSearchTerm,
  onlyInRadius,
  setOnlyInRadius,
  showRadius,
  setShowRadius,
  radius,
  setRadius,
  userPos,
  mapRef,
  filteredGyms,
  sortedGyms,
  selectFromList,
  SIDEBAR_WIDTH,
  onClose,
}) => {
  return (
    <aside
      className="border-r border-gray-200 bg-white flex flex-col shadow-sm h-full"
      style={{ width: `${SIDEBAR_WIDTH}px` }}
    >
      {/* 모바일 헤더 (닫기 버튼) */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">헬스장 검색</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {/* 검색 */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="헬스장 검색"
            className="w-full py-3 pr-10 pl-4 text-sm border border-gray-300 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-3 focus:ring-teal-500/10"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 border-0 bg-transparent cursor-pointer text-gray-500 text-base"
              onClick={() => setSearchTerm("")}
            >
              ❌
            </button>
          )}
        </div>
      </div>
      {/* 필터 */}
      <div className="p-4 border-b border-gray-100 text-sm">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={onlyInRadius}
            onChange={(e) => {
              const checked = e.target.checked;
              setOnlyInRadius(checked);
              setShowRadius(checked);
            }}
            className="w-4 h-4 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
          />
          반경 내만
        </label>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            value={radius}
            onChange={(e) =>
              setRadius(Math.max(Number(e.target.value || 0), 10))
            }
            min={10}
            step={10}
            className="w-30 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 transition-all duration-200 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-3 focus:ring-teal-500/10"
          />
          <span className="text-gray-600 font-medium">m</span>
          <button
            className="px-3 py-2 border border-gray-300 bg-white rounded-lg cursor-pointer text-gray-700 transition-all duration-200 hover:border-teal-500 hover:text-teal-500 hover:bg-teal-50"
            onClick={() => setShowRadius((v) => !v)}
          >
            {showRadius ? "반경 숨기기" : "반경 표시"}
          </button>
        </div>
        <button
          className="mt-2 w-full px-4 py-2 border-0 rounded-lg cursor-pointer font-medium text-sm transition-all duration-200 inline-flex items-center justify-center gap-1 text-center bg-teal-500 text-white hover:bg-teal-600 hover:-translate-y-px hover:shadow-lg hover:shadow-teal-500/30"
          onClick={() =>
            userPos && mapRef.current && mapRef.current.setCenter(userPos)
          }
        >
          📍 내 위치로
        </button>
      </div>
      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredGyms.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            검색 결과가 없습니다.
          </div>
        )}
        <div className="space-y-3">
          {sortedGyms.map((g) => (
            <div
              key={g.gymNo}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:border-teal-500 hover:shadow-md hover:-translate-y-0.5"
              onClick={() => {
                selectFromList(g);
                // 모바일에서 헬스장 선택 시 사이드바 닫기
                if (onClose && window.innerWidth < 1024) {
                  onClose();
                }
              }}
            >
              <div className="font-semibold text-gray-800 mb-1 text-sm">
                {g.name}
              </div>
              <div className="text-xs text-gray-600 mb-2 leading-relaxed">
                {g.address}
              </div>
              <div className="text-xs text-teal-600 font-medium">
                {Math.round(g._dist)}m 거리
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default MapSidebar;
