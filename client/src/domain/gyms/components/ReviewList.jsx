import React, { useId } from "react";
import { deleteGymReview } from "../api/gymApi";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

// YYYY-MM-DD HH:mm
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return String(value).replace("T", " ").slice(2, 16); // 비상용
  }
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
};

// 별 아이콘들 (SVG)
const FullStar = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#FFD700"
      d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.782 1.402 8.171L12 18.896l-7.336 3.866 1.402-8.171L.132 9.209l8.2-1.193z"
    />
  </svg>
);

const EmptyStar = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#E0E0E0"
      d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.782 1.402 8.171L12 18.896l-7.336 3.866 1.402-8.171L.132 9.209l8.2-1.193z"
    />
  </svg>
);

// 반별: 좌측 50%만 금색, 우측은 회색
const HalfStar = ({ size = 18 }) => {
  const gradId = useId(); // 여러 개 렌더링 시 id 충돌 방지
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#E0E0E0" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.782 1.402 8.171L12 18.896l-7.336 3.866 1.402-8.171L.132 9.209l8.2-1.193z"
      />
    </svg>
  );
};

// 외부에서 재사용할 수 있게 export
export const StarRating = ({ score, size = 18 }) => {
  // 안전 가드 + 반올림 로직
  const s = Math.max(0, Math.min(5, Number(score) || 0));
  const full = Math.floor(s);
  const half = s - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    <span className="inline-flex gap-0.5 items-center">
      {Array.from({ length: full }).map((_, i) => (
        <FullStar key={`f-${i}`} size={size} />
      ))}
      {half === 1 && <HalfStar size={size} />}
      {Array.from({ length: empty }).map((_, i) => (
        <EmptyStar key={`e-${i}`} size={size} />
      ))}
    </span>
  );
};

const ReviewList = ({ reviews, gymNo, onDeleted }) => {
  const { loginState } = useCustomLogin();
  const memberNo = loginState?.memberNo;

  const handleDelete = async (reviewNo) => {
    if (!window.confirm("이 리뷰를 삭제하시겠습니까?")) return;
    try {
      await deleteGymReview(gymNo, reviewNo, memberNo);
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
                  {r.writerName?.charAt(0) || "?"}
                </span>
              </div>
              <strong className="text-gray-800 font-semibold">
                {r.writerName}
              </strong>
            </div>
            {String(r.writerNo) === String(memberNo) && (
              <button
                onClick={() => handleDelete(r.reviewNo)}
                className="bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
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

export default ReviewList;
