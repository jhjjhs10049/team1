// client/src/domain/tip/api/fitnessTipApi.js
import api from "../../global/api/axios";
import jwtAxios from "../../member/util/JWTUtil";

// 랜덤 팁 조회 (메인페이지용)
export const fetchRandomTip = () =>
    api.get('/api/fitness-tips/random').then(res => res.data);

// 활성화된 팁 목록 조회
export const fetchActiveTips = () =>
    api.get('/api/fitness-tips/active').then(res => res.data);

// 모든 팁 목록 조회 (관리자용)
export const fetchAllTips = () =>
    jwtAxios.get('/api/fitness-tips/admin').then(res => res.data);

// 팁 상세 조회
export const fetchTipDetail = (tipNo) =>
    api.get(`/api/fitness-tips/${tipNo}`).then(res => res.data);

// 팁 생성 (관리자용)
export const createTip = (tipData) =>
    jwtAxios.post('/api/fitness-tips/admin', tipData).then(res => res.data);

// 팁 수정 (관리자용)
export const updateTip = (tipNo, tipData) =>
    jwtAxios.put(`/api/fitness-tips/admin/${tipNo}`, tipData).then(res => res.data);

// 팁 삭제 (관리자용)
export const deleteTip = (tipNo) =>
    jwtAxios.delete(`/api/fitness-tips/admin/${tipNo}`).then(res => res.data);

// 팁 활성화/비활성화 (관리자용)
export const toggleTipStatus = (tipNo, modifiedBy) =>
    jwtAxios.patch(`/api/fitness-tips/admin/${tipNo}/toggle`, null, {
        params: { modifiedBy }
    }).then(res => res.data);