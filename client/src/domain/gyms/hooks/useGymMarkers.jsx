import { useEffect, useState } from "react";

// 커스텀 마커 HTML 생성 함수
const createCustomMarkerHTML = (gymName, isSelected = false) => {
  return `
    <div class="custom-gym-marker ${isSelected ? "selected" : ""}" style="
      position: relative;
      width: 40px;
      height: 50px;
      cursor: pointer;
      transform: translate(-50%, -100%);
    ">
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-45deg);
        transition: all 0.3s ease;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 16px;
          font-weight: bold;
          color: white;
        ">💪</div>
      </div>
      <div style="
        position: absolute;
        top: 42px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(20, 184, 166, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${gymName || "헬스장"}</div>
      <style>
        .custom-gym-marker:hover > div:first-child {
          transform: rotate(-45deg) scale(1.1);
          box-shadow: 0 6px 20px rgba(20, 184, 166, 0.6);
        }
        .custom-gym-marker.selected > div:first-child {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
          transform: rotate(-45deg) scale(1.15);
        }
        .custom-gym-marker.selected > div:nth-child(2) {
          background: rgba(245, 158, 11, 0.9);
        }
      </style>
    </div>
  `;
};

const useGymMarkers = ({ mapRef, isMapReady, filteredGyms, onMarkerClick }) => {
  const [markers, setMarkers] = useState([]);
  const [labelOverlays, setLabelOverlays] = useState([]);
  const [selectedGymNo, setSelectedGymNo] = useState(null);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;

    // 기존 마커/라벨 정리
    markers.forEach((m) => m.setMap(null));
    labelOverlays.forEach((o) => o.setMap(null));

    const newOverlays = [];

    filteredGyms.forEach((g) => {
      const pos = new window.kakao.maps.LatLng(g.lat, g.lng);

      // 커스텀 마커 DOM 요소 생성
      const markerDiv = document.createElement("div");
      markerDiv.innerHTML = createCustomMarkerHTML(
        g.name,
        selectedGymNo === g.gymNo
      );
      const markerElement = markerDiv.firstElementChild;

      // CustomOverlay로 커스텀 마커 생성
      const customMarker = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: markerElement,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: selectedGymNo === g.gymNo ? 10 : 5,
      });

      customMarker.setMap(mapRef.current);

      // 마커 클릭 이벤트 추가
      markerElement.addEventListener("click", () => {
        setSelectedGymNo(g.gymNo);
        if (onMarkerClick) {
          onMarkerClick(g);
        }
      });

      newOverlays.push(customMarker);
    });

    setMarkers([]);
    setLabelOverlays(newOverlays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGyms, isMapReady, mapRef, selectedGymNo]);

  return { markers: [], labelOverlays, setSelectedGymNo };
};

export default useGymMarkers;
