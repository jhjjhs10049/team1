// MapTrainerPanel.jsx
import React from "react";

const MapTrainerPanel = ({
  trainerDetail,
  trainerLoading,
  trainerError,
  trainerReviews,
  navigate,
  closePanel,
}) => {
  return (
    <div className="absolute top-5 left-5 w-[480px] z-20">
      <div className="bg-white shadow-lg rounded-lg max-h-[500px] overflow-hidden flex flex-col">
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
          <div className="text-lg font-semibold text-gray-800">
            💪 {trainerDetail?.name || "트레이너"}
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={closePanel}
            title="닫기"
          >
            ✖
          </button>
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4">
          {trainerLoading && (
            <div className="text-center text-gray-600">불러오는 중...</div>
          )}
          {trainerError && !trainerLoading && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {trainerError}
            </div>
          )}

          {!trainerLoading && !trainerError && trainerDetail && (
            <>
              {Number.isFinite(trainerDetail.rate) && (
                <div className="text-sm text-gray-600 mb-3">
                  평균 평점: {Number(trainerDetail.rate).toFixed(1)} / 5
                </div>
              )}
              {trainerDetail.specialty && (
                <div className="text-sm text-gray-700 mb-2">
                  전문 분야: {trainerDetail.specialty}
                </div>
              )}
              {(trainerDetail.gym?.gymNo || trainerDetail.gymNo) && (
                <div className="text-sm text-gray-700 mb-2">
                  소속:&nbsp;
                  <button
                    className="text-teal-600 hover:text-teal-700 underline"
                    onClick={() =>
                      navigate(
                        `/gyms/detail/${
                          trainerDetail.gym?.gymNo || trainerDetail.gymNo
                        }`
                      )
                    }
                  >
                    {trainerDetail.gym?.title ||
                      trainerDetail.gymTitle ||
                      `GYM #${trainerDetail.gym?.gymNo || trainerDetail.gymNo}`}
                    →
                  </button>
                </div>
              )}
              {trainerDetail.description && (
                <div className="text-sm text-gray-600 mb-4 leading-relaxed whitespace-pre-wrap">
                  {trainerDetail.description}
                </div>
              )}
              <div className="text-sm font-bold text-gray-800 mt-3 mb-2">
                최근 리뷰
              </div>
              {trainerReviews.length > 0 ? (
                trainerReviews.slice(0, 3).map((r) => (
                  <div
                    key={r.reviewNo}
                    className="p-3 bg-gray-50 rounded-lg mb-2"
                  >
                    <div className="font-semibold text-sm text-gray-800">
                      {r.writerNickname || r.writerName || "익명"} · ★
                      {Number(r.score).toFixed(1)}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {r.comment}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  등록된 리뷰가 없습니다.
                </div>
              )}
              <div className="mt-4">
                <button
                  className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                  onClick={() =>
                    navigate(`/trainers/review/${trainerDetail.trainerNo}`)
                  }
                >
                  리뷰 더 보기/작성
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapTrainerPanel;
