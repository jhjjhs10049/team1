import React, { useEffect, useState } from "react";
import { fetchFavoriteGyms } from "../api/gymApi";
import { useNavigate, useLocation } from "react-router-dom";
import { StarRating } from "../components/ReviewList";
import BasicLayout from "../../../layouts/BasicLayout";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const FavoriteGymsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLogin, loginState } = useCustomLogin();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("FavoriteGymsPage: useEffect 실행");
        console.log("FavoriteGymsPage: useCustomLogin:", { isLogin, loginState });

        if (!isLogin || !loginState?.memberNo) {
            console.warn("FavoriteGymsPage: 인증 정보 부족 → 로그인 페이지로 이동");
            alert("로그인 후 이용 가능합니다.");
            navigate("/member/login");
            return;
        }

        setLoading(true);
        fetchFavoriteGyms(loginState.memberNo)
            .then((data) => {
                console.log("FavoriteGymsPage: 즐겨찾기 목록 데이터", data);
                setFavorites(data);
            })
            .catch((err) => {
                console.error("FavoriteGymsPage: 즐겨찾기 호출 오류", err);
                if (err.response?.status === 401) {
                    setError("권한이 없습니다. 다시 로그인해 주세요.");
                    navigate("/member/login");
                } else {
                    setError("즐겨찾기 목록을 불러오는 데 실패했습니다.");
                }
            })
            .finally(() => {
                console.log("FavoriteGymsPage: 로딩 완료");
                setLoading(false);
            });
    }, [navigate, location.key, isLogin, loginState?.memberNo]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>오류: {error}</div>;

    return (
        <BasicLayout>
            <div style={styles.container}>
                <h1 style={styles.title}>⭐ 나의 즐겨찾기</h1>
                {favorites.length === 0 ? (
                    <div style={styles.empty}>즐겨찾기한 헬스장이 없습니다.</div>
                ) : (
                    <ul style={styles.list}>
                        {favorites.map((gym) => (
                            <li
                                key={gym.gymNo}
                                style={styles.item}
                                onClick={() => navigate(`/gyms/${gym.gymNo}`)}
                            >
                                <img
                                    src={gym.imageUrl || "https://via.placeholder.com/150"}
                                    alt={gym.title}
                                    style={styles.image}
                                />
                                <div style={styles.content}>
                                    <div style={styles.titleRow}>
                                        <h3 style={styles.gymTitle}>{gym.title}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <StarRating score={gym.rate} size={14} />
                                            <span style={styles.rateText}>({Number(gym.rate).toFixed(1)})</span>
                                        </div>
                                    </div>
                                    <p style={styles.address}>{gym.address}</p>
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
    container: {
        maxWidth: "500px",
        margin: "0 auto",
        padding: "1.5rem",
        fontFamily: "sans-serif",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: "1.8rem",
        marginBottom: "1.5rem",
        textAlign: "center",
        color: "#333",
    },
    list: { listStyle: "none", padding: 0 },
    item: {
        display: "flex",
        alignItems: "center",
        padding: "1rem",
        border: "1px solid #eee",
        borderRadius: "8px",
        marginBottom: "1rem",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    },
    image: {
        width: "80px",
        height: "80px",
        borderRadius: "8px",
        objectFit: "cover",
        marginRight: "1rem",
    },
    content: { flex: 1 },
    titleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "5px",
    },
    gymTitle: { fontSize: "1.1rem", margin: 0, fontWeight: "bold" },
    rateText: { fontSize: "0.9rem", color: "#777" },
    address: { margin: 0, fontSize: "0.9rem", color: "#555" },
    empty: { textAlign: "center", padding: "2rem", color: "#888", fontSize: "1.1rem" },
};

export default FavoriteGymsPage;