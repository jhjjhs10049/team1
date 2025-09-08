import { createSlice } from "@reduxjs/toolkit";
import { loginPost } from "../../api/memberApi";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, removeCookie, setCookie } from "../../util/cookieUtil";

// 1. 초기 상태 정의 및 쿠키 로딩
const initState = {
  email: "",
  banInfo: null,
  isBannedMember: false,
};

const loadMemberCookie = () => {
  const memberInfo = getCookie("member");
  if (memberInfo && memberInfo.nickname) {
    memberInfo.nickname = decodeURIComponent(memberInfo.nickname);
  }
  return memberInfo;
};

// 2. 비동기 로그인 처리
export const loginPostAsync = createAsyncThunk(
  "loginPostAsync",
  async (param, { rejectWithValue }) => {
    try {
      return await loginPost(param);
    } catch (error) {
      // BannedMemberError인 경우 상세 정보와 함께 reject
      if (
        error.name === "BannedMemberError" ||
        error.message === "MEMBER_BANNED"
      ) {
        return rejectWithValue({
          type: "MEMBER_BANNED",
          banInfo: error.banInfo,
          message: error.message,
          name: error.name,
        });
      }

      // 일반 에러는 그대로 throw
      throw error;
    }
  }
);

// 3. 동기 로그인/로그아웃 처리
const loginSlice = createSlice({
  name: "LoginSlice",
  initialState: loadMemberCookie() || initState,
  reducers: {
    login: (state, action) => {
      const data = action.payload;

      // 카카오 로그인 등 직접 로그인 시 쿠키 설정
      if (data && !data.error) {
        setCookie("member", JSON.stringify(data));
      }

      return { email: data.email, banInfo: null, isBannedMember: false };
    },
    logout: () => {
      removeCookie("member");
      return { ...initState };
    },
    setBanInfo: (state, action) => {
      state.banInfo = action.payload;
      state.isBannedMember = true;
    },
    clearBanInfo: (state) => {
      state.banInfo = null;
      state.isBannedMember = false;
    },
  }, // 4. 비동기 로그인 요청결과에 따라 상태 및 쿠키 업데이트
  extraReducers: (builder) => {
    builder
      .addCase(loginPostAsync.fulfilled, (state, action) => {
        const payload = action.payload;

        if (!payload.error) {
          setCookie("member", JSON.stringify(payload));
        }
        return payload;
      })
      .addCase(loginPostAsync.pending, () => {
        // 로딩 상태 처리
      })
      .addCase(loginPostAsync.rejected, (state, action) => {
        // rejectWithValue로 전달된 banned member 정보 처리
        if (action.payload && action.payload.type === "MEMBER_BANNED") {
          return {
            ...state,
            banInfo: action.payload.banInfo || null,
            isBannedMember: true,
          };
        }

        // BannedMemberError인 경우 상태에 ban 정보 저장 (fallback)
        if (
          action.error?.name === "BannedMemberError" ||
          action.error?.message === "MEMBER_BANNED"
        ) {
          return {
            ...state,
            banInfo: action.error?.banInfo || null,
            isBannedMember: true,
          };
        }

        // 일반 에러인 경우 상태 유지
        return state;
      });
  },
});
export const { login, logout, setBanInfo, clearBanInfo } = loginSlice.actions;
export default loginSlice.reducer;
