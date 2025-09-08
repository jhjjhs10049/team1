import { useEffect, useState } from "react";
import { fetchGyms } from "../api/gymApi.jsx";

const normalizeGyms = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
};

const useGyms = () => {
    const [gyms, setGyms] = useState([]);

    useEffect(() => {
        fetchGyms({})
            .then((data) => {
                const list = normalizeGyms(data);
                const adapted = list
                    .map((g) => ({
                        gymNo: g.gymNo,
                        name: g.title || g.name || "",
                        address: g.address || "",
                        lat: Number(g.locationY ?? g.lat),
                        lng: Number(g.locationX ?? g.lng),
                    }))
                    .filter((g) => Number.isFinite(g.lat) && Number.isFinite(g.lng));
                setGyms(adapted);
            })
            .catch(() => setGyms([]));
    }, []);

    return gyms;
}

export default useGyms;