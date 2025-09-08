import React, { useState } from "react";
import { createTrainerReview } from "../api/trainerApi.jsx";

const TrainerReviewForm = ({ trainerNo, onSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const memberNo = localStorage.getItem("memberNo");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!memberNo) {
            alert("로그인이 필요합니다.");
            return;
        }
        try {
            setLoading(true);
            await createTrainerReview(trainerNo, {
                writerNo: Number(memberNo),
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
        <form onSubmit={handleSubmit}>
            <h3>리뷰 작성</h3>
            <div style={{ marginBottom: "1rem" }}>
                <label>평점: </label>
                <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    disabled={loading}
                >
                    {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                            {r}점
                        </option>
                    ))}
                </select>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                style={{ width: "100%", marginBottom: "1rem" }}
                placeholder="리뷰 내용을 입력하세요..."
                required
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3F75FF",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
            >
                {loading ? "저장 중..." : "리뷰 제출"}
            </button>
        </form>
    );
};

export default TrainerReviewForm;