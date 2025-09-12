import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchGymDetail, fetchGymReviews } from "../api/gymApi";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import BasicLayout from "../../../layouts/BasicLayout";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const normalizeReviews = (r) => {
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.content)) return r.content;
  if (Array.isArray(r?.reviews)) return r.reviews;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.items)) return r.items;
  return [];
};

const GymReviewPage = () => {
  const { gymno } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLogin } = useCustomLogin(); // 로그인 여부

  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const id = Number(gymno);
        if (!Number.isFinite(id)) {
          setError("잘못된 경로입니다.");
          return;
        }

        const gymData = await fetchGymDetail(id);
        if (!alive) return;
        setGym(gymData);

        const raw = await fetchGymReviews(id);
        if (!alive) return;
        setReviews(normalizeReviews(raw));
      } catch (err) {
        console.error("[GymReviewPage] 데이터 로드 중 오류:", err);
        setError("데이터를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadData();
    return () => {
      alive = false;
    };
  }, [gymno]);

  if (loading) return <div>헬스장 정보를 불러오는 중입니다...</div>;
  if (error) return <div>{error}</div>;
  if (!gym) return <div>헬스장 정보가 없습니다.</div>;
  const goLoginWithRedirect = () => {
    const redirect = encodeURIComponent(location.pathname + location.search);
    navigate(`/member/login?redirect=${redirect}`);
  };

  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          {/* 페이지 헤더 */}
          <div className="bg-white rounded-lg p-8 mb-6 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
              {gym.title} 리뷰
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
            <ReviewList
              reviews={reviews}
              gymNo={gymno}
              onDeleted={() => {
                fetchGymReviews(gymno).then((raw) =>
                  setReviews(normalizeReviews(raw))
                );
              }}
            />
          </div>

          {/* 리뷰 작성 섹션 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            {isLogin ? (
              <ReviewForm
                gymNo={gym.gymNo}
                onSubmitted={() => {
                  fetchGymReviews(gym.gymNo).then((raw) =>
                    setReviews(normalizeReviews(raw))
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
                  className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg shadow-sm hover:bg-teal-600 transition-colors"
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

export default GymReviewPage;
