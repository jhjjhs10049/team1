import React, { useState } from "react";
import { createTrainerReview } from "../api/trainerApi.jsx";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const TrainerReviewForm = ({ trainerNo, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const { isLogin, loginState } = useCustomLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin || !loginState?.memberNo) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      setLoading(true);
      await createTrainerReview(trainerNo, {
        writerNo: Number(loginState.memberNo),
        score: rating,
        comment: content.trim(),
      });
      alert("리뷰가 등록되었습니다.");
      setContent("");
      setRating(5);
      onSubmitted?.();
    } catch (err) {
      console.error("[TrainerReviewForm] 저장 실패:", err);
      alert("리뷰 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-xl">✍️</span>
        리뷰 작성
      </h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">평점:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r}점
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          리뷰 내용:
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="트레이너에 대한 솔직한 리뷰를 작성해 주세요..."
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-medium rounded-lg disabled:cursor-not-allowed"
      >
        {loading ? "저장 중..." : "리뷰 제출"}
      </button>
    </form>
  );
};

export default TrainerReviewForm;
