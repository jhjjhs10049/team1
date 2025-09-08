import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGymDetail, toggleFavorite } from "../api/gymApi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { StarRating } from "../components/ReviewList";
import BasicLayout from "../../../layouts/BasicLayout";
import { ProtectedButton } from "../../../common/config/ProtectedLogin";
import { API_SERVER_HOST } from "../../global/api/axios";

const GymDetailPage = () => {
  const { gymno } = useParams();
  const navigate = useNavigate();

  const [gym, setGym] = useState(null);
  const [images, setImages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const handleGoReviews = () => navigate(`/gyms/${gym.gymNo}/reviews`);

  // ProtectedButton으로 로그인 체크를 위임했으므로,
  // 핸들러 함수에서는 로그인 체크 로직을 제거합니다.
  const handleToggleFavorite = () => {
    const memberNo = localStorage.getItem("memberNo"); // 회원 번호 가져오기

    // memberNo가 없으면 API 호출하지 않고 종료 (ProtectedButton이 이미 로그인 체크를 했으므로 발생 가능성 낮음)
    if (!memberNo) {
      alert("회원 정보가 없습니다.");
      return;
    }

    toggleFavorite(gym.gymNo, memberNo, !isFavorite)
      .then((data) => {
        setIsFavorite(data.isFavorite);
        setFavoriteCount(data.favoriteCount);
      })
      .catch((err) => {
        console.error(err);
        alert("즐겨찾기 상태 변경 중 오류가 발생했습니다.");
      });
  };

  useEffect(() => {
    let mounted = true;
    const id = Number(gymno);
    if (!id) {
      setError("잘못된 경로입니다.");
      setLoading(false);
      return;
    }

    const memberNo = localStorage.getItem("memberNo");

    setLoading(true);
    setError("");

    fetchGymDetail(id, memberNo)
      .then((data) => {
        if (!mounted) return;
        setGym(data);
        setImages(Array.isArray(data.imageList) ? data.imageList : []);
        setTrainers(Array.isArray(data.trainers) ? data.trainers : []);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setIsFavorite(Boolean(data.isFavorite));
        setFavoriteCount(data.favoriteCount ?? 0);
      })
      .catch((e) => {
        if (!mounted) return;
        console.error(e);
        if (e?.response?.status === 404) setError("해당 헬스장을 찾을 수 없습니다.");
        else if (e?.response?.status === 401) setError("권한이 없습니다. 로그인 후 다시 시도하세요.");
        else setError("헬스장 정보를 불러오지 못했습니다.");
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [gymno]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!gym) return <div>데이터가 없습니다.</div>;

  const safeRate = Number.isFinite(gym.rate) ? gym.rate : 0;

  return (
    <BasicLayout>
      <div style={styles.container}>
        {/* 이미지 슬라이드 */}
        {images.length > 0 ? (
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={10}
            slidesPerView={1}
            style={styles.swiper}
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img.startsWith("http") ? img : `${API_SERVER_HOST}/api/files/view/${encodeURIComponent(img)}`}
                  alt={`gym-img-${idx}`}
                  style={styles.img}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p>등록된 이미지가 없습니다.</p>
        )}

        {/* 타이틀 + 관심표시 */}
        <div style={styles.titleRow}>
          <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{gym.title}</h2>
          {/* ProtectedButton으로 즐겨찾기 버튼 감싸기 */}
          <ProtectedButton
            onClick={handleToggleFavorite}
            redirectMessage="즐겨찾기 기능은 로그인 후 이용 가능합니다."
            style={styles.favoriteIcon}
            title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 등록"}
          >
            {isFavorite ? "⭐" : "☆"} {favoriteCount}
          </ProtectedButton>
        </div>

        {/* 기본 정보 */}
        <div style={styles.infoBlock}>
          <p><strong>📍 주소:</strong> {gym.address || "정보 없음"}</p>
          <p><strong>📞 전화번호:</strong> {gym.phoneNumber || "정보 없음"}</p>
          <p><strong>🕒 운영시간:</strong> {gym.openingHours || "정보 없음"}</p>
          <p>
            <strong>🏋️ 부대시설:</strong>{" "}
            {Array.isArray(gym.facilities) && gym.facilities.length > 0
              ? gym.facilities.join(", ")
              : "없음"}
          </p>
        </div>

        {/* 평점: 반별 포함 */}
        <div style={styles.rateRow}>
          <StarRating score={safeRate} size={18} />
          <span style={styles.rateText}>({safeRate.toFixed(1)}/5)</span>
        </div>

        {/* 설명 */}
        <p style={styles.description}>{gym.content || ""}</p>

        {/* 대표 리뷰 */}
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>💬 대표 리뷰</h3>
          {reviews.length > 0 ? (
            reviews.slice(0, 3).map((r) => (
              <div key={r.reviewNo} style={styles.reviewCard}>
                <div style={{ fontWeight: "bold" }}>{r.writerName || "익명"} 님</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <StarRating score={r.score} size={16} />
                  <span style={{ color: "#666", fontSize: 13 }}>
                    ({Number(r.score).toFixed(1)})
                  </span>
                </div>
                <div style={{ marginTop: 6 }}>
                  {(r.comment || "").length > 60 ? `${r.comment.slice(0, 60)}...` : (r.comment || "")}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888" }}>등록된 리뷰가 없습니다.</p>
          )}
        </div>

        {/* 트레이너 */}
        <ul style={styles.trainerList}>
          {trainers.map((t) => (
            <li
              key={t.trainerNo}
              style={styles.trainerItem}
              onClick={() => navigate(`/trainers/${t.trainerNo}`)}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.trainerItemHover)}
              onMouseLeave={(e) => {
                e.currentTarget.removeAttribute("style");
                Object.assign(e.currentTarget.style, styles.trainerItem);
              }}
            >
              <strong>{t.name || ""}</strong> — {t.specialty || "전문 분야 없음"}
            </li>
          ))}
        </ul>

        {/* 하단 버튼 */}
        <div style={styles.buttonRow}>
          <button style={styles.button} onClick={handleScrollTop}>⬆️ 맨 위로</button>
          <button style={styles.button} onClick={handleGoReviews}>📝 리뷰 보기/쓰기</button>
          <button style={styles.button}>➕ 등록</button>
        </div>
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
  swiper: {
    width: "100%",
    height: "250px",
    marginBottom: "1.2rem",
    borderRadius: "8px",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  favoriteIcon: { fontSize: "24px", cursor: "pointer" },
  infoBlock: { marginBottom: "1.5rem", fontSize: "0.95rem" },
  rateRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem", fontSize: "0.95rem" },
  rateText: { color: "#777" },
  description: { marginBottom: "1rem", lineHeight: 1.5, fontSize: "0.95rem" },
  reviewCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#fafafa",
    fontSize: "0.95rem",
  },

  // Trainer
  trainerList: { padding: 0, listStyle: "none" },
  trainerItem: {
    border: "1px solid #eee",
    borderRadius: "6px",
    padding: "8px",
    marginBottom: "8px",
    fontSize: "0.9rem",
    backgroundColor: "#f8f8f8",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },
  trainerItemHover: {
    borderColor: "#90caf9",
    backgroundColor: "#e3f2fd",
    boxShadow: "0 0 0 3px #e3f2fd",
  },

  // Buttons
  buttonRow: { display: "flex", justifyContent: "space-between", gap: "10px" },
  button: {
    flex: 1,
    padding: "10px",
    fontSize: "0.95rem",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#3F75FF",
    color: "#fff",
    cursor: "pointer",
  },
};

export default GymDetailPage;