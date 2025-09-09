import { createSlice } from "@reduxjs/toolkit";
import {
  getCookie,
  setCookie,
  removeCookie,
} from "../../member/util/cookieUtil";

// 초기 상태 정의 및 쿠키에서 위치 정보 로딩
const initState = {
  lat: 37.5665, // 서울 기본 좌표
  lng: 126.978,
};

const loadLocationCookie = () => {
  const locationInfo = getCookie("userLocation");
  return locationInfo || initState;
};

// 위치 정보 관리 slice
const locationSlice = createSlice({
  name: "LocationSlice",
  initialState: loadLocationCookie(),
  reducers: {
    // 위치 정보 업데이트
    updateLocation: (state, action) => {
      const { lat, lng } = action.payload;
      state.lat = lat;
      state.lng = lng;

      // 쿠키에도 저장 (7일 유지)
      setCookie("userLocation", { lat, lng }, 7);
    },
    // 위치 정보 초기화
    resetLocation: (state) => {
      state.lat = initState.lat;
      state.lng = initState.lng;

      // 쿠키에서 제거
      removeCookie("userLocation");
    },
  },
});

export const { updateLocation, resetLocation } = locationSlice.actions;
export default locationSlice.reducer;
