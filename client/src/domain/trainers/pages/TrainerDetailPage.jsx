import React, { useEffect, useState } from "react";
import BasicLayout from "../../../layouts/BasicLayout";
import { fetchTrainerDetail, fetchTrainerReviews } from "../api/trainerApi.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { API_SERVER_HOST } from "../../global/api/axios";

const TrainerDetailPage = () => {
    const { trainerno } = useParams();
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const id = Number(trainerno);
                if (!Number.isFinite(id)) {
                    setErr("잘못된 경로입니다.");
                    return;
                }

                // 상세 정보
                const data = await fetchTrainerDetail(id);
                if (!alive) return;
                setTrainer(data);

                // 리뷰 목록 (대표 몇 개만 보여줄 예정)
                const reviewList = await fetchTrainerReviews(id);
                if (alive) setReviews(Array.isArray(reviewList) ? reviewList : []);
            } catch (e) {
                console.error("[TrainerDetailPage] load error:", e);
                setErr("트레이너 정보를 불러오지 못했습니다.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => (alive = false);
    }, [trainerno]);

    if (loading) return <div>로딩 중...</div>;
    if (err) return <div>{err}</div>;
    if (!trainer) return <div>트레이너 정보가 없습니다.</div>;

    // 안전가드
    const photo = trainer.photo
        ? `${API_SERVER_HOST}/api/files/view/${encodeURIComponent(trainer.photo)}`
        : "https://via.placeholder.com/600x360?text=Trainer";
    const name = trainer.name || "이름 미상";
    const specialty = trainer.specialty || "";
    const gymNo = trainer.gymNo ?? trainer.gym?.gymNo ?? null;
    const gymTitle = trainer.gymTitle ?? trainer.gym?.title ?? "";
    const safeRate = Number.isFinite(trainer.rate) ? trainer.rate : null;

    const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    const goReviews = () => navigate(`/trainers/${trainer.trainerNo}/reviews`);
    const goGym = () => {
        if (!gymNo) return;
        navigate(`/gyms/${gymNo}`);
    };

    return (
        <BasicLayout>
            <div style={styles.container}>
                {/* 히어로 이미지 */}
                <div style={styles.hero}>
                    <img src={photo} alt={name} style={styles.heroImg} />
                </div>

                {/* 상단 타이틀/메타 */}
                <div style={styles.header}>
                    <div style={{ flex: 1 }}>
                        <h1 style={styles.title}>{name}</h1>

                        {specialty && (
                            <div style={styles.tagRow}>
                                {specialty.split(",").map((s, idx) => (
                                    <span key={idx} style={styles.tag}>
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        {gymNo && (
                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>소속 헬스장</span>
                                <button onClick={goGym} style={styles.linkBtn} title="헬스장 상세로 이동">
                                    {gymTitle || `GYM #${gymNo}`} →
                                </button>
                            </div>
                        )}

                        {safeRate !== null && (
                            <div style={{ marginTop: 6, color: "#555", fontSize: "0.95rem" }}>
                                평균 평점: <strong>{safeRate.toFixed(1)}</strong> / 5
                            </div>
                        )}
                    </div>
                </div>

                {/* 간단 소개 */}
                {trainer.description && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>소개</h3>
                        <p style={styles.paragraph}>{trainer.description}</p>
                    </div>
                )}

                {/* ⭐ 리뷰 섹션 */}
                <div style={{ marginTop: "2rem" }}>
                    <h3 style={styles.sectionTitle}>💬 대표 리뷰</h3>
                    {reviews.length > 0 ? (
                        reviews.slice(0, 3).map((r) => (
                            <div key={r.reviewNo} style={styles.reviewCard}>
                                <div style={{ fontWeight: "bold" }}>{r.writerName || "익명"} 님</div>
                                <div style={{ marginTop: 4, fontSize: "0.9rem", color: "#666" }}>
                                    {r.comment || ""}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "#888" }}>등록된 리뷰가 없습니다.</p>
                    )}
                </div>

                {/* 하단 버튼들 */}
                <div style={styles.buttonRow}>
                    <button style={styles.button} onClick={goReviews}>📝 리뷰 보기/쓰기</button>
                    <button style={styles.button} onClick={goTop}>⬆️ 맨 위로</button>
                </div>
            </div>
        </BasicLayout>
    );
};

const styles = {
    container: {
        maxWidth: "720px", margin: "0 auto", padding: "1.5rem", fontFamily: "sans-serif",
        border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.05)", backgroundColor: "#fff"
    },
    hero: { width: "100%", height: 260, borderRadius: 12, overflow: "hidden", marginBottom: "1rem", background: "#f3f4f6" },
    heroImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    header: { display: "flex", gap: 16, alignItems: "flex-start", marginBottom: "1rem" },
    title: { margin: 0, fontSize: "1.6rem" },
    tagRow: { display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" },
    tag: {
        fontSize: "0.85rem", padding: "4px 8px", background: "#e3f2fd", color: "#1e88e5",
        borderRadius: 999, border: "1px solid #90caf9"
    },
    metaRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 10 },
    metaLabel: { color: "#666", fontSize: "0.95rem" },
    linkBtn: {
        padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6,
        background: "#fafafa", cursor: "pointer", fontSize: "0.95rem"
    },
    section: { marginTop: "1.5rem" },
    sectionTitle: { margin: "0 0 0.5rem", fontSize: "1.1rem" },
    paragraph: { margin: 0, lineHeight: 1.6, color: "#333" },
    reviewCard: {
        border: "1px solid #ddd", borderRadius: "8px", padding: "10px", marginBottom: "10px",
        backgroundColor: "#fafafa", fontSize: "0.95rem"
    },
    buttonRow: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: "1.5rem" },
    button: {
        flex: 1, padding: "10px", fontSize: "0.95rem", border: "none", borderRadius: "6px",
        backgroundColor: "#3F75FF", color: "#fff", cursor: "pointer"
    },
};

export default TrainerDetailPage;