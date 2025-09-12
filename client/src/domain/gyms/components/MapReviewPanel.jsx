// MapReviewPanel.jsx
import React from "react";
import ReviewList from "./ReviewList.jsx";
import ReviewForm from "./ReviewForm.jsx";

const MapReviewPanel = ({ selectedGym, closePanel, reviews, loadReviews }) => {
  return (
    <div className="absolute top-5 left-5 w-[480px] z-20">
      <div className="bg-white shadow-lg rounded-lg max-h-[500px] overflow-hidden flex flex-col">
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
          <div className="text-lg font-semibold text-gray-800">
            💬 {selectedGym.title || selectedGym.name} 리뷰
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
          <ReviewList
            reviews={reviews}
            gymNo={selectedGym.gymNo}
            onDeleted={() => loadReviews(selectedGym.gymNo)}
          />
          <hr className="my-4 border-gray-200" />
          <ReviewForm
            gymNo={selectedGym.gymNo}
            onSubmitted={() => loadReviews(selectedGym.gymNo)}
          />
        </div>
      </div>
    </div>
  );
};

export default MapReviewPanel;
