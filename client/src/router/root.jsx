import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import memberRouter from "./memberRouter";
import { ProtectedComponent } from "../common/config/ProtectedLogin";
import { AdminManagerComponent } from "../common/config/ProtectedAdmin";

// board
import boardRouter from "./boardRouter";
// support
import supportRouter from "./supportRouter";
// multchat
import multchatRouter from "./multChatRouter";
// gyms
import gymsRouter from "./gymsRouter";
// scheduler
import schedulerRouter from "./schedulerRouter";
// trainers
import trainersRouter from "./trainersRouter";
// tip (운동 팁 관리)
import tipRouter from "./tipRouter";

// page

// import MapGymsPage from "../domain/gyms/pages/MapGymsPage.jsx";
// import GymDetailPage from "../domain/gyms/pages/GymDetailPage.jsx";
// import GymReviewPage from "../domain/gyms/pages/GymReviewPage.jsx";

// import TrainerListPage from "../domain/trainers/pages/TrainerListPage";
// import TrainerDetailPage from "../domain/trainers/pages/TrainerDetailPage";
// import TrainerReviewPage from "../domain/trainers/pages/TrainerReviewPage";

const Loading = <div>Loading....</div>;
// lazy()를 사용하여 컴포넌트를 동적으로 import
// 지연로딩 을 통해 초기 로딩 속도를 개선 필요한 시점에 컴포넌트 로드

const MainPage = lazy(() => import("../domain/main/pages/MainPage"));
const AdminPage = lazy(() => import("../domain/admin/member/pages/AdminPage"));
const ChatAdminListPage = lazy(() =>
  import("../domain/admin/chat/pages/ChatAdminListPage")
);

const root = createBrowserRouter([
  {
    // (루트 경로) → MainPage 컴포넌트를 렌더링
    path: "",
    element: (
      <Suspense fallback={Loading}>
        <MainPage />
      </Suspense>
    ),
  },
  {
    // /admin 경로 접근 시 /admin/member로 리다이렉트
    path: "/admin",
    element: <Navigate to="/admin/member" replace />,
  },
  {
    // 어드민 회원관리 페이지 렌더링 (어드민 필요)
    path: "/admin/member",
    element: (
      <Suspense fallback={Loading}>
        <AdminManagerComponent redirectOnNoAuth={true}>
          <AdminPage />
        </AdminManagerComponent>
      </Suspense>
    ),
  },
  {
    // 어드민 채팅관리 페이지 렌더링 (어드민 필요)
    path: "/admin/chat",
    element: (
      <Suspense fallback={Loading}>
        <AdminManagerComponent redirectOnNoAuth={true}>
          <ChatAdminListPage />
        </AdminManagerComponent>
      </Suspense>
    ),
  },
  {
    path: "member",
    children: memberRouter(),
  },

  // board
  {
    path: "board",
    children: boardRouter(),
  }, // support
  {
    path: "support",
    children: supportRouter(),
  }, // multchat
  {
    path: "multchat",
    children: multchatRouter(),
  },
  // gyms
  {
    path: "gyms",
    children: gymsRouter(),
  },
  // scheduler
  {
    path: "scheduler",
    children: schedulerRouter(),
  },
  // trainers
  {
    path: "trainers",
    children: trainersRouter(),
  },
  // tip management (관리자용)
  {
    path: "admin/tips",
    children: tipRouter(),
  },

  // 404 에러 처리 (모든 경로의 맨 마지막에 배치)
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-6">페이지를 찾을 수 없습니다.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    ),
  },
]);

export default root;
