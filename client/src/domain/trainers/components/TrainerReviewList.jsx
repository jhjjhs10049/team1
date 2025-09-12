import React from "react";
import { deleteTrainerReview } from "../api/trainerApi.jsx";
import { StarRating } from "../../gyms/components/ReviewList";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return String(value).replace("T", " ").slice(2, 16);
  }
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
};

const TrainerReviewList = ({
  trainerNo,
  reviews,
  onDeleted,
  currentUserRole,
}) => {
  const { loginState } = useCustomLogin();
  const memberNo = loginState?.memberNo;

  const canDelete = (r) => {
    if (!memberNo) return false;
    // ADMIN은 모두 가능, USER는 본인 리뷰만
    if (currentUserRole === "ADMIN") return true;
    return String(r.writerNo) === String(memberNo);
  };

  const handleDelete = async (reviewNo) => {
    if (!window.confirm("이 리뷰를 삭제하시겠습니까?")) return;
    try {
      await deleteTrainerReview(trainerNo, reviewNo, memberNo);
      alert("삭제되었습니다.");
      onDeleted?.();
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <p className="text-gray-500">등록된 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div
          key={r.reviewNo}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-teal-700">
                  {r.writerNickname?.charAt(0) || "?"}
                </span>
              </div>
              <strong className="text-gray-800 font-semibold">
                {r.writerNickname}
              </strong>
            </div>
            {canDelete(r) && (
              <button
                onClick={() => handleDelete(r.reviewNo)}
                className="bg-red-500 text-white text-sm px-3 py-1 rounded-md"
              >
                삭제
              </button>
            )}
          </div>

          <div className="mb-3">
            <span className="flex items-center gap-2">
              <StarRating score={r.score} />
              <span className="text-gray-600 font-medium">
                ({Number(r.score).toFixed(1)})
              </span>
            </span>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap mb-3 leading-relaxed">
            {r.comment}
          </p>

          <div className="text-right">
            <small className="text-gray-500 text-sm">
              {formatDate(r.createdDate)}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrainerReviewList;
