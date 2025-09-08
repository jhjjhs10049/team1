import useCustomLogin from "../../../member/login/hooks/useCustomLogin";
import { useState } from "react";
import AdminToggleButtons from "./AdminToggleButtons";
import AdminStatusCard from "./AdminStatusCard";
import SubscriptionModal from "./SubscriptionModal";

const AdminHeader = () => {
  const { loginState } = useCustomLogin();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            관리자 대시보드
          </h1>

          <p className="text-gray-600 text-sm sm:text-base mb-3">
            관리자:
            <span className="font-medium text-teal-600">
              {loginState?.email}
            </span>
            {loginState?.nickname && (
              <span className="text-gray-500"> ({loginState.nickname})</span>
            )}
          </p>

          {/* 토글 버튼 */}
          <AdminToggleButtons />
        </div>

        {/* 오른쪽 상태 정보 카드 */}
        <AdminStatusCard
          loginState={loginState}
          onShowModal={() => setShowSubscriptionModal(true)}
        />
      </div>
      {/* 구독 상태 모달 */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        loginState={loginState}
      />
    </div>
  );
};

export default AdminHeader;
