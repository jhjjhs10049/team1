// useMapActions.js - 지도 관련 액션들을 관리하는 훅
import {
  fetchGymDetail,
  toggleFavorite,
  fetchGymReviews,
} from "../api/gymApi.jsx";
import {
  fetchTrainerDetail,
  fetchTrainerReviews,
} from "../../trainers/api/trainerApi.jsx";

const useMapActions = ({
  mapRef,
  loginState,
  isLogin,
  setSelectedGym,
  setSelectedLoading,
  setSelectedError,
  setDetailIsFavorite,
  setDetailFavoriteCount,
  setShowDetail,
  setActivePanel,
  setReviews,
  setTrainerDetail,
  setTrainerReviews,
  setTrainerLoading,
  setTrainerError,
  detailIsFavorite,
}) => {
  // 유틸 함수들
  const safe = (v, alt = "정보 없음") =>
    v === null || v === undefined || v === "" ? alt : v;
  const clip = (t, n = 90) =>
    t ? (t.length > n ? t.slice(0, n) + "..." : t) : "";
  // 검색 리스트에서 헬스장 선택 (지도 이동만)
  const selectFromList = async (g) => {
    if (!g) return;
    if (mapRef.current && g.lat && g.lng) {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(g.lat, g.lng));
    }
    // 패널 닫기
    setSelectedGym(null);
    setShowDetail(false);
    setActivePanel(null);
  };

  // 맵핀 클릭 시 상세 패널 표시
  const selectFromMarker = async (g) => {
    if (!g) return;
    if (mapRef.current && g.lat && g.lng) {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(g.lat, g.lng));
    }

    try {
      setSelectedGym(null);
      setSelectedLoading(true);
      setSelectedError("");
      const detail = await fetchGymDetail(
        g.gymNo,
        loginState?.memberNo || null
      );
      setSelectedGym(detail);
      setDetailIsFavorite(Boolean(detail.isFavorite));
      setDetailFavoriteCount(detail.favoriteCount ?? 0);
      setShowDetail(true); // 바로 상세 보기 모드로 열기
      setActivePanel(null);
    } catch {
      setSelectedError("요약을 불러오지 못했습니다.");
      setSelectedGym(null);
    } finally {
      setSelectedLoading(false);
    }
  };

  // 리뷰 목록 불러오기
  const loadReviews = async (gymNo) => {
    try {
      const raw = await fetchGymReviews(gymNo);
      setReviews(Array.isArray(raw) ? raw : raw.content || []);
    } catch (e) {
      console.error("[MapComponent] 리뷰 불러오기 실패", e);
      setReviews([]);
    }
  };

  // 즐겨찾기 토글
  const handleToggleFavoriteInSummary = (selectedGym) => {
    if (!selectedGym) return;
    if (!isLogin || !loginState?.memberNo) {
      alert("즐겨찾기는 로그인 후 이용 가능합니다.");
      return;
    }
    toggleFavorite(selectedGym.gymNo, loginState.memberNo, !detailIsFavorite)
      .then((data) => {
        setDetailIsFavorite(Boolean(data.isFavorite));
        setDetailFavoriteCount(data.favoriteCount ?? 0);
      })
      .catch(() => alert("즐겨찾기 상태 변경 중 오류가 발생했습니다."));
  };

  // 리뷰 패널 열기
  const openReviewPanel = (gymNo) => {
    loadReviews(gymNo);
    setActivePanel("review");
    // 트레이너 패널 상태 초기화
    setTrainerDetail(null);
    setTrainerReviews([]);
    setTrainerError("");
    setTrainerLoading(false);
  };

  // 트레이너 패널 열기
  const openTrainerPanel = async (trainerNo) => {
    try {
      setTrainerLoading(true);
      setTrainerError("");
      setActivePanel("trainer");

      const [detail, reviewsRaw] = await Promise.all([
        fetchTrainerDetail(trainerNo),
        fetchTrainerReviews(trainerNo).catch(() => []),
      ]);

      setTrainerDetail(detail || null);
      const reviews = Array.isArray(reviewsRaw)
        ? reviewsRaw
        : reviewsRaw?.content || [];
      setTrainerReviews(reviews);
    } catch (e) {
      console.error("[MapComponent] 트레이너 로드 실패", e);
      setTrainerError("트레이너 정보를 불러오지 못했습니다.");
      setTrainerDetail(null);
      setTrainerReviews([]);
    } finally {
      setTrainerLoading(false);
    }
  };

  // 패널 닫기
  const closePanel = () => {
    setActivePanel(null);
    setTrainerDetail(null);
    setTrainerReviews([]);
    setTrainerError("");
    setTrainerLoading(false);
  };
  return {
    safe,
    clip,
    selectFromList,
    selectFromMarker,
    loadReviews,
    handleToggleFavoriteInSummary,
    openReviewPanel,
    openTrainerPanel,
    closePanel,
  };
};

export default useMapActions;
