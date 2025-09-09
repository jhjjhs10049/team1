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
    <span style={{ display: "inline-flex", gap: 2, verticalAlign: "middle" }}>
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
    return <p>등록된 리뷰가 없습니다.</p>;
  }

  return (
    <div>
      {reviews.map((r) => (
        <div
          key={r.reviewNo}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <strong>{r.writerName}</strong>
            <span style={{ marginLeft: "auto" }}>
              {String(r.writerNo) === String(memberNo) && (
                <button
                  onClick={() => handleDelete(r.reviewNo)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 6px",
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              )}
            </span>
          </div>

          <div style={{ marginTop: 4 }}>
            <span>
              <StarRating score={r.score} /> ({Number(r.score).toFixed(1)})
            </span>
          </div>

          <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.comment}</p>
          <small style={{ color: "#666" }}>{formatDate(r.createdDate)}</small>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
