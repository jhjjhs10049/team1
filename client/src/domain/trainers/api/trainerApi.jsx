import api from "../../global/api/axios";
import jwtAxios from "../../member/util/JWTUtil";

// axios(인증 불필요)
// 트레이너 목록
export const fetchTrainers = (params = {}) => {
    console.log("[fetchTrainers] 요청:", "/api/trainers", params);
    return api.get(`/api/trainers`, { params }).then(res => {
        console.log("[fetchTrainers] 응답 data:", res.data);
        return res.data;
    });
};

// 트레이너 상세
export const fetchTrainerDetail = (trainerNo) =>
    api.get(`/api/trainers/${trainerNo}`).then(res => res.data);

// 트레이너 리뷰 목록
export const fetchTrainerReviews = (trainerNo) =>
    api.get(`/api/trainers/${trainerNo}/reviews`).then(res => res.data);

// jwtAxios(인증 필요)
// 트레이너 리뷰 작성
export const createTrainerReview = (trainerNo, reviewData) =>
    jwtAxios.post(`/api/trainers/${trainerNo}/reviews`, reviewData).then(res => res.data);

// 트레이너 리뷰 삭제
export const deleteTrainerReview = (trainerNo, reviewNo, memberNo) =>
    jwtAxios.delete(`/api/trainers/${trainerNo}/reviews/${reviewNo}`, {
        params: { memberNo },
    }).then(res => res.data);

// 트레이너 CUD (ADMIN)
export const createTrainer = (dto) =>
    jwtAxios.post(`/api/admin/trainers`, dto).then(res => res.data);

export const updateTrainer = (trainerNo, dto) =>
    jwtAxios.put(`/api/admin/trainers/${trainerNo}`, dto).then(res => res.data);

export const deleteTrainer = (trainerNo) =>
    jwtAxios.delete(`/api/admin/trainers/${trainerNo}`).then(res => res.data);