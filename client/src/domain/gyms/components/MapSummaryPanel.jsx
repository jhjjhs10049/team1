// MapSummaryPanel.jsx
import React from "react";
import GymDetailComponent from "./GymDetailComponent.jsx";

const MapSummaryPanel = ({
  selectedLoading,
  selectedError,
  selectedGym,
  showDetail,
  setShowDetail,
  safe,
  clip,
  openKakaoRouteToSelected,
  setSelectedGym,
  setActivePanel,
  detailIsFavorite,
  detailFavoriteCount,
  handleToggleFavoriteInSummary,
  navigate,
  openTrainerPanel,
  openReviewPanel,
}) => {
  // 패널을 표시할 조건: 로딩 중이거나, 에러가 있거나, 선택된 헬스장이 있을 때
  const shouldShowPanel = selectedLoading || selectedError || selectedGym;

  if (!shouldShowPanel) {
    return null;
  }
  return (
    <div className="absolute top-5 left-5 w-[480px] z-20 bg-white shadow-lg rounded-lg p-4">
      {selectedLoading && (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
          요약 불러오는 중...
        </div>
      )}
      {selectedError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {selectedError}
        </div>
      )}
      {selectedGym && !selectedLoading && !selectedError && (
        <div
          className={`bg-white rounded-lg ${
            showDetail ? "max-h-[700px] overflow-hidden flex flex-col" : ""
          }`}
        >
          {/* 헤더 - 고정 */}
          <div
            className={`flex items-center justify-between mb-4 pb-3 border-b border-gray-200 ${
              showDetail ? "sticky top-0 bg-white z-10 rounded-t-lg" : ""
            }`}
          >
            <div className="text-xl font-semibold text-gray-800">
              {safe(selectedGym.title || selectedGym.name, "이름 없음")}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 text-sm font-medium"
                onClick={openKakaoRouteToSelected}
                title="길찾기"
              >
                길찾기
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => {
                  setSelectedGym(null);
                  setShowDetail(false);
                  setActivePanel(null);
                }}
                title="닫기"
              >
                ✖
              </button>
            </div>
          </div>
          {/* 간단 보기 */}
          {!showDetail && (
            <>
              <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                평점:
                {Number.isFinite(selectedGym.rate)
                  ? Number(selectedGym.rate).toFixed(1)
                  : "0.0"}
                / 5
                {typeof selectedGym.favoriteCount === "number"
                  ? ` · ⭐ ${selectedGym.favoriteCount}`
                  : ""}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📍</span>
                  <span>{safe(selectedGym.address)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📞</span>
                  <span>{safe(selectedGym.phoneNumber)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>🕒</span>
                  <span>{safe(selectedGym.openingHours)}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4 leading-relaxed">
                {clip(selectedGym.content, 120)}
              </div>
              <div className="flex">
                <button
                  className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                  onClick={() => setShowDetail(true)}
                >
                  상세 보기
                </button>
              </div>
            </>
          )}
          {/* 상세 보기 */}
          {showDetail && (
            <div className="flex-1 overflow-y-auto">
              <GymDetailComponent
                gym={selectedGym}
                isFavorite={detailIsFavorite}
                favoriteCount={detailFavoriteCount}
                onToggleFavorite={handleToggleFavoriteInSummary}
                compact={true}
                onClose={() => setShowDetail(false)}
                navigate={navigate}
                onTrainerClick={(t) => openTrainerPanel(t.trainerNo)}
              />
              <div className="flex flex-col gap-2 mt-4 p-4 bg-white border-t border-gray-200 sticky bottom-0">
                {/* 첫 번째 줄: 상세 페이지로 이동 */}
                <button
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                  onClick={() => navigate(`/gyms/detail/${selectedGym.gymNo}`)}
                  title="독립 페이지에서 보기"
                >
                  <span>상세 페이지로 이동</span>
                  <span>→</span>
                </button>
                {/* 두 번째 줄: 리뷰와 등록하기 */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    onClick={() => openReviewPanel(selectedGym.gymNo)}
                  >
                    💬 리뷰 전체 보기
                  </button>
                  <button
                    className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                    onClick={() =>
                      navigate(`/gyms/purchase/${selectedGym.gymNo}`)
                    }
                    title="결제 페이지로 이동"
                  >
                    등록하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapSummaryPanel;
