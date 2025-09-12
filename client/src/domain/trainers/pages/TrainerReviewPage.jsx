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
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        로딩 중...
      </div>
    );
  if (err)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-600">
        {err}
      </div>
    );
  if (!trainer)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-600">
        트레이너 정보가 없습니다.
      </div>
    );
  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          {/* 페이지 헤더 */}
          <div className="bg-white rounded-lg p-8 mb-6 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
              {trainer.name} 리뷰
            </h1>
            <div className="mt-4 text-center">
              <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto"></div>
            </div>
          </div>
          {/* 리뷰 목록 섹션 */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-xl">💬</span>
              등록된 리뷰
            </h2>
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
          </div>
          {/* 리뷰 작성 섹션 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
              <div className="text-center py-6">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    리뷰를 작성하려면 로그인이 필요합니다.
                  </p>
                </div>
                <button
                  onClick={goLoginWithRedirect}
                  className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg shadow-sm"
                >
                  로그인하고 리뷰 작성하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default TrainerReviewPage;
