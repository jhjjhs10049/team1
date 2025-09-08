import React, { useEffect, useState } from "react";
import BasicLayout from "../../../layouts/BasicLayout";
import { fetchTrainers } from "../api/trainerApi.jsx";
import { useNavigate } from "react-router-dom";
import { API_SERVER_HOST } from "../../global/api/axios";

const TrainerListPage = () => {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const data = await fetchTrainers();
                if (!alive) return;
                setTrainers(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("[TrainerListPage] load error:", e);
                setErr("트레이너 목록을 불러오지 못했습니다.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => (alive = false);
    }, []);

    if (loading) return <div>로딩 중...</div>;
    if (err) return <div>{err}</div>;

    return (
        <BasicLayout>
            <div style={styles.container}>
                <h1 style={styles.title}>트레이너 목록</h1>
                {trainers.length === 0 ? (
                    <div style={styles.empty}>등록된 트레이너가 없습니다.</div>
                ) : (
                    <ul style={styles.list}>
                        {trainers.map((t) => (
                            <li
                                key={t.trainerNo}
                                style={styles.item}
                                onClick={() => navigate(`/trainers/${t.trainerNo}`)}
                            >
                                <img
                                    src={
                                        t.photo
                                            ? `${API_SERVER_HOST}/api/files/view/${encodeURIComponent(t.photo)}`
                                            : "https://via.placeholder.com/120"
                                    }
                                    alt={t.name}
                                    style={styles.image}
                                />
                                <div style={styles.content}>
                                    <div style={styles.titleRow}>
                                        <h3 style={styles.trainerName}>{t.name}</h3>
                                    </div>
                                    <p style={styles.meta}>
                                        전문분야: {t.specialty || "-"}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </BasicLayout>
    );
};

const styles = {
    container: { maxWidth: 800, margin: "0 auto", padding: "1.5rem" },
    title: { fontSize: "1.8rem", marginBottom: "1.2rem" },
    list: { listStyle: "none", padding: 0 },
    item: {
        display: "flex",
        alignItems: "center",
        padding: "1rem",
        border: "1px solid #eee",
        borderRadius: "8px",
        marginBottom: "1rem",
        cursor: "pointer",
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 8,
        objectFit: "cover",
        marginRight: "1rem",
    },
    content: { flex: 1 },
    titleRow: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    trainerName: { margin: 0, fontWeight: "bold" },
    meta: { margin: "6px 0 0", color: "#555" },
    empty: { textAlign: "center", padding: "2rem", color: "#888" },
};

export default TrainerListPage;