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
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const GymDetailPage = () => {
  const { gymno } = useParams();
  const navigate = useNavigate();
  const { loginState } = useCustomLogin();

  const [gym, setGym] = useState(null);
  const [images, setImages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleGoReviews = () => navigate(`/gyms/${gym.gymNo}/reviews`);

  const handleToggleFavorite = () => {
    const memberNo = loginState?.memberNo;

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
    const memberNo = loginState?.memberNo;

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
        if (e?.response?.status === 404)
          setError("해당 헬스장을 찾을 수 없습니다.");
        else if (e?.response?.status === 401)
          setError("권한이 없습니다. 로그인 후 다시 시도하세요.");
        else setError("헬스장 정보를 불러오지 못했습니다.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [gymno, loginState?.memberNo]);

  if (loading)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </BasicLayout>
    );

  if (error)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </BasicLayout>
    );

  if (!gym)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-gray-600">데이터가 없습니다.</div>
        </div>
      </BasicLayout>
    );

  const safeRate = Number.isFinite(gym.rate) ? gym.rate : 0;

  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 font-sans overflow-hidden">
            <div className="p-4 sm:p-6">
              {/* 이미지 슬라이드 */}
              {images.length > 0 ? (
                <div className="w-full h-56 sm:h-72 mb-6 rounded-xl overflow-hidden shadow-md">
                  <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={10}
                    slidesPerView={1}
                    className="w-full h-full"
                  >
                    {images.map((img, idx) => (
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
                          className="w-full h-full object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                  <p className="text-gray-500 text-center">
                    등록된 이미지가 없습니다.
                  </p>
                </div>
              )}
              {/* 타이틀 */}
              <div className="text-center mb-6 pb-4 border-b-2 border-blue-50">
                <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                  {gym.title}
                </h2>
              </div>
              {/* 즐겨찾기 섹션 */}
              <div className="mb-6 p-5 bg-slate-50 border border-gray-200 rounded-xl shadow-sm">
                <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-200">
                  ⭐ 즐겨찾기
                </h4>
                <ProtectedButton
                  onClick={handleToggleFavorite}
                  redirectMessage="즐겨찾기 기능은 로그인 후 이용 가능합니다."
                  className={`w-full py-4 px-6 border-2 rounded-lg font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    isFavorite
                      ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-gray-300 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50"
                  } hover:-translate-y-0.5 hover:shadow-lg`}
                  title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 등록"}
                >
                  {isFavorite ? "⭐ 즐겨찾기 됨" : "☆ 즐겨찾기"} (
                  {favoriteCount})
                </ProtectedButton>
              </div>
              {/* 평점 섹션 */}
              <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  ⭐ 평점
                </h4>
                <div className="flex items-center gap-3">
                  <StarRating score={safeRate} size={18} />
                  <span className="text-gray-600 font-semibold ml-2">
                    ({safeRate.toFixed(1)}/5)
                  </span>
                </div>
              </div>
              {/* 기본 정보 섹션 */}
              <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  📋 기본 정보
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                    <span className="min-w-28 font-semibold text-slate-600 text-sm flex-shrink-0">
                      📍 주소
                    </span>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {gym.address || "정보 없음"}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                    <span className="min-w-28 font-semibold text-slate-600 text-sm flex-shrink-0">
                      📞 전화번호
                    </span>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {gym.phoneNumber || "정보 없음"}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                    <span className="min-w-28 font-semibold text-slate-600 text-sm flex-shrink-0">
                      🕒 운영시간
                    </span>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {gym.openingHours || "정보 없음"}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                    <span className="min-w-28 font-semibold text-slate-600 text-sm flex-shrink-0">
                      🏋️ 부대시설
                    </span>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {Array.isArray(gym.facilities) &&
                      gym.facilities.length > 0
                        ? gym.facilities.join(", ")
                        : "없음"}
                    </span>
                  </div>
                </div>
              </div>
              {/* 설명 섹션 */}
              {gym.content && (
                <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                    📝 소개
                  </h4>
                  <p className="text-gray-600 leading-7 text-sm">
                    {gym.content}
                  </p>
                </div>
              )}
              {/* 리뷰 섹션 */}
              <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  💬 최근 리뷰
                </h4>
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((r) => (
                      <div
                        key={r.reviewNo}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 transition-all duration-300 hover:bg-slate-100 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="font-bold text-gray-800 mb-1">
                          {r.writerName || "익명"} 님
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating score={r.score} size={16} />
                          <span className="text-gray-500 text-xs">
                            ({Number(r.score).toFixed(1)})
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          {(r.comment || "").length > 60
                            ? `${r.comment.slice(0, 60)}...`
                            : r.comment || ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    등록된 리뷰가 없습니다.
                  </p>
                )}
              </div>
              {/* 트레이너 섹션 */}
              {trainers.length > 0 && (
                <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                    💪 트레이너
                  </h4>
                  <div className="space-y-2.5">
                    {trainers.map((t) => (
                      <div
                        key={t.trainerNo}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 cursor-pointer transition-all duration-300 hover:border-gray-300 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
                        onClick={() =>
                          navigate(`/trainers/detail/${t.trainerNo}`)
                        }
                      >
                        <strong className="text-gray-800">
                          {t.name || ""}
                        </strong>
                        {t.specialty && (
                          <span className="text-slate-500 text-sm font-normal">
                            - {t.specialty}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* 하단 액션 버튼 */}
              <div className="flex gap-3 mt-8 flex-col sm:flex-row">
                <button
                  className="flex-1 min-w-30 py-3.5 px-5 bg-teal-500 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg"
                  onClick={handleGoReviews}
                >
                  리뷰 보기/쓰기
                </button>
                <button
                  className="flex-1 min-w-30 py-3.5 px-5 bg-emerald-500 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-lg"
                  onClick={() => navigate(`/gyms/purchase/${gymno}`)}
                >
                  등록하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default GymDetailPage;
