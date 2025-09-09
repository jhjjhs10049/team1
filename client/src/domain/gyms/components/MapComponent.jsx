// /domain/gyms/components/MapComponent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicLayout from "../../../layouts/BasicLayout.jsx";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

// ✅ 원본 컴포넌트
import ReviewList from "./ReviewList.jsx";
import ReviewForm from "./ReviewForm.jsx";
import GymDetailComponent from "../components/GymDetailComponent.jsx";

// ✅ 원본 API들
import {
  fetchGymDetail,
  toggleFavorite,
  fetchGymReviews,
} from "../api/gymApi.jsx";
import {
  fetchTrainerDetail,
  fetchTrainerReviews,
} from "../../trainers/api/trainerApi.jsx";

// ✅ 분리된 훅들
import useGyms from "../hooks/useGyms";
import useKakaoMap from "../hooks/useKakaoMap";
import useRadiusCircle from "../hooks/useRadiusCircle";
import useGymFilter from "../hooks/useGymFilter";
import useGymMarkers from "../hooks/useGymMarkers";
import useAutoRecenter from "../hooks/useAutoRecenter";
import useDirections from "../hooks/useDirections";

import "swiper/css";
import "swiper/css/navigation";

/** 좌측 사이드바 너비(px) */
const SIDEBAR_WIDTH = 360;

const MapComponent = () => {
  /** 로그인 상태 */
  const { isLogin, loginState } = useCustomLogin();

  const navigate = useNavigate();

  // ========== 훅 기반 상태 ==========
  const gyms = useGyms();

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

  const [radius, setRadius] = useState(1000);
  const [showRadius, setShowRadius] = useState(true);
  const [onlyInRadius, setOnlyInRadius] = useState(true);

  useRadiusCircle({
    mapRef,
    circleRef,
    userPos,
    radius,
    showRadius,
    onlyInRadius,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const { filteredGyms, sortedGyms } = useGymFilter({
    gyms,
    searchTerm,
    onlyInRadius,
    userPos,
    userPosXY,
    radius,
    isMapReady,
  });

  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  useGymMarkers({
    mapRef,
    isMapReady,
    filteredGyms,
    activeInfoWindow,
    setActiveInfoWindow,
  });

  useAutoRecenter({ mapRef, getUserLatLng, userPos, userPosXY });

  // 선택된 헬스장 관련
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [selectedError, setSelectedError] = useState("");

  // summary 박스 내 상세 뷰 토글 + 즐겨찾기 상태
  const [showDetail, setShowDetail] = useState(false);
  const [detailIsFavorite, setDetailIsFavorite] = useState(false);
  const [detailFavoriteCount, setDetailFavoriteCount] = useState(0);

  // 리뷰 & 트레이너 패널
  // null | "review" | "trainer"
  const [activePanel, setActivePanel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [trainerDetail, setTrainerDetail] = useState(null);
  const [trainerReviews, setTrainerReviews] = useState([]);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [trainerError, setTrainerError] = useState("");

  // 길찾기
  const { openKakaoRouteToSelected } = useDirections({
    selectedGym,
    userPos,
    userPosXY,
  });

  // ─────────────────────────────────────────────────────────────
  // 원본 유틸
  const safe = (v, alt = "정보 없음") =>
    v === null || v === undefined || v === "" ? alt : v;
  const clip = (t, n = 90) =>
    t ? (t.length > n ? t.slice(0, n) + "..." : t) : "";

  // ─────────────────────────────────────────────────────────────
  // (5) 검색 리스트 카드 클릭 → 지도 이동 + 상단 요약 패널 표시 (원본 복구)
  const selectFromList = async (g) => {
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
      setShowDetail(false);
      setActivePanel(null);
    } catch {
      setSelectedError("요약을 불러오지 못했습니다.");
      setSelectedGym(null);
    } finally {
      setSelectedLoading(false);
    }
  };

  // (8) 리뷰 목록 불러오기 (원본 복구)
  const loadReviews = async (gymNo) => {
    try {
      const raw = await fetchGymReviews(gymNo);
      setReviews(Array.isArray(raw) ? raw : raw.content || []);
    } catch (e) {
      console.error("[MapComponent] 리뷰 불러오기 실패", e);
      setReviews([]);
    }
  };

  // 요약박스 상세 즐겨찾기 토글 (원본 복구)
  const handleToggleFavoriteInSummary = () => {
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

  // 패널 열기/닫기 (교체 방식) (원본 복구)
  const openReviewPanel = (gymNo) => {
    loadReviews(gymNo);
    setActivePanel("review");
    // 트레이너 패널 상태 초기화
    setTrainerDetail(null);
    setTrainerReviews([]);
    setTrainerError("");
    setTrainerLoading(false);
  };

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

  const closePanel = () => {
    setActivePanel(null);
    setTrainerDetail(null);
    setTrainerReviews([]);
    setTrainerError("");
    setTrainerLoading(false);
  };

  // ========== 렌더 ==========
  return (
    <BasicLayout noMargin={true}>
      {/* ResponsiveStyles (원본 축약 버전) */}
      <style>{`
        .map-layout { display:flex; width:100%; height:calc(100vh - 56px); background:#fff; }
        .sidebar { width:${SIDEBAR_WIDTH}px; border-right:1px solid #e5e7eb; background:#fff; display:flex; flex-direction:column; }
        .sidebar__section { padding:12px; border-bottom:1px solid #f0f0f0; }
        .sidebar__search { position:relative; }
        .sidebar__search input { width:100%; padding:10px 36px 10px 12px; border-radius:8px; border:1px solid #d1d5db; font-size:14px; }
        .sidebar__search-clear { position:absolute; right:8px; top:50%; transform:translateY(-50%); border:0; background:transparent; cursor:pointer; }
        .sidebar__filters { font-size:14px; }
        .sidebar__filters .row { margin-top:8px; display:flex; align-items:center; gap:8px; }
        .sidebar__filters input[type="number"] { width:110px; padding:6px 8px; border:1px solid #d1d5db; border-radius:6px; }
        .btn { padding:8px 10px; border:0; border-radius:6px; cursor:pointer; }
        .btn--line { padding:6px 10px; border:1px solid #d1d5db; background:#fff; border-radius:6px; cursor:pointer; }
        .btn--primary { background:#3F75FF; color:#fff; }
        .btn--green { background:#10b981; color:#fff; }
        .sidebar__list { flex:1; overflow-y:auto; padding:12px; }
        .card { border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin-bottom:10px; cursor:pointer; background:#fff; }
        .card__title { font-weight:700; margin-bottom:4px; }
        .card__addr { font-size:13px; color:#6b7280; }
        .card__coords { font-size:12px; color:#9ca3af; margin-top:4px; }
        .map-area { position:relative; flex:1; min-width:0; }
        #map { width:100%; height:100%; }
        .summary { position:absolute; top:16px; left:16px; z-index:5; width:min(420px,92vw); max-width:460px; }
        .summary__box { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px; box-shadow:0 6px 20px rgba(0,0,0,0.12); }
        .summary__box--error { border-color:#fecaca; color:#b91c1c; }
        .summary__head { display:flex; justify-content:space-between; align-items:center; gap:8px; }
        .summary__title { font-weight:800; font-size:16px; }
        .summary__meta { margin-top:6px; font-size:13px; color:#6b7280; }
        .summary__actions { display:flex; gap:8px; margin-top:10px; }
        .summary__box--scroll { max-height:65vh; overflow:auto; }
        @media (min-width:1025px){ .summary{ width:min(680px,90vw); max-width:680px; } .summary__box--scroll{ max-height:85vh; } }
      `}</style>

      <div className="map-layout">
        {/* 좌측 사이드바 */}
        <aside className="sidebar">
          {/* 검색 */}
          <div className="sidebar__section">
            <div className="sidebar__search">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="헬스장 검색"
              />
              {searchTerm && (
                <button
                  className="sidebar__search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  ❌
                </button>
              )}
            </div>
          </div>

          {/* 필터 */}
          <div className="sidebar__section sidebar__filters">
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={onlyInRadius}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setOnlyInRadius(checked);
                  setShowRadius(checked);
                }}
              />
              반경 내만
            </label>
            <div className="row">
              <input
                type="number"
                value={radius}
                onChange={(e) =>
                  setRadius(Math.max(Number(e.target.value || 0), 10))
                }
                min={10}
                step={10}
              />
              <span>m</span>
              <button
                className="btn--line"
                onClick={() => setShowRadius((v) => !v)}
              >
                {showRadius ? "반경 숨기기" : "반경 표시"}
              </button>
            </div>
            <button
              className="btn btn--green"
              style={{ marginTop: 8, width: "100%" }}
              onClick={moveToFixedLocation}
            >
              📍 고정 위치로 이동
            </button>
            <button
              className="btn btn--primary"
              style={{ marginTop: 8, width: "100%" }}
              onClick={() =>
                userPos && mapRef.current && mapRef.current.setCenter(userPos)
              }
            >
              📍 내 위치로
            </button>
          </div>

          {/* 리스트 */}
          <div className="sidebar__list">
            {filteredGyms.length === 0 && (
              <div style={{ color: "#9ca3af" }}>검색 결과가 없습니다.</div>
            )}
            {sortedGyms.map((g) => (
              <div
                key={g.gymNo}
                className="card"
                onClick={() => selectFromList(g)}
              >
                <div className="card__title">{g.name}</div>
                <div className="card__addr">{g.address}</div>
                <div className="card__coords">
                  ({g.lat.toFixed(4)}, {g.lng.toFixed(4)}) ·
                  {Math.round(g._dist)}m
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* 지도 영역 */}
        <div className="map-area">
          <div id="map" />

          {/* 좌측 상단 요약/상세 패널 */}
          <div className="summary">
            {selectedLoading && (
              <div className="summary__box">요약 불러오는 중...</div>
            )}
            {selectedError && (
              <div className="summary__box summary__box--error">
                {selectedError}
              </div>
            )}

            {selectedGym && !selectedLoading && !selectedError && (
              <div
                className={`summary__box ${
                  showDetail ? "summary__box--scroll" : ""
                }`}
              >
                {/* 헤더 */}
                <div className="summary__head">
                  <div className="summary__title">
                    {safe(selectedGym.title || selectedGym.name, "이름 없음")}
                  </div>
                  <div>
                    <button
                      className="btn btn--primary"
                      style={{ marginRight: "20px" }}
                      onClick={openKakaoRouteToSelected}
                    >
                      길찾기
                    </button>
                    <button
                      className="summary__close"
                      onClick={() => {
                        setSelectedGym(null);
                        setShowDetail(false);
                        setActivePanel(null);
                      }}
                      title="닫기"
                    >
                      ✖
                    </button>
                  </div>
                </div>

                {/* 간단 보기 */}
                {!showDetail && (
                  <>
                    <div className="summary__meta">
                      평점:
                      {Number.isFinite(selectedGym.rate)
                        ? Number(selectedGym.rate).toFixed(1)
                        : "0.0"}
                      / 5
                      {typeof selectedGym.favoriteCount === "number"
                        ? ` · ⭐ ${selectedGym.favoriteCount}`
                        : ""}
                    </div>
                    <div className="summary__line">
                      📍 {safe(selectedGym.address)}
                    </div>
                    <div className="summary__line">
                      📞 {safe(selectedGym.phoneNumber)}
                    </div>
                    <div className="summary__line">
                      🕒 {safe(selectedGym.openingHours)}
                    </div>
                    <div className="summary__desc">
                      {clip(selectedGym.content, 120)}
                    </div>
                    <div className="summary__actions">
                      <button
                        className="btn btn--primary"
                        style={{ flex: 1 }}
                        onClick={() => setShowDetail(true)}
                      >
                        상세 보기
                      </button>
                    </div>
                  </>
                )}

                {/* 상세 보기 */}
                {showDetail && (
                  <>
                    <GymDetailComponent
                      gym={selectedGym}
                      isFavorite={detailIsFavorite}
                      favoriteCount={detailFavoriteCount}
                      onToggleFavorite={handleToggleFavoriteInSummary}
                      compact={true}
                      onClose={() => setShowDetail(false)}
                      navigate={navigate}
                      onTrainerClick={(t) => openTrainerPanel(t.trainerNo)}
                    />

                    <div className="summary__actions">
                      <button
                        className="btn btn--line"
                        onClick={() => openReviewPanel(selectedGym.gymNo)}
                      >
                        💬 리뷰 전체 보기
                      </button>
                      <button
                        className="btn btn--primary"
                        onClick={() =>
                          navigate(`/gyms/purchase/${selectedGym.gymNo}`)
                        }
                        title="결제 페이지로 이동"
                      >
                        등록하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽 교체 패널: 리뷰 */}
          {activePanel === "review" && selectedGym && (
            <div className="summary" style={{ left: "auto", right: "16px" }}>
              <div className="summary__box summary__box--scroll">
                <div className="summary__head">
                  <div className="summary__title">
                    {selectedGym.title || selectedGym.name} 리뷰
                  </div>
                  <button className="summary__close" onClick={closePanel}>
                    ✖
                  </button>
                </div>

                <ReviewList
                  reviews={reviews}
                  gymNo={selectedGym.gymNo}
                  onDeleted={() => loadReviews(selectedGym.gymNo)}
                />
                <hr />
                <ReviewForm
                  gymNo={selectedGym.gymNo}
                  onSubmitted={() => loadReviews(selectedGym.gymNo)}
                />
              </div>
            </div>
          )}

          {/* 오른쪽 교체 패널: 트레이너 */}
          {activePanel === "trainer" && (
            <div className="summary" style={{ left: "auto", right: "16px" }}>
              <div className="summary__box summary__box--scroll">
                <div className="summary__head">
                  <div className="summary__title">
                    {trainerDetail?.name || "트레이너"}
                  </div>
                  <button className="summary__close" onClick={closePanel}>
                    ✖
                  </button>
                </div>

                {trainerLoading && <div>불러오는 중...</div>}
                {trainerError && !trainerLoading && (
                  <div className="summary__box summary__box--error">
                    {trainerError}
                  </div>
                )}

                {!trainerLoading && !trainerError && trainerDetail && (
                  <>
                    {Number.isFinite(trainerDetail.rate) && (
                      <div className="summary__meta">
                        평균 평점: {Number(trainerDetail.rate).toFixed(1)} / 5
                      </div>
                    )}
                    {trainerDetail.specialty && (
                      <div className="summary__line">
                        전문 분야: {trainerDetail.specialty}
                      </div>
                    )}
                    {(trainerDetail.gym?.gymNo || trainerDetail.gymNo) && (
                      <div className="summary__line">
                        소속:&nbsp;{" "}
                        <button
                          className="btn--line"
                          onClick={() =>
                            navigate(
                              `/gyms/detail/${
                                trainerDetail.gym?.gymNo || trainerDetail.gymNo
                              }`
                            )
                          }
                        >
                          {trainerDetail.gym?.title ||
                            trainerDetail.gymTitle ||
                            `GYM #${
                              trainerDetail.gym?.gymNo || trainerDetail.gymNo
                            }`}
                          →
                        </button>
                      </div>
                    )}
                    {trainerDetail.description && (
                      <div
                        className="summary__desc"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {trainerDetail.description}
                      </div>
                    )}
                    <div
                      className="summary__line"
                      style={{ marginTop: 12, fontWeight: 700 }}
                    >
                      최근 리뷰
                    </div>
                    {trainerReviews.length > 0 ? (
                      trainerReviews.slice(0, 3).map((r) => (
                        <div key={r.reviewNo} className="detail-review-card">
                          <div style={{ fontWeight: 600 }}>
                            {r.writerNickname || r.writerName || "익명"} · ★
                            {Number(r.score).toFixed(1)}
                          </div>
                          <div style={{ marginTop: 4 }}>{r.comment}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "#888" }}>
                        등록된 리뷰가 없습니다.
                      </div>
                    )}
                    <div className="summary__actions">
                      <button
                        className="btn btn--primary"
                        style={{ flex: 1 }}
                        onClick={() =>
                          navigate(
                            `/trainers/review/${trainerDetail.trainerNo}`
                          )
                        }
                      >
                        리뷰 더 보기/작성
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </BasicLayout>
  );
};

export default MapComponent;
