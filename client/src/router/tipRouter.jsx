// client/src/router/tipRouter.jsx
import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { AdminManagerComponent } from "../common/config/ProtectedAdmin";

const Loading = <div>Loading....</div>;

const FitnessTipManagePage = lazy(() =>
    import("../domain/tip/pages/FitnessTipManagePage")
);

const tipRouter = () => {
    return [
        {
            path: "manage",
            element: (
                <AdminManagerComponent>
                    <Suspense fallback={Loading}>
                        <FitnessTipManagePage />
                    </Suspense>
                </AdminManagerComponent>
            ),
        },
        {
            path: "",
            element: <Navigate replace to="manage" />,
        },
    ];
};

export default tipRouter;