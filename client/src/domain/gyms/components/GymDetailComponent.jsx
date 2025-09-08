import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { StarRating } from "../components/ReviewList";
import { ProtectedButton } from "../../../common/config/ProtectedLogin";
import { API_SERVER_HOST } from "../../global/api/axios";

const GymDetailComponent = ({
    gym,
    isFavorite,
    favoriteCount,
    onToggleFavorite,
    compact = false,   // MapComponent summary-box 모드
    onClose,           // compact 모드일 때 닫기 버튼 핸들러
    navigate,
    onTrainerClick,
}) => {
    if (!gym) return null;
    const safeRate = Number.isFinite(gym.rate) ? gym.rate : 0;

    return (
        <div className={`gym-detail ${compact ? "compact" : ""}`}>
            {/* 이미지 슬라이드 */}
            {Array.isArray(gym.imageList) && gym.imageList.length > 0 ? (
                <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={10}
                    slidesPerView={1}
                    className="detail-swiper"
                >
                    {gym.imageList.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <img
                                src={img.startsWith("http") ? img : `${API_SERVER_HOST}/api/files/view/${encodeURIComponent(img)}`}
                                alt={`gym-img-${idx}`}
                                className="detail-img"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <p style={{ marginTop: 8 }}>등록된 이미지가 없습니다.</p>
            )}

            {/* 제목 + 즐겨찾기 */}
            <div className="detail-title-row">
                <h2 style={{ margin: 0, fontSize: compact ? "1rem" : "1.3rem" }}>
                    {gym.title || gym.name || "이름 없음"}
                </h2>
                <ProtectedButton
                    onClick={onToggleFavorite}
                    redirectMessage="즐겨찾기 기능은 로그인 후 이용 가능합니다."
                    className="detail-fav"
                    title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 등록"}
                >
                    {isFavorite ? "⭐" : "☆"} {favoriteCount}
                </ProtectedButton>
            </div>

            {/* 기본 정보 */}
            <div className="detail-info">
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

            {/* 평점 */}
            <div className="detail-rate">
                <StarRating score={safeRate} size={18} />
                <span style={{ color: "#777" }}>
                    ({safeRate.toFixed(1)}/5)
                </span>
            </div>

            {/* 설명 */}
            <p className="detail-desc">{gym.content || ""}</p>

            {/* 리뷰 */}
            {Array.isArray(gym.reviews) && gym.reviews.length > 0 ? (
                gym.reviews.slice(0, 3).map((r) => (
                    <div key={r.reviewNo} className="detail-review-card">
                        <div style={{ fontWeight: "bold" }}>{r.writerName || "익명"} 님</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <StarRating score={r.score} size={16} />
                            <span style={{ color: "#666", fontSize: 13 }}>({Number(r.score).toFixed(1)})</span>
                        </div>
                        <div style={{ marginTop: 6 }}>
                            {(r.comment || "").length > 60 ? `${r.comment.slice(0, 60)}...` : (r.comment || "")}
                        </div>
                    </div>
                ))
            ) : (
                <p style={{ color: "#888" }}>등록된 리뷰가 없습니다.</p>
            )}

            {/* 트레이너 */}
            {Array.isArray(gym.trainers) && gym.trainers.length > 0 && (
                <ul className="trainer-list">
                    {(gym.trainers || []).map((t) => (
                        <li
                            key={t.trainerNo}
                            className="trainer-item"
                            onClick={() =>
                                onTrainerClick
                                    ? onTrainerClick(t) // ✅ 부모가 넘긴 콜백 실행 → 옆 패널(교체) 열림
                                    : navigate(`/trainers/${t.trainerNo}`) // 폴백: 기존 라우팅
                            }
                        >
                            {t.name}
                        </li>
                    ))}
                </ul>
            )}

            {/* 닫기 버튼 (compact 모드 전용) */}
            {compact && (
                <div className="summary__actions">
                    <button className="btn btn--line" style={{ flex: 1 }} onClick={onClose}>
                        간단 보기로 접기
                    </button>
                </div>
            )}
        </div>
    );
};

export default GymDetailComponent;