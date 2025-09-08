import React, { useState } from "react";
import { createGymReview } from "../api/gymApi";

const ReviewForm = ({ gymNo, disabled, onSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const memberNo = localStorage.getItem("memberNo");
    const memberName = localStorage.getItem("memberName");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (disabled || !memberNo || !memberName) { // memberName 체크 로직 추가
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            setLoading(true);
            await createGymReview(gymNo, {
                writerNo: Number(memberNo),
                writerName: memberName, // <-- 이 줄을 추가합니다.
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
        <form onSubmit={handleSubmit}>
            <h3>리뷰 작성</h3>
            <div style={{ marginBottom: "1rem" }}>
                <label>평점: </label>
                <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    disabled={disabled}
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
                disabled={disabled}
            />
            <button
                type="submit"
                disabled={disabled || loading}
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

export default ReviewForm;