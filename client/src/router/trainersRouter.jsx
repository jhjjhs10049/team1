import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedComponent } from "../common/config/ProtectedLogin";

const Loading = <div>Loading....</div>;

// Trainer 관련 페이지들을 지연 로딩
const TrainerListPage = lazy(() =>
  import("../domain/trainers/pages/TrainerListPage")
);
const TrainerDetailPage = lazy(() =>
  import("../domain/trainers/pages/TrainerDetailPage")
);
const TrainerReviewPage = lazy(() =>
  import("../domain/trainers/pages/TrainerReviewPage")
);

const trainersRouter = () => {
  return [
    {
      path: "",
      element: <Navigate replace to="list" />,
    },
    {
      path: "list",
      element: (
        <Suspense fallback={Loading}>
          <TrainerListPage />
        </Suspense>
      ),
    },
    {
      path: "detail/:trainerno",
      element: (
        <Suspense fallback={Loading}>
          <TrainerDetailPage />
        </Suspense>
      ),
    },
    {
      path: "review/:trainerno",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent redirectMessage="트레이너 리뷰를 작성하려면 로그인이 필요합니다.">
            <TrainerReviewPage />
          </ProtectedComponent>
        </Suspense>
      ),
    },
  ];
};

export default trainersRouter;
