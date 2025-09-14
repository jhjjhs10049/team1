// client/src/domain/main/hooks/useNearbyGyms.js
import { useState, useEffect } from 'react';
import { fetchGyms } from '../../gyms/api/gymApi';
import { getLocationWithFallback } from '../../../common/utils/geolocation';

/**
 * 주변 피트니스 센터 목록을 가져오는 훅
 * @param {number} radius - 검색 반경 (미터)
 * @param {number} limit - 최대 결과 수
 */
const useNearbyGyms = (radius = 5000, limit = 3) => {
    const [nearbyGyms, setNearbyGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [isDefaultLocation, setIsDefaultLocation] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchNearbyGyms = async () => {
            try {
                setLoading(true);
                setError(null);

                // 사용자 위치 가져오기
                const location = await getLocationWithFallback();

                if (!isMounted) return;

                setUserLocation(location);
                setIsDefaultLocation(location.isDefault);

                // 주변 헬스장 검색
                const gymData = await fetchGyms({
                    lat: location.lat,
                    lng: location.lng,
                    radius: radius,
                    size: limit
                });

                if (!isMounted) return;

                // 데이터 정규화
                const gyms = Array.isArray(gymData?.content) ? gymData.content :
                    Array.isArray(gymData) ? gymData : [];

                // 거리 계산 및 정렬
                const gymsWithDistance = gyms
                    .map(gym => ({
                        gymNo: gym.gymNo,
                        title: gym.title || gym.name || '헬스장',
                        address: gym.address || '주소 정보 없음',
                        lat: Number(gym.locationY ?? gym.lat),
                        lng: Number(gym.locationX ?? gym.lng),
                        distance: calculateDistance(
                            location.lat,
                            location.lng,
                            Number(gym.locationY ?? gym.lat),
                            Number(gym.locationX ?? gym.lng)
                        ),
                        rate: gym.rate || 0,
                        facilities: gym.facilities || []
                    }))
                    .filter(gym => Number.isFinite(gym.lat) && Number.isFinite(gym.lng))
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, limit);

                setNearbyGyms(gymsWithDistance);
            } catch (err) {
                if (!isMounted) return;
                console.error('주변 헬스장 조회 실패:', err);
                setError('주변 헬스장 정보를 불러오는데 실패했습니다.');
                setNearbyGyms([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchNearbyGyms();

        return () => {
            isMounted = false;
        };
    }, [radius, limit]);

    return {
        nearbyGyms,
        loading,
        error,
        userLocation,
        isDefaultLocation
    };
};

/**
 * 두 지점 간의 거리 계산 (Haversine formula)
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} 거리 (미터)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

export default useNearbyGyms;