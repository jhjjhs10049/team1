import React from "react";

const TrainerReviewSummary = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <p>아직 리뷰가 없습니다.</p>;
    }

    const avgRating = (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    ).toFixed(1);

    const topReview = reviews[0]; // 예시로 첫 번째만

    return (
        <div style={{
            borderTop: "1px solid #eee",
            paddingTop: "1rem"
        }}>
            <h3>리뷰 요약</h3>
            <p>⭐ 평균 평점: {avgRating} / 5</p>
            <div style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.75rem",
                backgroundColor: "#fafafa",
                marginTop: "1rem"
            }}>
                <strong>{topReview.writer}</strong> — ★{topReview.rating}<br />
                <span>{topReview.content}</span>
            </div>
        </div>
    );
};

export default TrainerReviewSummary;