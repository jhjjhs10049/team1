import axios from "../../../global/api/axios";

const prefix = `/api/admin/member`; // baseURL은 axios 인스턴스에서 설정되므로 상대 경로 사용

// 회원 목록 조회 (admin은 manager도 볼 수 있음)
export const getAllMembers = async (adminRole, searchParams = null) => {
  try {
    // JWT 인터셉터가 자동으로 토큰을 처리하므로 별도 토큰 확인 불필요

    // 기본 파라미터
    const params = { adminRole: adminRole };

    // 검색 파라미터가 있으면 추가
    if (searchParams && searchParams.keyword && searchParams.keyword.trim()) {
      params.keyword = searchParams.keyword.trim();
      params.searchType = searchParams.type || "all";
    }

    const res = await axios.get(`${prefix}/list`, { params });

    // 백엔드에서 오류 응답이 온 경우
    if (
      res.data &&
      typeof res.data === "object" &&
      res.data.success === false
    ) {
      throw new Error(res.data.message || "회원 목록 조회에 실패했습니다.");
    } // 정상적인 배열 응답이거나 구조화된 응답의 data 부분 반환
    const result = Array.isArray(res.data) ? res.data : res.data.data || [];
    return result;
  } catch (error) {
    console.error("회원 목록 조회 실패:", error.response?.status);
    throw error;
  }
};

// 회원 정지
export const banMember = async (banRequest) => {
  try {
    const res = await axios.post(`${prefix}/ban`, banRequest);
    return res.data;
  } catch (error) {
    console.error("회원 정지 오류:", error.response?.status);
    throw error;
  }
};

// 회원 정지 해제
export const unbanMember = async (memberNo, adminRoleCode) => {
  try {
    const res = await axios.post(`${prefix}/unban`, null, {
      params: { memberNo, adminRoleCode },
    });
    return res.data;
  } catch (error) {
    console.error("회원 정지 해제 오류:", error.response?.status);
    throw error;
  }
};

// 계정 복구
export const restoreMember = async (memberNo) => {
  try {
    const res = await axios.post(`${prefix}/restore`, null, {
      params: { memberNo },
    });
    return res.data;
  } catch (error) {
    console.error("계정 복구 오류:", error.response?.status);
    throw error;
  }
};

// 회원 권한 변경 (ADMIN만 가능)
export const changeMemberRole = async (memberNo, newRole) => {
  try {
    const res = await axios.post(`${prefix}/change-role`, null, {
      params: { memberNo, newRole },
    });
    return res.data;
  } catch (error) {
    console.error("회원 권한 변경 오류:", error);
    throw error;
  }
};

// 회원 정지 내역 조회
export const getBanHistory = async (memberNo) => {
  try {
    const res = await axios.get(`${prefix}/ban-history/${memberNo}`);
    return res.data;
  } catch (error) {
    console.error("정지 내역 조회 오류:", error);
    throw error;
  }
};

// 관리자 조치 내역 조회
export const getAdminActions = async (adminRoleCode) => {
  try {
    const res = await axios.get(`${prefix}/admin-actions/${adminRoleCode}`);
    return res.data;
  } catch (error) {
    console.error("관리자 조치 내역 조회 오류:", error);
    throw error;
  }
};
