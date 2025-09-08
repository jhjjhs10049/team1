// /domain/gyms/hooks/useGymFilter.js
import { useMemo, useEffect } from "react";

const useGymFilter = ({
    gyms, searchTerm, onlyInRadius, userPos, userPosXY, radius, isMapReady,
}) => {
    const distanceMeters = (userPosObj, userXY, g) => {
        try {
            if (window.kakao?.maps?.geometry?.spherical && userPosObj) {
                const d = window.kakao.maps.geometry.spherical.computeDistanceBetween(
                    userPosObj,
                    new window.kakao.maps.LatLng(g.lat, g.lng)
                );
                if (Number.isFinite(d)) return d;
            }
        } catch { }
        const ux = userXY && Number(userXY.lat);
        const uy = userXY && Number(userXY.lng);
        if (!Number.isFinite(ux) || !Number.isFinite(uy)) return Infinity;
        if (!Number.isFinite(g.lat) || !Number.isFinite(g.lng)) return Infinity;

        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(g.lat - ux);
        const dLng = toRad(g.lng - uy);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(ux)) *
            Math.cos(toRad(g.lat)) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const filteredGyms = useMemo(() => {
        if (!isMapReady || (onlyInRadius && !userPos && !userPosXY)) return [];
        return gyms
            .filter((g) => Number.isFinite(g.lat) && Number.isFinite(g.lng))
            .filter((g) => {
                const match = (g.name || "")
                    .toLowerCase()
                    .includes((searchTerm || "").toLowerCase());
                if (!onlyInRadius) return match;
                const d = distanceMeters(userPos, userPosXY, g);
                return match && d <= radius;
            });
    }, [gyms, searchTerm, onlyInRadius, userPos, userPosXY, radius, isMapReady]);

    const sortedGyms = useMemo(() => {
        return filteredGyms
            .map((g) => ({
                ...g,
                _dist: distanceMeters(userPos, userPosXY, g)
            }))
            .sort((a, b) => a._dist - b._dist);
    }, [filteredGyms, userPos, userPosXY]);

    // 원본의 로그 출력도 유지
    useEffect(() => {
        if (!filteredGyms.length) return;
        filteredGyms.slice(0, 5).forEach((g) => {
            const d = distanceMeters(userPos, userPosXY, g);
            console.log(`[DIST] ${g.name} → ${Math.round(d)}m / ${radius}m`);
        });
    }, [filteredGyms, radius, userPos, userPosXY]);

    return { filteredGyms, sortedGyms, distanceMeters };
}

export default useGymFilter;