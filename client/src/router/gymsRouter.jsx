import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedComponent } from "../common/config/ProtectedLogin";

const Loading = <div>Loading....</div>;

// Gym 관련 페이지들을 지연 로딩
const MapGymsPage = lazy(() => import("../domain/gyms/pages/MapGymsPage"));
const GymDetailPage = lazy(() => import("../domain/gyms/pages/GymDetailPage"));
const GymReviewPage = lazy(() => import("../domain/gyms/pages/GymReviewPage"));
const GymPurchasePage = lazy(() =>
  import("../domain/gyms/pages/GymPurchasePage")
);
const FavoriteGymsPage = lazy(() =>
  import("../domain/gyms/pages/FavoriteGymsPage")
);

const gymsRouter = () => {
  return [
    {
      path: "",
      element: <Navigate replace to="map" />,
    },
    {
      path: "map",
      element: (
        <Suspense fallback={Loading}>
          <MapGymsPage />
        </Suspense>
      ),
    },
    {
      path: "detail/:gymno",
      element: (
        <Suspense fallback={Loading}>
          <GymDetailPage />
        </Suspense>
      ),
    },
    {
      path: ":gymno", // REST API 스타일 헬스장 상세 라우트 추가
      element: (
        <Suspense fallback={Loading}>
          <GymDetailPage />
        </Suspense>
      ),
    },
    {
      path: "review/:gymno",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent redirectMessage="헬스장 리뷰를 작성하려면 로그인이 필요합니다.">
            <GymReviewPage />
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      path: ":gymno/reviews", // REST API 스타일 라우트 추가
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent redirectMessage="헬스장 리뷰를 작성하려면 로그인이 필요합니다.">
            <GymReviewPage />
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      path: "purchase/:gymno",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent redirectMessage="헬스장 이용권을 구매하려면 로그인이 필요합니다.">
            <GymPurchasePage />
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      path: ":gymno/purchase", // REST API 스타일 구매 라우트 추가
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent redirectMessage="헬스장 이용권을 구매하려면 로그인이 필요합니다.">
            <GymPurchasePage />
          </ProtectedComponent>
        </Suspense>
      ),
    },
    {
      path: "favorites",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent redirectMessage="즐겨찾기 목록을 보려면 로그인이 필요합니다.">
            <FavoriteGymsPage />
          </ProtectedComponent>
        </Suspense>
      ),
    },
  ];
};

export default gymsRouter;
