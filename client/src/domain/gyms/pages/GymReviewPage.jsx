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
      <div style={styles.container}>
        <h1>{gym.title} 리뷰</h1>

        {/* 누구나 열람 가능 */}
        <ReviewList
          reviews={reviews}
          gymNo={gymno}
          onDeleted={() => {
            fetchGymReviews(gymno).then(setReviews);
          }}
        />

        <hr style={{ margin: "2rem 0" }} />

        <div style={styles.reviewFormWrapper}>
          {/* 작성 영역: 로그인 필요 */}
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
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: "0.75rem" }}>
                리뷰를 작성하려면 로그인이 필요합니다.
              </p>
              <button
                onClick={goLoginWithRedirect}
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: "#3F75FF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
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
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  reviewFormWrapper: {
    border: "2px solid black",
    borderRadius: "8px",
    padding: "1rem",
    transition: "all 0.2s ease",
  },
};

export default GymReviewPage;