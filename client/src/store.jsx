import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./domain/member/login/slices/loginSlice";

// Store ? 전역변수 개념이다.
// Store 객체 생성을 위해 configureStore 를 사용
const store = configureStore({
  reducer: {
    loginSlice: loginSlice, // 생성된 slice 를 store 에 설정
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 비직렬화 가능한 값들을 허용하는 경로 설정
        ignoredActionsPaths: [
          "error",
          "meta.arg",
          "payload.timestamp",
          "payload.banInfo",
          "error.banInfo",
        ],
        ignoredStatePaths: ["banInfo"],
      },
    }),
});

export default store;
