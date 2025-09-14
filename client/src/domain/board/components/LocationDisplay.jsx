import React, { useEffect, useRef, useState } from 'react';

const LocationDisplay = ({ location, className = '' }) => {
    const mapRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapId] = useState(`location-display-map-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (!location || !location.lat || !location.lng) {
            return;
        }

        const existingScript = document.querySelector(
            'script[src*="dapi.kakao.com"]'
        );

        const initMap = () => {
            // DOM 요소가 렌더링될 때까지 기다림
            const waitForContainer = (retryCount = 0) => {
                const container = document.getElementById(mapId);

                if (!container) {
                    if (retryCount < 10) {
                        setTimeout(() => waitForContainer(retryCount + 1), 100);
                        return;
                    } else {
                        console.error('Map container not found after 10 attempts! mapId:', mapId);
                        return;
                    }
                }

                if (!window.kakao || !window.kakao.maps) {
                    console.error('Kakao Maps API not loaded!');
                    return;
                }

                try {
                    const map = new window.kakao.maps.Map(container, {
                        center: new window.kakao.maps.LatLng(location.lat, location.lng),
                        level: 3,
                    });

                    mapRef.current = map;

                    // 마커 생성
                    const marker = new window.kakao.maps.Marker({
                        position: new window.kakao.maps.LatLng(location.lat, location.lng),
                        map: map,
                    });

                    // 인포윈도우 생성 (주소가 있는 경우)
                    if (location.address) {
                        const infowindow = new window.kakao.maps.InfoWindow({
                            content: `<div style="padding:8px;font-size:12px;white-space:nowrap;">${location.address}</div>`
                        });
                        infowindow.open(map, marker);
                    }

                    setIsMapReady(true);
                } catch (error) {
                    console.error('Error creating map:', error);
                }
            };

            // DOM 렌더링 완료를 위해 약간의 지연 후 컨테이너 확인 시작
            setTimeout(() => waitForContainer(), 50);
        };

        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=a7829b6eedfe1d85903c6c1e90a99606&autoload=false&libraries=services';
            script.async = true;

            script.onload = () => {
                window.kakao.maps.load(() => {
                    initMap();
                });
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
                }, 100);
            }
        }
    }, [location, mapId]);

    // 카카오맵에서 길찾기
    const openKakaoRoute = () => {
        if (!location) return;

        const url = `https://map.kakao.com/link/to/${encodeURIComponent(location.address || '목적지')},${location.lat},${location.lng}`;
        window.open(url, '_blank');
    };

    if (!location || !location.lat || !location.lng) {
        return null;
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            {/* 주소 정보 */}
            {location.address && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                            <div className="p-1 mt-0.5">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">주소</p>
                                <p className="text-gray-800 leading-relaxed">{location.address}</p>
                            </div>
                        </div>
                        <button
                            onClick={openKakaoRoute}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            길찾기
                        </button>
                    </div>
                </div>
            )}

            {/* 지도 */}
            <div className="relative bg-gray-100">
                <div
                    id={mapId}
                    className="w-full h-96"
                    style={{
                        minHeight: '384px',
                        backgroundColor: '#f8f9fa'
                    }}
                >
                    {/* 지도가 로드되지 않았을 때 표시할 기본 콘텐츠 */}
                    {!isMapReady && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-600 font-medium">지도를 불러오는 중...</p>
                                <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationDisplay;