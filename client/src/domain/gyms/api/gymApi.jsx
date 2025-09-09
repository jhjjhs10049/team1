import api from "../../global/api/axios";
import jwtAxios from "../../member/util/JWTUtil";

// 헬스장 상세 조회 (로그인 상태에 따라 토큰 포함)
// 로그인하지 않은 사용자도 상세 조회가 가능해야 하므로, memberNo가 있을 때만 jwtAxios 사용
export const fetchGymDetail = (gymNo, memberNo) => {
    if (memberNo) {
        // 로그인한 사용자: jwtAxios 사용 (자동으로 토큰 헤더 추가)
        return jwtAxios.get(`/api/gyms/${gymNo}`, {
            params: { memberNo }
        }).then(res => res.data);
    } else {
        // 로그인하지 않은 사용자: 일반 api 사용
        return api.get(`/api/gyms/${gymNo}`).then(res => res.data);
    }
};

// 헬스장 리뷰 목록 조회 (인증 불필요)
export const fetchGymReviews = (gymNo) =>
    api.get(`/api/gyms/${gymNo}/reviews`).then((res) => res.data);

// 헬스장 리뷰 작성 (로그인 필요)
export const createGymReview = (gymNo, reviewData) => {
    return jwtAxios.post(`/api/gyms/${gymNo}/reviews`, reviewData).then((res) => res.data);
};

// 헬스장 리뷰 삭제 (로그인 필요)
export const deleteGymReview = (gymNo, reviewNo, memberNo) => {
    return jwtAxios.delete(`/api/gyms/${gymNo}/reviews/${reviewNo}`, { params: { memberNo } }).then((res) => res.data);
};

// 헬스장 목록 조회 (인증 불필요)
export const fetchGyms = ({ page = 0, size = 30, q = "", lat, lng, radius } = {}) =>
    api
        .get(`/api/gyms`, {
            params: { page, size, q, lat, lng, radius },
        })
        .then((res) => res.data);

// 즐겨찾기 등록/해제 (로그인 필요)
export const toggleFavorite = (gymNo, memberNo, favoriteStatus) =>
    jwtAxios.post(`/api/gyms/${gymNo}/favorite`, null, { params: { memberNo, favorite: favoriteStatus } }).then((res) => res.data);

// 즐겨찾기 목록 조회 (로그인 필요)
export const fetchFavoriteGyms = (memberNo) => {
    return jwtAxios.get(`/api/gyms/favorites/list`, { params: { memberNo } }).then((res) => res.data);
};

// 헬스장 CUD(ADMIN 전용) - (로그인 필요)
export const createGym = (gymData) => {
    return jwtAxios.post(`/api/admin/gyms`, gymData).then((res) => res.data);
};

export const updateGym = (gymNo, gymData) => {
    return jwtAxios.put(`/api/admin/gyms/${gymNo}`, gymData).then((res) => res.data);
};

export const deleteGym = (gymNo) => {
    return jwtAxios.delete(`/api/admin/gyms/${gymNo}`).then((res) => res.data);
};

// 파일 업로드 (로그인 필요)
export const uploadFilesToLocal = async (files = []) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));

    const res = await jwtAxios.post("/api/files/upload", fd, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return Array.isArray(res.data) ? res.data : [];
};

// 나머지 함수들은 인증이 불필요하므로 수정하지 않았습니다.
export const filenamesToViewUrls = (filenames = []) =>
    filenames.map((name) => `/api/files/view/${encodeURIComponent(name)}`);

const toUpsertDTOFromDetail = (detail) => ({
    title: detail.title || "",
    content: detail.content || "",
    address: detail.address || "",
    phoneNumber: detail.phoneNumber || "",
    openingHours: detail.openingHours || "",
    facilities: Array.isArray(detail.facilities) ? detail.facilities : [],
    imageList: Array.isArray(detail.imageList) ? detail.imageList : [],
    locationX: detail.locationX,
    locationY: detail.locationY,
});

export const appendGymImagesByUpload = async (gymNo, files = [], actorMemberNo) => {
    const uploadedNames = await uploadFilesToLocal(files);
    const newUrls = filenamesToViewUrls(uploadedNames);

    const current = await fetchGymDetail(gymNo, actorMemberNo);
    const dto = toUpsertDTOFromDetail(current);

    dto.imageList = Array.from(new Set([...(dto.imageList || []), ...newUrls]));

    return updateGym(gymNo, dto);
};