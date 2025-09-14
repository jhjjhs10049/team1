import React, { useEffect, useRef, useState } from 'react';

const LocationPicker = ({
    selectedLocation,
    onLocationSelect,
    isVisible,
    onClose
}) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [address, setAddress] = useState('');
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [currentUserLocation, setCurrentUserLocation] = useState(null);

    // 현재 위치 가져오기
    const getCurrentLocation = () => {
        if (!navigator.geolocation) return;

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCurrentUserLocation(location);
                setIsGettingLocation(false);
            },
            (error) => {
                console.error('현재 위치를 가져올 수 없습니다:', error);
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // 카카오맵 스크립트 로드 및 초기화
    useEffect(() => {
        if (!isVisible) return;

        // 컴포넌트가 열릴 때 현재 위치 가져오기
        getCurrentLocation();

        const existingScript = document.querySelector(
            'script[src*="dapi.kakao.com"]'
        );

        const initMap = () => {
            const container = document.getElementById('location-picker-map');
            if (!container) return;

            // 기본 위치 우선순위: 1) 기존 선택된 위치, 2) 현재 위치, 3) 서울 시청
            let defaultLocation;
            if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
                defaultLocation = selectedLocation;
            } else if (currentUserLocation && currentUserLocation.lat && currentUserLocation.lng) {
                defaultLocation = currentUserLocation;
            } else {
                defaultLocation = { lat: 37.5665, lng: 126.9780 }; // 서울 시청
            }

            const map = new window.kakao.maps.Map(container, {
                center: new window.kakao.maps.LatLng(defaultLocation.lat, defaultLocation.lng),
                level: 3,
            });

            mapRef.current = map;

            // 초기 마커 생성
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(defaultLocation.lat, defaultLocation.lng),
                map: map,
                draggable: true
            });

            markerRef.current = marker;

            // 마커 드래그 이벤트
            window.kakao.maps.event.addListener(marker, 'dragend', () => {
                const position = marker.getPosition();
                const newLocation = {
                    lat: position.getLat(),
                    lng: position.getLng()
                };

                // 주소 검색
                getAddressFromCoords(newLocation);
            });

            // 지도 클릭 이벤트
            window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
                const latlng = mouseEvent.latLng;
                const newLocation = {
                    lat: latlng.getLat(),
                    lng: latlng.getLng()
                };

                // 마커 위치 변경
                marker.setPosition(latlng);

                // 주소 검색
                getAddressFromCoords(newLocation);
            });

            // 초기 주소 설정
            if (defaultLocation) {
                getAddressFromCoords(defaultLocation);
            }

            setIsMapReady(true);
        };

        // 좌표로 주소 검색
        const getAddressFromCoords = (location) => {
            if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
                console.error('Kakao Maps services가 로드되지 않았습니다.');
                return;
            }

            try {
                const geocoder = new window.kakao.maps.services.Geocoder();

                geocoder.coord2Address(location.lng, location.lat, (result, status) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                        const address = result[0].address.address_name;
                        setAddress(address);
                    }
                });
            } catch (error) {
                console.error('Geocoder 생성 오류:', error);
            }
        };

        if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=a7829b6eedfe1d85903c6c1e90a99606&autoload=false&libraries=services';
            script.async = true;

            script.onload = () => {
                window.kakao.maps.load(() => {
                    // services 라이브러리가 로드될 때까지 대기
                    const checkServices = () => {
                        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                            initMap();
                        } else {
                            setTimeout(checkServices, 100);
                        }
                    };
                    checkServices();
                });
            };

            document.head.appendChild(script);
        } else {
            if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                initMap();
            } else {
                const intervalId = setInterval(() => {
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        setTimeout(() => {
                            initMap();
                        }, 100);
                        clearInterval(intervalId);
                    }
                }, 100);
            }
        }
    }, [isVisible, selectedLocation]);

    // 현재 위치로 이동
    const moveToCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('브라우저에서 위치 서비스를 지원하지 않습니다.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                console.log('현재 위치 감지:', location);

                if (mapRef.current && markerRef.current) {
                    const latlng = new window.kakao.maps.LatLng(location.lat, location.lng);

                    // 지도 중심을 현재 위치로 이동
                    mapRef.current.setCenter(latlng);

                    // 마커를 현재 위치로 이동
                    markerRef.current.setPosition(latlng);

                    console.log('지도와 마커 위치 업데이트 완료');

                    // 주소 검색
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        try {
                            const geocoder = new window.kakao.maps.services.Geocoder();
                            geocoder.coord2Address(location.lng, location.lat, (result, status) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    const address = result[0].address.address_name;
                                    setAddress(address);
                                    console.log('주소 설정 완료:', address);
                                } else {
                                    console.log('주소를 찾을 수 없습니다');
                                    setAddress('주소를 찾을 수 없습니다');
                                }
                            });
                        } catch (error) {
                            console.error('Geocoder 생성 오류:', error);
                            setAddress('주소를 가져올 수 없습니다');
                        }
                    } else {
                        setAddress('주소를 가져올 수 없습니다');
                    }
                } else {
                    console.error('지도 또는 마커가 초기화되지 않았습니다');
                }
            },
            (error) => {
                console.error('현재 위치를 가져올 수 없습니다:', error);
                let errorMessage = '현재 위치를 가져올 수 없습니다.';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '위치 정보 요청이 시간 초과되었습니다.';
                        break;
                }

                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // 위치 확정
    const handleConfirmLocation = () => {
        if (markerRef.current) {
            const position = markerRef.current.getPosition();
            const location = {
                lat: position.getLat(),
                lng: position.getLng(),
                address: address
            };
            onLocationSelect(location);
            onClose();
        }
    };

    // 위치 삭제
    const handleRemoveLocation = () => {
        onLocationSelect(null);
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">위치 선택</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 지도 영역 */}
                <div className="relative">
                    <div
                        id="location-picker-map"
                        className="w-full h-96"
                    />

                    {/* 현재 위치 버튼 */}
                    <button
                        onClick={moveToCurrentLocation}
                        className="absolute top-4 right-4 bg-teal-600 text-white border border-teal-700 rounded-lg px-3 py-2 shadow-lg hover:bg-teal-700 transition-colors z-10 flex items-center gap-2"
                        title="현재 위치로 이동"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                        </svg>
                        <span className="text-sm font-medium">내 위치로</span>
                    </button>
                </div>

                {/* 주소 정보 */}
                {address && (
                    <div className="p-4 bg-gray-50 border-t">
                        <p className="text-sm text-gray-600 mb-1">선택된 위치:</p>
                        <p className="text-gray-800 font-medium">{address}</p>
                    </div>
                )}

                {/* 안내 텍스트 */}
                <div className="px-4 py-2 bg-blue-50 border-t">
                    <p className="text-sm text-blue-600">
                        💡 지도를 클릭하거나 마커를 드래그하여 위치를 선택하세요.
                    </p>
                </div>

                {/* 버튼 영역 */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                    <button
                        onClick={handleRemoveLocation}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        위치 삭제
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleConfirmLocation}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                            disabled={!address}
                        >
                            위치 확정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;