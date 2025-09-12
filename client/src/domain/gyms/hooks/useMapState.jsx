// useMapState.js - 지도 관련 상태 관리 훅
import { useState } from "react";

const useMapState = () => {
  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [radius, setRadius] = useState(1000);
  const [showRadius, setShowRadius] = useState(true);
  const [onlyInRadius, setOnlyInRadius] = useState(false);

  // 선택된 헬스장 관련 상태
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState("");

  // 상세 보기 상태
  const [showDetail, setShowDetail] = useState(false);
  const [detailIsFavorite, setDetailIsFavorite] = useState(false);
  const [detailFavoriteCount, setDetailFavoriteCount] = useState(0);

  // 패널 상태
  const [activePanel, setActivePanel] = useState(null); // null | "review" | "trainer"
  const [reviews, setReviews] = useState([]);
  const [trainerDetail, setTrainerDetail] = useState(null);
  const [trainerReviews, setTrainerReviews] = useState([]);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [trainerError, setTrainerError] = useState("");

  return {
    // 검색 및 필터
    searchTerm,
    setSearchTerm,
    radius,
    setRadius,
    showRadius,
    setShowRadius,
    onlyInRadius,
    setOnlyInRadius,

    // 선택된 헬스장
    selectedGym,
    setSelectedGym,
    selectedLoading,
    setSelectedLoading,
    selectedError,
    setSelectedError,

    // 상세 보기
    showDetail,
    setShowDetail,
    detailIsFavorite,
    setDetailIsFavorite,
    detailFavoriteCount,
    setDetailFavoriteCount,

    // 패널
    activePanel,
    setActivePanel,
    reviews,
    setReviews,
    trainerDetail,
    setTrainerDetail,
    trainerReviews,
    setTrainerReviews,
    trainerLoading,
    setTrainerLoading,
    trainerError,
    setTrainerError,
  };
};

export default useMapState;
