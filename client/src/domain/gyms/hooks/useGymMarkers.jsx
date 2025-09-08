import { useEffect, useState } from "react";

const useGymMarkers = ({
    mapRef, isMapReady, filteredGyms, activeInfoWindow, setActiveInfoWindow
}) => {
    const [markers, setMarkers] = useState([]);
    const [labelOverlays, setLabelOverlays] = useState([]);

    useEffect(() => {
        if (!mapRef.current || !isMapReady) return;

        // 원본: 기존 마커/라벨 정리
        markers.forEach((m) => m.setMap(null));
        labelOverlays.forEach((o) => o.setMap(null));

        const newMarkers = [];
        const newOverlays = [];

        filteredGyms.forEach((g) => {
            const pos = new window.kakao.maps.LatLng(g.lat, g.lng);

            // 마커
            const marker = new window.kakao.maps.Marker({
                map: mapRef.current,
                position: pos,
                title: g.name
            });

            // 인포윈도우
            const infoWindow = new window.kakao.maps.InfoWindow({
                content:
                    '<div style="padding:6px 8px;font-size:12px;line-height:1.4;">' +
                    `<strong>${g.name}</strong><br/>` +
                    `<span style="color:#6b7280;">${g.address ? g.address : ""}</span>` +
                    "</div>"
            });
            window.kakao.maps.event.addListener(marker, "click", () => {
                if (activeInfoWindow) activeInfoWindow.close();
                infoWindow.open(mapRef.current, marker);
                setActiveInfoWindow(infoWindow);
            });

            // 라벨(항상 표시)
            const labelEl = document.createElement("div");
            labelEl.className = "marker-label";
            labelEl.textContent = g.name || "";

            const overlay = new window.kakao.maps.CustomOverlay({
                position: pos,
                content: labelEl,
                xAnchor: 0.5, // 가운데 정렬
                yAnchor: 0,   // 좌표 지점을 콘텐츠 상단으로 가정 후, CSS로 아래로 내림
                zIndex: 2
            });
            overlay.setMap(mapRef.current);

            newMarkers.push(marker);
            newOverlays.push(overlay);
        });

        setMarkers(newMarkers);
        setLabelOverlays(newOverlays);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredGyms, isMapReady, mapRef]);

    return { markers, labelOverlays };
}

export default useGymMarkers;