import { useEffect } from "react";

const useAutoRecenter = ({ mapRef, getUserLatLng, userPos, userPosXY }) => {
    const debounce = (fn, wait = 250) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    };

    useEffect(() => {
        if (!mapRef.current) return;

        const recenterToUser = () => {
            if (!mapRef.current) return;
            mapRef.current.relayout();
            const target = getUserLatLng();
            if (target) mapRef.current.setCenter(target);
        };

        const handler = debounce(recenterToUser, 250);

        window.addEventListener("resize", handler);
        window.addEventListener("orientationchange", handler);

        return () => {
            window.removeEventListener("resize", handler);
            window.removeEventListener("orientationchange", handler);
        };
    }, [mapRef, getUserLatLng, userPos, userPosXY]);
}

export default useAutoRecenter