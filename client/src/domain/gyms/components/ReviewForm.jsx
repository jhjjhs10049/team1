import React, { useState } from "react";
import { createGymReview } from "../api/gymApi";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const ReviewForm = ({ gymNo, disabled, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLogin, loginState } = useCustomLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled || !isLogin || !loginState?.memberNo) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      setLoading(true);
      await createGymReview(gymNo, {
        writerNo: Number(loginState.memberNo),
        writerName: loginState.nickname,
        score: rating,
        comment: content.trim(),
      });

      setContent("");
      setRating(5);
      alert("리뷰가 등록되었습니다.");
      onSubmitted?.();
    } catch (err) {
      console.error("[ReviewForm] 저장 실패:", err);
      alert("리뷰 저장 실패");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <span className="text-xl">✍️</span>
        리뷰 작성
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            평점
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r}점
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            리뷰 내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="리뷰 내용을 입력하세요..."
            required
            disabled={disabled}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || loading}
        className="w-full px-4 py-3 bg-teal-500 text-white border-0 rounded-lg cursor-pointer hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "저장 중..." : "리뷰 제출"}
      </button>
    </form>
  );
};

export default ReviewForm;
