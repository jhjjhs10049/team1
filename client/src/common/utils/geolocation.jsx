// client/src/common/utils/geolocation.js
/**
 * 사용자의 현재 위치를 가져오는 함수
 * @returns {Promise<{lat: number, lng: number}>} 위치 좌표
 */
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation이 지원되지 않는 브라우저입니다.'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5분
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            options
        );
    });
};

/**
 * 기본 위치 좌표 (서울시청)
 */
export const DEFAULT_LOCATION = {
    lat: 37.5666805,
    lng: 126.9784147
};

/**
 * 위치 정보를 가져오되, 실패시 기본 위치 반환
 * @returns {Promise<{lat: number, lng: number, isDefault: boolean}>}
 */
export const getLocationWithFallback = async () => {
    try {
        const position = await getCurrentPosition();
        return { ...position, isDefault: false };
    } catch (error) {
        console.warn('위치 정보를 가져올 수 없어 기본 위치를 사용합니다:', error.message);
        return { ...DEFAULT_LOCATION, isDefault: true };
    }
};