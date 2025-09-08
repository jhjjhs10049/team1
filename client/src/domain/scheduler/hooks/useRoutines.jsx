import { useCallback, useEffect, useMemo, useState } from "react";
import {
    fetchRoutines,
    fetchRoutineDetail,
    createRoutine,
    updateRoutine,
    deleteRoutine,
} from "../api/scheduleApi.jsx";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const useRoutines = () => {
    const { isLogin, moveToLogin } = useCustomLogin();
    const [routines, setRoutines] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAuthError = (e) => {
        console.error("[useRoutines] 요청 에러", {
            status: e?.response?.status,
            data: e?.response?.data,
            url: e?.config?.url,
        });
        if (e?.response?.status === 401) {
            console.warn("[useRoutines] 401 → 로그인 페이지로 이동");
            moveToLogin();
        }
    };

    const load = useCallback(async () => {
        if (!isLogin) return;
        setLoading(true); setError(null);
        try {
            const data = await fetchRoutines();
            setRoutines(data || []);
        } catch (e) {
            setError(e); handleAuthError(e);
        } finally {
            setLoading(false);
        }
    }, [isLogin]);

    const loadDetail = useCallback(async (routineNo) => {
        if (!isLogin) return;
        setDetailLoading(true); setError(null);
        try {
            const data = await fetchRoutineDetail(routineNo);
            setSelected(data);
        } catch (e) {
            setError(e); handleAuthError(e);
        } finally {
            setDetailLoading(false);
        }
    }, [isLogin]);

    const create = useCallback(async (dto) => {
        try {
            const created = await createRoutine(dto);
            setRoutines((prev) => [created, ...prev]);
            return created;
        } catch (e) { handleAuthError(e); throw e; }
    }, []);

    const update = useCallback(async (routineNo, dto) => {
        try {
            const updated = await updateRoutine(routineNo, dto);
            setRoutines((prev) => prev.map(r => r.routineNo === routineNo ? updated : r));
            if (selected?.routineNo === routineNo) setSelected(updated);
            return updated;
        } catch (e) { handleAuthError(e); throw e; }
    }, [selected]);

    const remove = useCallback(async (routineNo) => {
        try {
            await deleteRoutine(routineNo);
            setRoutines((prev) => prev.filter(r => r.routineNo !== routineNo));
            if (selected?.routineNo === routineNo) setSelected(null);
        } catch (e) { handleAuthError(e); throw e; }
    }, [selected]);

    useEffect(() => { if (isLogin) load(); }, [isLogin, load]);

    return useMemo(() => ({
        ready: isLogin, routines, selected,
        loading, detailLoading, error,
        load, loadDetail, create, update, remove, setSelected
    }), [isLogin, routines, selected, loading, detailLoading, error, load, loadDetail, create, update, remove]);
}

export default useRoutines;