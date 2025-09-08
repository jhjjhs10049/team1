import React from "react";

const TrainerProfile = ({ trainer }) => {
    if (!trainer) return null;

    return (
        <div style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "1.5rem",
            backgroundColor: "#fff"
        }}>
            <h2>{trainer.name}</h2>
            <p><strong>전문 분야:</strong> {trainer.specialty}</p>
            <p>{trainer.description || "자기소개가 없습니다."}</p>
        </div>
    );
};

export default TrainerProfile;
