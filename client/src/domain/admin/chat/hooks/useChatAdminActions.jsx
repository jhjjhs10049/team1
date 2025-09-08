import { useState, useRef } from "react";
import { ADMIN_CONFIG } from "../../../../common/config/pageConfig";

const useChatAdminActions = (
  getList,
  getListByStatus,
  searchChatRooms,
  refreshData
) => {
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSearch, setCurrentSearch] = useState({
    keyword: "",
    type: "all",
  });

  // refreshData 함수의 최신 참조를 저장
  const refreshDataRef = useRef(refreshData);

  // 페이지 클릭 핸들러
  const handleClickPage = (pageInfo) => {
    // PageComponent에서 1부터 시작하는 페이지 번호를 0부터 시작하는 번호로 변환
    const page = pageInfo.page - 1;
    const pageParam = {
      page: page,
      size: pageInfo.size || ADMIN_CONFIG.DEFAULT_SIZE,
    };

    // 현재 필터/검색 상태에 따라 적절한 API 호출
    if (currentSearch.keyword && currentSearch.type !== "all") {
      searchChatRooms(pageParam, currentSearch);
    } else if (currentFilter !== "all") {
      getListByStatus(pageParam, currentFilter);
    } else {
      getList(pageParam);
    }
  };

  // 상태 클릭 핸들러
  const handleStatusClick = (chatRoom) => {
    setSelectedChatRoom(chatRoom);
    setShowStatusModal(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setShowStatusModal(false);
    setSelectedChatRoom(null);
  };

  // 업데이트 핸들러
  const handleUpdate = () => {
    console.log(
      "🔄 수동 새로고침 실행 - 필터:",
      currentFilter,
      "검색:",
      currentSearch
    );
    refreshDataRef.current(currentFilter, currentSearch);
  };

  // 검색 핸들러
  const handleSearch = (searchParams) => {
    setCurrentSearch(searchParams);
    setCurrentFilter("all"); // 검색 시 필터 초기화

    const pageParam = { page: 0, size: ADMIN_CONFIG.DEFAULT_SIZE };
    searchChatRooms(pageParam, searchParams);
  };

  // 상태별 필터 핸들러
  const handleFilterByStatus = (status) => {
    setCurrentFilter(status);
    setCurrentSearch({ keyword: "", type: "all" }); // 필터 시 검색 초기화

    const pageParam = { page: 0, size: ADMIN_CONFIG.DEFAULT_SIZE };
    if (status === "all") {
      getList(pageParam);
    } else {
      getListByStatus(pageParam, status);
    }
  };

  return {
    selectedChatRoom,
    showStatusModal,
    currentFilter,
    currentSearch,
    handleClickPage,
    handleStatusClick,
    handleModalClose,
    handleUpdate,
    handleSearch,
    handleFilterByStatus,
  };
};

export default useChatAdminActions;
