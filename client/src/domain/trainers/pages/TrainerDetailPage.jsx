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
  if (loading)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </BasicLayout>
    );

  if (err)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">{err}</div>
        </div>
      </BasicLayout>
    );

  if (!trainer)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-gray-600">트레이너 정보가 없습니다.</div>
        </div>
      </BasicLayout>
    ); // 안전가드
  const photo = trainer.photo
    ? `${API_SERVER_HOST}/api/files/view/${encodeURIComponent(trainer.photo)}`
    : "/dumbbell.svg";
  const name = trainer.name || "이름 미상";
  const specialty = trainer.specialty || "";
  const gymNo = trainer.gymNo ?? trainer.gym?.gymNo ?? null;
  const gymTitle = trainer.gymTitle ?? trainer.gym?.title ?? "";
  const safeRate = Number.isFinite(trainer.rate) ? trainer.rate : null;

  const goReviews = () => navigate(`/trainers/review/${trainer.trainerNo}`);
  const goGym = () => {
    if (!gymNo) return;
    navigate(`/gyms/detail/${gymNo}`);
  };
  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 font-sans overflow-hidden">
            <div className="p-4 sm:p-6">
              {/* 히어로 이미지 */}
              <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden mb-6 bg-gray-100 shadow-md">
                <img
                  src={photo}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/dumbbell.svg";
                    e.target.onerror = null;
                  }}
                />
              </div>

              {/* 타이틀 */}
              <div className="text-center mb-6 pb-4 border-b-2 border-blue-50">
                <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                  {name}
                </h1>
              </div>

              {/* 전문분야 섹션 */}
              {specialty && (
                <div className="mb-6 p-5 bg-slate-50 border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-200">
                    🏋️ 전문분야
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {specialty.split(",").map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-sm font-medium"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 기본 정보 섹션 */}
              <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  📋 기본 정보
                </h4>
                <div className="space-y-4">
                  {gymNo && (
                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                      <span className="min-w-28 font-semibold text-slate-600 text-sm flex-shrink-0">
                        🏢 소속 헬스장
                      </span>
                      <button
                        onClick={goGym}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm underline cursor-pointer transition-colors"
                        title="헬스장 상세로 이동"
                      >
                        {gymTitle || `GYM #${gymNo}`} →
                      </button>
                    </div>
                  )}
                  {safeRate !== null && (
                    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
                      <span className="min-w-28 font-semibold text-slate-600 text-sm flex-shrink-0">
                        ⭐ 평균 평점
                      </span>
                      <span className="text-gray-700 text-sm leading-relaxed font-semibold">
                        {safeRate.toFixed(1)} / 5
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 소개 섹션 */}
              {trainer.description && (
                <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                    📝 소개
                  </h4>
                  <p className="text-gray-600 leading-7 text-sm">
                    {trainer.description}
                  </p>
                </div>
              )}

              {/* 리뷰 섹션 */}
              <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h4 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">
                  💬 대표 리뷰
                </h4>
                {reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((r) => (
                      <div
                        key={r.reviewNo}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4 transition-all duration-300 hover:bg-slate-100 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="font-bold text-gray-800 mb-2">
                          {r.writerName || "익명"} 님
                        </div>
                        <div className="text-sm text-gray-700">
                          {r.comment || ""}
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

              {/* 하단 액션 버튼 */}
              <div className="flex gap-3 mt-8">
                <button
                  className="flex-1 py-3.5 px-5 bg-teal-500 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-lg"
                  onClick={goReviews}
                >
                  📝 리뷰 보기/쓰기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default TrainerDetailPage;
