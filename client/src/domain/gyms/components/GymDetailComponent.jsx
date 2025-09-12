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
  compact = false, // MapComponent summary-box 모드
  navigate,
  onTrainerClick,
}) => {
  if (!gym) return null;
  const safeRate = Number.isFinite(gym.rate) ? gym.rate : 0;
  return (
    <div className={`${compact ? "compact" : ""}`}>
      {/* 이미지 슬라이드 */}
      {Array.isArray(gym.imageList) && gym.imageList.length > 0 && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
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
                  src={
                    img.startsWith("http")
                      ? img
                      : `${API_SERVER_HOST}/api/files/view/${encodeURIComponent(
                          img
                        )}`
                  }
                  alt={`gym-img-${idx}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
      {/* 헬스장 기본 정보 */}
      <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          🏋️ {gym.title || gym.name || "이름 없음"}
        </div>

        {/* 평점 및 즐겨찾기 */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <StarRating rating={safeRate} />
            <span className="text-gray-500 text-sm">
              ({safeRate.toFixed(1)}/5)
            </span>
          </div>
          <div className="flex items-center flex-shrink-0">
            <ProtectedButton
              onClick={onToggleFavorite}
              redirectMessage="즐겨찾기 기능은 로그인 후 이용 가능합니다."
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isFavorite
                  ? "bg-teal-500 text-white hover:bg-teal-600"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 등록"}
            >
              {isFavorite ? "⭐ 즐겨찾기 됨" : "☆ 즐겨찾기"} ({favoriteCount})
            </ProtectedButton>
          </div>
        </div>

        {/* 기본 정보 그리드 */}
        <div className="grid gap-3">
          <div className="flex items-start gap-3">
            <span className="font-semibold text-gray-500 min-w-[80px] flex-shrink-0">
              📍 주소
            </span>
            <span className="text-gray-800 flex-1">
              {gym.address || "정보 없음"}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-semibold text-gray-500 min-w-[80px] flex-shrink-0">
              📞 전화번호
            </span>
            <span className="text-gray-800 flex-1">
              {gym.phoneNumber || "정보 없음"}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-semibold text-gray-500 min-w-[80px] flex-shrink-0">
              🕒 운영시간
            </span>
            <span className="text-gray-800 flex-1">
              {gym.openingHours || "정보 없음"}
            </span>
          </div>
        </div>
      </div>
      {/* 부대시설 */}
      {Array.isArray(gym.facilities) && gym.facilities.length > 0 && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            🏢 부대시설
          </div>
          <div className="flex flex-wrap gap-2">
            {gym.facilities.map((facility, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-2xl text-xs font-medium"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* 소개 */}
      {gym.content && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            📝 소개
          </div>
          <div className="text-gray-700 leading-relaxed">{gym.content}</div>
        </div>
      )}
      {/* 트레이너 */}
      {Array.isArray(gym.trainers) && gym.trainers.length > 0 && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            💪 트레이너
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {gym.trainers.map((trainer) => (
              <div
                key={trainer.trainerNo}
                className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer transition-all hover:border-gray-300 hover:bg-gray-50"
                onClick={() =>
                  onTrainerClick
                    ? onTrainerClick(trainer)
                    : navigate(`/trainers/detail/${trainer.trainerNo}`)
                }
              >
                <div className="font-semibold text-gray-800 mb-1">
                  {trainer.name}
                </div>
                {trainer.specialty && (
                  <div className="text-xs text-gray-500">
                    {trainer.specialty}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 최근 리뷰 */}
      {Array.isArray(gym.reviews) && gym.reviews.length > 0 && (
        <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            💬 최근 리뷰
          </div>
          {gym.reviews.slice(0, 3).map((review) => (
            <div
              key={review.reviewNo}
              className="mb-3 p-3 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">
                  {review.writerName || "익명"}
                </span>
                <div className="flex items-center gap-1">
                  <StarRating rating={review.score} size={14} />
                  <span className="text-xs text-gray-500">
                    {Number(review.score).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-gray-700 text-sm">
                {review.comment || ""}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 독립 페이지로 이동 버튼 (compact 모드가 아닐 때만) */}
      {!compact && (
        <div className="mt-5 p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
          <button
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
            onClick={() => navigate(`/gyms/detail/${gym.gymNo}`)}
            title="독립 페이지에서 보기"
          >
            <span>상세 페이지로 이동</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GymDetailComponent;
