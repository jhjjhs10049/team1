// /domain/gyms/components/MapComponent.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BasicLayout from "../../../layouts/BasicLayout.jsx";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

// ✅ 분리된 컴포넌트들
import MapSidebar from "./MapSidebar.jsx";
import MapSummaryPanel from "./MapSummaryPanel.jsx";
import MapReviewPanel from "./MapReviewPanel.jsx";
import MapTrainerPanel from "./MapTrainerPanel.jsx";

// ✅ 분리된 훅들
import useGyms from "../hooks/useGyms";
import useKakaoMap from "../hooks/useKakaoMap";
import useRadiusCircle from "../hooks/useRadiusCircle";
import useGymFilter from "../hooks/useGymFilter";
import useGymMarkers from "../hooks/useGymMarkers";
import useAutoRecenter from "../hooks/useAutoRecenter";
import useDirections from "../hooks/useDirections";
import useMapState from "../hooks/useMapState";
import useMapActions from "../hooks/useMapActions";

import "swiper/css";
import "swiper/css/navigation";

/** 좌측 사이드바 너비(px) */
const SIDEBAR_WIDTH = 360;

const MapComponent = () => {
  /** 로그인 상태 */
  const { isLogin, loginState } = useCustomLogin();
  const navigate = useNavigate();

  // 모바일 사이드바 토글 상태
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // ========== 상태 관리 훅들 ==========
  const gyms = useGyms();

  // 지도 관련 상태들을 useMapState로 통합
  const mapState = useMapState();
  const {
    searchTerm,
    setSearchTerm,
    radius,
    setRadius,
    showRadius,
    setShowRadius,
    onlyInRadius,
    setOnlyInRadius,
    selectedGym,
    setSelectedGym,
    selectedLoading,
    setSelectedLoading,
    selectedError,
    setSelectedError,
    showDetail,
    setShowDetail,
    detailIsFavorite,
    setDetailIsFavorite,
    detailFavoriteCount,
    setDetailFavoriteCount,
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
  } = mapState;

  const {
    mapRef,
    circleRef,
    userMarkerRef: _userMarkerRef,
    isMapReady,
    userPos,
    setUserPos: _setUserPos,
    userPosXY,
    setUserPosXY: _setUserPosXY,
    moveToFixedLocation,
    getUserLatLng,
  } = useKakaoMap();

  useRadiusCircle({
    mapRef,
    circleRef,
    userPos,
    radius,
    showRadius,
    onlyInRadius,
  });

  const { filteredGyms, sortedGyms } = useGymFilter({
    gyms,
    searchTerm,
    onlyInRadius,
    userPos,
    userPosXY,
    radius,
    isMapReady,
  });

  // 액션 훅
  const actions = useMapActions({
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
  });
  const {
    safe,
    clip,
    selectFromList,
    selectFromMarker,
    loadReviews,
    handleToggleFavoriteInSummary,
    openReviewPanel,
    openTrainerPanel,
    closePanel,
  } = actions;
  const { setSelectedGymNo } = useGymMarkers({
    mapRef,
    isMapReady,
    filteredGyms,
    onMarkerClick: selectFromMarker, // 맵핀 클릭 시 상세페이지
  });

  // 선택된 헬스장이 변경될 때 마커 상태 업데이트
  useEffect(() => {
    if (selectedGym) {
      setSelectedGymNo(selectedGym.gymNo);
    } else {
      setSelectedGymNo(null);
    }
  }, [selectedGym, setSelectedGymNo]);

  useAutoRecenter({ mapRef, getUserLatLng, userPos, userPosXY });

  // 길찾기
  const { openKakaoRouteToSelected } = useDirections({
    selectedGym,
    userPos,
    userPosXY,
  }); // ========== 렌더 ==========
  return (
    <BasicLayout noMargin={true}>
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen bg-gray-100 relative">
          {/* 모바일 햄버거 버튼 */}
          <button
            className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* 모바일 오버레이 */}
          {isSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* 좌측 사이드바 */}
          <div
            className={`
            lg:relative lg:translate-x-0 lg:block
            fixed inset-y-0 left-0 z-40 
            transform transition-transform duration-300 ease-in-out
            ${
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
          >
            <MapSidebar
              SIDEBAR_WIDTH={SIDEBAR_WIDTH}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onlyInRadius={onlyInRadius}
              setOnlyInRadius={setOnlyInRadius}
              showRadius={showRadius}
              setShowRadius={setShowRadius}
              radius={radius}
              setRadius={setRadius}
              moveToFixedLocation={moveToFixedLocation}
              userPos={userPos}
              mapRef={mapRef}
              filteredGyms={filteredGyms}
              sortedGyms={sortedGyms}
              selectFromList={selectFromList}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* 지도 영역 */}
          <div className="flex-1 relative lg:ml-0">
            <div id="map" className="w-full h-full" />

            {/* 좌측 상단 요약/상세 패널 */}
            <MapSummaryPanel
              selectedLoading={selectedLoading}
              selectedError={selectedError}
              selectedGym={selectedGym}
              showDetail={showDetail}
              setShowDetail={setShowDetail}
              safe={safe}
              clip={clip}
              openKakaoRouteToSelected={openKakaoRouteToSelected}
              setSelectedGym={setSelectedGym}
              setActivePanel={setActivePanel}
              detailIsFavorite={detailIsFavorite}
              detailFavoriteCount={detailFavoriteCount}
              handleToggleFavoriteInSummary={() =>
                handleToggleFavoriteInSummary(selectedGym)
              }
              navigate={navigate}
              openTrainerPanel={openTrainerPanel}
              openReviewPanel={openReviewPanel}
            />

            {/* 오른쪽 교체 패널: 리뷰 */}
            {activePanel === "review" && selectedGym && (
              <MapReviewPanel
                selectedGym={selectedGym}
                closePanel={closePanel}
                reviews={reviews}
                loadReviews={loadReviews}
              />
            )}

            {/* 오른쪽 교체 패널: 트레이너 */}
            {activePanel === "trainer" && (
              <MapTrainerPanel
                trainerDetail={trainerDetail}
                trainerLoading={trainerLoading}
                trainerError={trainerError}
                trainerReviews={trainerReviews}
                navigate={navigate}
                closePanel={closePanel}
              />
            )}
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default MapComponent;
