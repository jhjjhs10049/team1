import React from "react";
import BasicLayout from "../../../../layouts/BasicLayout";
import AdminMemberManager from "../components/AdminMemberManager";
import AdminHeader from "../../common/components/AdminHeader";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const AdminPage = () => {
  const { loginState } = useCustomLogin();

  // 관리자/매니저 권한 확인
  const userRole = loginState?.roleNames?.[0];

  if (
    !loginState ||
    !userRole ||
    (userRole !== "ADMIN" && userRole !== "MANAGER")
  ) {
    return (
      <BasicLayout>
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">
                접근 권한이 없습니다
              </h2>
              <p className="mt-2 text-gray-600">
                관리자 또는 매니저 권한이 필요합니다.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                현재 권한: {userRole || "없음"}
              </p>
            </div>
          </div>
        </div>
      </BasicLayout>
    );
  }
  return (
    <BasicLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <div className="p-6">
            <AdminHeader />
            <AdminMemberManager />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default AdminPage;
