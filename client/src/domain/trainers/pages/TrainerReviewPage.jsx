import React, { useEffect, useState } from "react";
import BasicLayout from "../../../layouts/BasicLayout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchTrainerDetail, fetchTrainerReviews } from "../api/trainerApi.jsx";
import TrainerReviewList from "../components/TrainerReviewList";
import TrainerReviewForm from "../components/TrainerReviewForm";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const normalize = (r) => {
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.content)) return r.content;
    if (Array.isArray(r?.reviews)) return r.reviews;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r?.items)) return r.items;
    return [];
};

const TrainerReviewPage = () => {
    const { trainerno } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isLogin, loginState } = useCustomLogin();

    const [trainer, setTrainer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const currentUserRole = loginState?.roleNames?.[0] || "USER";

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setErr("");
                const id = Number(trainerno);
                if (!Number.isFinite(id)) {
                    setErr("잘못된 경로입니다.");
                    return;
                }
                const t = await fetchTrainerDetail(id);
                if (!alive) return;
                setTrainer(t);

                const raw = await fetchTrainerReviews(id);
                if (!alive) return;
                setReviews(normalize(raw));
            } catch (e) {
                console.error("[TrainerReviewPage] load error:", e);
                setErr("데이터를 불러오지 못했습니다.");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => (alive = false);
    }, [trainerno]);

    const goLoginWithRedirect = () => {
        const redirect = encodeURIComponent(location.pathname + location.search);
        navigate(`/member/login?redirect=${redirect}`);
    };

    if (loading) return <div>로딩 중...</div>;
    if (err) return <div>{err}</div>;
    if (!trainer) return <div>트레이너 정보가 없습니다.</div>;

    return (
        <BasicLayout>
            <div style={styles.container}>
                <h1>{trainer.name} 리뷰</h1>

                <TrainerReviewList
                    trainerNo={trainer.trainerNo}
                    reviews={reviews}
                    currentUserRole={currentUserRole}
                    onDeleted={() => {
                        fetchTrainerReviews(trainer.trainerNo).then((raw) =>
                            setReviews(normalize(raw))
                        );
                    }}
                />

                <hr style={{ margin: "2rem 0" }} />

                <div style={styles.formBox}>
                    {isLogin ? (
                        <TrainerReviewForm
                            trainerNo={trainer.trainerNo}
                            onSubmitted={() => {
                                fetchTrainerReviews(trainer.trainerNo).then((raw) =>
                                    setReviews(normalize(raw))
                                );
                            }}
                        />
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <p style={{ marginBottom: "0.75rem" }}>
                                리뷰를 작성하려면 로그인이 필요합니다.
                            </p>
                            <button
                                onClick={goLoginWithRedirect}
                                style={styles.loginBtn}
                            >
                                로그인하고 리뷰 작성하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </BasicLayout>
    );
};

const styles = {
    container: { maxWidth: 700, margin: "0 auto", padding: "2rem" },
    formBox: {
        border: "2px solid black",
        borderRadius: 8,
        padding: "1rem",
        transition: "all 0.2s ease",
    },
    loginBtn: {
        padding: "0.6rem 1rem",
        backgroundColor: "#3F75FF",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
    },
};

export default TrainerReviewPage;