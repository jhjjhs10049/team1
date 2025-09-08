import { lazy, Suspense } from "react";
import { ProtectedComponent } from "../common/config/ProtectedLogin";

const Loading = <div>Loading....</div>;

// 지연 로딩 컴포넌트
const BoardList = lazy(() =>
  import("../domain/board/list/pages/BoardListPage")
);
const BoardDetail = lazy(() =>
  import("../domain/board/list/pages/BoardDetailPage")
);
const BoardForm = lazy(() =>
  import("../domain/board/list/pages/BoardFormPage")
);
const NoticeRegister = lazy(() =>
  import("../domain/board/ann/pages/NoticeRegisterPage")
);

const boardRouter = () => {
  return [
    {
      // (원하면 별칭) /board  — 공개
      path: "",
      element: (
        <Suspense fallback={Loading}>
          <BoardList />
        </Suspense>
      ),
    },
    {
      // /board/read/:bno  — 공개
      path: "read/:bno",
      element: (
        <Suspense fallback={Loading}>
          <BoardDetail />
        </Suspense>
      ),
    },
    {
      // /board/register  — 로그인 필요
      path: "register",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent>
            <BoardForm />
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      // /board/modify/:bno  — 로그인 필요
      path: "modify/:bno",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent>
            <BoardForm />
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      // /board/notice/register  — 관리자/매니저만 가능
      path: "notice/register",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent>
            <NoticeRegister />
          </ProtectedComponent>
        </Suspense>
      ),
    },
  ];
};

export default boardRouter;
