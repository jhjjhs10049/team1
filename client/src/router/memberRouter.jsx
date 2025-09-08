import { lazy, Suspense } from "react";

const Loading = <div>Loading....</div>;
const Login = lazy(() => import("../domain/member/login/pages/LoginPage"));
const Join = lazy(() => import("../domain/member/join/pages/JoinPage"));
const KakaoRedirect = lazy(() =>
  import("../domain/member/login/pages/KakaoRedirectPage")
);
const MemberModify = lazy(() =>
  import("../domain/member/mypage/pages/ModifyPage")
);
const MyPage = lazy(() => import("../domain/member/mypage/pages/MyPage"));

const memberRouter = () => {
  return [
    {
      path: "login",
      element: (
        <Suspense fallback={Loading}>
          <Login />
        </Suspense>
      ), //로그인 페이지로 이동
    },
    {
      path: "join",
      element: (
        <Suspense fallback={Loading}>
          <Join />
        </Suspense>
      ), //회원가입 페이지로 이동
    },
    {
      path: "kakao",
      element: (
        <Suspense fallback={Loading}>
          <KakaoRedirect />
        </Suspense>
      ),
    },
    {
      path: "modify",
      element: (
        <Suspense fallback={Loading}>
          <MemberModify />
        </Suspense>
      ),
    },
    {
      path: "mypage",
      element: (
        <Suspense fallback={Loading}>
          <MyPage />
        </Suspense>
      ),
    },
    {
      path: "mypage",
      element: (
        <Suspense fallback={Loading}>
          <MyPage />
        </Suspense>
      ),
    },
  ];
};

export default memberRouter;
