import axios from "axios";

// 행정안전부 API 키 (환경변수 사용 - 보안 강화)
const MOIS_API_KEY = import.meta.env.VITE_MOIS_API_KEY;
// 행정안전부 우편번호 서비스 API
const MOIS_API_URL = "https://business.juso.go.kr/addrlink/addrLinkApi.do";

/**
 * 행정안전부 우편번호 서비스 - 도로명주소 검색
 * @param {string} keyword - 검색할 주소 키워드
 * @param {number} currentPage - 현재 페이지 (기본값: 1)
 * @param {number} countPerPage - 페이지당 결과 수 (기본값: 10)
 * @returns {Promise} 검색 결과
 */
export const searchAddress = async (
  keyword,
  currentPage = 1,
  countPerPage = 10
) => {
  try {
    const params = {
      confmKey: MOIS_API_KEY,
      currentPage: currentPage,
      countPerPage: countPerPage,
      keyword: keyword,
      resultType: "json",
    };

    const response = await axios.get(MOIS_API_URL, { params });
    return response.data;
  } catch (error) {
    console.error("주소 검색 API 오류:", error);
    throw error;
  }
};

/**
 * 행정안전부 우편번호 서비스 - 우편번호로 주소 검색
 * @param {string} zipcode - 우편번호
 * @returns {Promise} 검색 결과
 */
export const searchByZipcode = async (zipcode) => {
  try {
    const params = {
      confmKey: MOIS_API_KEY,
      currentPage: 1,
      countPerPage: 10,
      keyword: zipcode,
      resultType: "json",
    };

    const response = await axios.get(MOIS_API_URL, { params });
    return response.data;
  } catch (error) {
    console.error("우편번호 검색 API 오류:", error);
    throw error;
  }
};

/**
 * 행정안전부 주소 데이터를 표준화된 형태로 변환
 * @param {Object} addressData - 행정안전부 API 응답 데이터
 * @returns {Object} 표준화된 주소 객체
 */
export const formatMoisAddress = (addressData) => {
  return {
    zipcode: addressData.zipNo || "",
    roadAddress: addressData.roadAddr || "",
    jibunAddress: addressData.jibunAddr || "",
    detailAddress: "",
    extraAddress: addressData.admCd || "",
    buildingName: addressData.bdNm || "",
    buildingCode: addressData.bdKdcd || "",
    sido: addressData.siNm || "",
    sigungu: addressData.sggNm || "",
    roadName: addressData.rn || "",
    buildingNumber: addressData.buldMnnm || "",
    buildingSubNumber: addressData.buldSlno || "",
  };
};
