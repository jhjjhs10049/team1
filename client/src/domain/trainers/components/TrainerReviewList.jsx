import React from "react";
import { deleteTrainerReview } from "../api/trainerApi.jsx";
import { StarRating } from "../../gyms/components/ReviewList";

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

const TrainerReviewList = ({ trainerNo, reviews, onDeleted, currentUserRole }) => {
    const memberNo = localStorage.getItem("memberNo");

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
                        <strong>{r.writerNickname}</strong>
                        <span style={{ marginLeft: "auto" }}>
                            {canDelete(r) && (
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

export default TrainerReviewList;