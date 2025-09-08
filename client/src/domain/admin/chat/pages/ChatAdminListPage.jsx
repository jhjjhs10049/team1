import { useEffect } from "react";
import { ADMIN_CONFIG } from "../../../../common/config/pageConfig";
import PageComponent from "../../../../common/components/PageComponent";
import StatusModal from "../components/StatusModal";
import ChatAdminSearchComponent from "../components/ChatAdminSearchComponent";
import AdminHeader from "../../common/components/AdminHeader";
import ChatAdminTable from "../components/ChatAdminTable";
import BasicLayout from "../../../../layouts/BasicLayout";
import { AdminManagerComponent } from "../../../../common/config/ProtectedAdmin";
import useCustomChatAdmin from "../hooks/useCustomChatAdmin";
import useChatAdminWebSocket from "../hooks/useChatAdminWebSocket";
import useChatAdminActions from "../hooks/useChatAdminActions";
import { getStatusColor, getStatusText } from "../utils/chatAdminStatus";

const ChatAdminListPage = () => {
  const {
    serverData,
    fetching,
    getList,
    getListByStatus,
    searchChatRooms,
    refreshData,
  } = useCustomChatAdmin();

  const {
    selectedChatRoom,
    showStatusModal,
    handleClickPage,
    handleStatusClick,
    handleModalClose,
    handleUpdate,
    handleSearch,
    handleFilterByStatus,
  } = useChatAdminActions(
    getList,
    getListByStatus,
    searchChatRooms,
    refreshData
  );
  const { isAuthenticationReady } = useChatAdminWebSocket(refreshData);

  // 초기 데이터 로딩 (인증 완료 후에만)
  useEffect(() => {
    if (!isAuthenticationReady) {
      console.log("⚠️ JWT 인증 대기 중 - 데이터 로딩 연기");
      return;
    }

    const pageParam = { page: 0, size: ADMIN_CONFIG.DEFAULT_SIZE };
    console.log("✅ JWT 인증 완료 - 채팅방 데이터 로딩 시작");
    getList(pageParam);
  }, [getList, isAuthenticationReady]); // 인증 상태 의존성 추가

  return (
    <AdminManagerComponent>
      <BasicLayout>
        <div className="flex justify-center">
          <div className="w-full max-w-7xl">
            <div className="p-6">
              <AdminHeader />
              {/* 검색 및 필터 컴포넌트 */}
              <ChatAdminSearchComponent
                onSearch={handleSearch}
                onFilterByStatus={handleFilterByStatus}
                loading={fetching}
              />
              <ChatAdminTable
                serverData={serverData}
                fetching={fetching}
                onStatusClick={handleStatusClick}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
              {/* 페이징이 필요할 때만 표시 */}
              {serverData.totalPage > 1 && (
                <div className="mt-6">
                  <PageComponent
                    serverData={serverData}
                    movePage={handleClickPage}
                    config={ADMIN_CONFIG}
                  />
                </div>
              )}
              <StatusModal
                isOpen={showStatusModal}
                onClose={handleModalClose}
                chatRoom={selectedChatRoom}
                onUpdate={handleUpdate}
              />
              {/* 데이터 개수 표시 (채팅방이 있을 때만) */}
              {serverData.total > 0 && (
                <div className="mt-4 text-right text-sm text-gray-500">
                  총 {serverData.total}개의 채팅방
                </div>
              )}
            </div>
          </div>
        </div>
      </BasicLayout>
    </AdminManagerComponent>
  );
};

export default ChatAdminListPage;
