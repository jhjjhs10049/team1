import { useEffect, useRef, useState } from "react";

const useKakaoMap = () => {
    const mapRef = useRef(null);
    const circleRef = useRef(null);        // 원본에 있으므로 유지 (여기선 외부에서 안 쓰더라도 보존)
    const userMarkerRef = useRef(null);

    const [isMapReady, setIsMapReady] = useState(false);
    const [isGeometryReady, setIsGeometryReady] = useState(false);
    const [userPos, setUserPos] = useState(null);     // kakao.maps.LatLng
    const [userPosXY, setUserPosXY] = useState(null); // { lat, lng }

    const initMap = () => {
        const container = document.getElementById("map");
        if (!container) return;

        const saved = localStorage.getItem("userPosition");
        const initial = saved ? JSON.parse(saved) : { lat: 37.5665, lng: 126.978 };
        setUserPosXY(initial);

        const map = new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(initial.lat, initial.lng),
            level: 4,
        });
        mapRef.current = map;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = new window.kakao.maps.LatLng(
                        pos.coords.latitude,
                        pos.coords.longitude
                    );

                    const userMarker = new window.kakao.maps.Marker({
                        map,
                        position: loc,
                        title: "내 위치",
                        draggable: true,
                        image: new window.kakao.maps.MarkerImage(
                            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                            new window.kakao.maps.Size(24, 35)
                        ),
                    });
                    userMarkerRef.current = userMarker;

                    window.kakao.maps.event.addListener(userMarker, "dragend", () => {
                        const p = userMarker.getPosition();
                        setUserPos(p);
                        setUserPosXY({ lat: p.getLat(), lng: p.getLng() });
                        localStorage.setItem(
                            "userPosition",
                            JSON.stringify({ lat: p.getLat(), lng: p.getLng() })
                        );
                    });

                    setUserPos(loc);
                    setUserPosXY({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                    map.setCenter(loc);
                    localStorage.setItem(
                        "userPosition",
                        JSON.stringify({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                        })
                    );
                },
                () => { }
            );
        }

        setIsMapReady(true);
    };

    // 원본 useEffect (의존성/본문 동일)
    useEffect(() => {
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');

        if (!existingScript) {
            setIsMapReady(!isMapReady);
            const script = document.createElement("script");
            script.src =
                "https://dapi.kakao.com/v2/maps/sdk.js?appkey=a7829b6eedfe1d85903c6c1e90a99606&autoload=false&libraries=services,geometry";
            script.async = true;

            script.onload = () => {
                window.kakao.maps.load(() => {
                    initMap();
                    setIsGeometryReady(
                        !!(window.kakao.maps.geometry && window.kakao.maps.geometry.spherical)
                    );
                }, 1000);
            };

            document.head.appendChild(script);
        } else {
            if (window.kakao && window.kakao.maps) {
                initMap();
            } else {
                const intervalId = setInterval(() => {
                    if (window.kakao && window.kakao.maps) {
                        initMap();
                        clearInterval(intervalId);
                    }
                }, 1000);
            }
        }
    }, [isMapReady]); // ← 원본 그대로

    // 원본 유틸들
    const moveToFixedLocation = () => {
        const fixed = { lat: 35.8945, lng: 128.5098 };
        const loc = new window.kakao.maps.LatLng(fixed.lat, fixed.lng);
        if (mapRef.current) {
            mapRef.current.setCenter(loc);
            setUserPos(loc);
            setUserPosXY(fixed);
            localStorage.setItem("userPosition", JSON.stringify(fixed));
            if (userMarkerRef.current) {
                userMarkerRef.current.setPosition(loc);
            }
        }
    };

    const getUserLatLng = () => {
        if (userPos) return userPos;
        if (userPosXY && window.kakao?.maps) {
            return new window.kakao.maps.LatLng(userPosXY.lat, userPosXY.lng);
        }
        return null;
    };

    return {
        // refs
        mapRef,
        circleRef,
        userMarkerRef,
        // states
        isMapReady,
        isGeometryReady,
        userPos,
        setUserPos,
        userPosXY,
        setUserPosXY,
        // utils
        moveToFixedLocation,
        getUserLatLng,
    };
}

export default useKakaoMap;