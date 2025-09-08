import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedComponent } from "../common/config/ProtectedLogin";

const Loading = <div>Loading....</div>;

// Scheduler 관련 페이지를 지연 로딩
const SchedulePage = lazy(() =>
  import("../domain/scheduler/pages/SchedulePage")
);

const schedulerRouter = () => {
  return [
    {
      path: "",
      element: <Navigate replace to="schedule" />,
    },
    {
      path: "schedule",
      element: (
        <Suspense fallback={Loading}>
          <ProtectedComponent redirectOnNoAuth={true}>
            <SchedulePage />
          </ProtectedComponent>
        </Suspense>
      ),
    },
  ];
};

export default schedulerRouter;
