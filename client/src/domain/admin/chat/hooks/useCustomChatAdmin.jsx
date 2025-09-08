import { useState, useCallback } from "react";
import { ADMIN_CONFIG } from "../../../../common/config/pageConfig";
import jwtAxios from "../../../member/util/JWTUtil";

const useCustomChatAdmin = () => {
  const [serverData, setServerData] = useState({
    dtoList: [],
    pageNumList: [],
    pageRequestDTO: null,
    prev: false,
    next: false,
    totalCount: 0,
    prevPage: 0,
    nextPage: 0,
    totalPage: 0,
    current: 0,
    size: ADMIN_CONFIG.DEFAULT_SIZE,
  });
  const [fetching, setFetching] = useState(false);

  const getList = useCallback(async (pageParam) => {
    const { page = 0, size = ADMIN_CONFIG.DEFAULT_SIZE } = pageParam || {};

    setFetching(true);
    try {
      const response = await jwtAxios.get(`/api/admin/chat/list`, {
        params: { page, size },
      });

      const data = response.data;

      // Spring Boot Page 객체를 PageComponent가 기대하는 형태로 변환
      const totalPages = data.totalPages;
      const currentPage = data.number;
      const pageGroupSize = ADMIN_CONFIG.PAGE_GROUP_SIZE;

      // 페이지 그룹 계산
      const groupStart =
        Math.floor(currentPage / pageGroupSize) * pageGroupSize;
      const groupEnd = Math.min(groupStart + pageGroupSize, totalPages);

      const pageNumList = [];
      for (let i = groupStart; i < groupEnd; i++) {
        pageNumList.push(i + 1);
      }

      setServerData({
        dtoList: data.content || [],
        pageNumList,
        pageRequestDTO: { page: currentPage, size: data.size },
        prev: groupStart > 0,
        next: groupEnd < totalPages,
        totalCount: data.totalElements,
        prevPage: groupStart > 0 ? groupStart : 0,
        nextPage: groupEnd < totalPages ? groupEnd + 1 : totalPages,
        totalPage: totalPages,
        current: currentPage + 1,
        size: data.size,
      });
    } catch (error) {
      console.error("채팅방 목록 조회 실패:", error);
      setServerData((prev) => ({
        ...prev,
        dtoList: [],
        totalCount: 0,
      }));
    } finally {
      setFetching(false);
    }
  }, []);

  // 상태별 채팅방 조회
  const getListByStatus = useCallback(async (pageParam, status) => {
    const { page = 0, size = ADMIN_CONFIG.DEFAULT_SIZE } = pageParam || {};

    setFetching(true);

    try {
      const endpoint =
        status === "all"
          ? `/api/admin/chat/list`
          : `/api/admin/chat/list/${status}`;
      const response = await jwtAxios.get(endpoint, {
        params: { page, size },
      });

      const data = response.data;

      // 페이징 데이터 처리
      const totalPages = data.totalPages;
      const currentPage = data.number;
      const pageGroupSize = ADMIN_CONFIG.PAGE_GROUP_SIZE;

      const groupStart =
        Math.floor(currentPage / pageGroupSize) * pageGroupSize;
      const groupEnd = Math.min(groupStart + pageGroupSize, totalPages);

      const pageNumList = [];
      for (let i = groupStart; i < groupEnd; i++) {
        pageNumList.push(i + 1);
      }

      setServerData({
        dtoList: data.content || [],
        pageNumList,
        pageRequestDTO: { page: currentPage, size: data.size },
        prev: groupStart > 0,
        next: groupEnd < totalPages,
        totalCount: data.totalElements,
        prevPage: groupStart > 0 ? groupStart : 0,
        nextPage: groupEnd < totalPages ? groupEnd + 1 : totalPages,
        totalPage: totalPages,
        current: currentPage + 1,
        size: data.size,
      });
    } catch (error) {
      console.error("상태별 채팅방 조회 실패:", error);
      setServerData((prev) => ({
        ...prev,
        dtoList: [],
        totalCount: 0,
      }));
    } finally {
      setFetching(false);
    }
  }, []);

  // 검색 기능 - 새로운 통합 검색
  const searchChatRooms = useCallback(
    async (pageParam, searchParams) => {
      const { page = 0, size = ADMIN_CONFIG.DEFAULT_SIZE } = pageParam || {};
      const { keyword, type } = searchParams || {};

      if (!keyword || keyword.trim() === "") {
        // 검색어가 없으면 전체 목록 조회
        return getList(pageParam);
      }

      setFetching(true);

      try {
        // 새로운 통합 검색 API 호출
        const response = await jwtAxios.get(`/api/admin/chat/search`, {
          params: {
            page,
            size,
            type: type || "all",
            keyword: keyword.trim(),
          },
        });

        const data = response.data;

        // 페이징 데이터 처리
        const totalPages = data.totalPages;
        const currentPage = data.number;
        const pageGroupSize = ADMIN_CONFIG.PAGE_GROUP_SIZE;

        const groupStart =
          Math.floor(currentPage / pageGroupSize) * pageGroupSize;
        const groupEnd = Math.min(groupStart + pageGroupSize, totalPages);

        const pageNumList = [];
        for (let i = groupStart; i < groupEnd; i++) {
          pageNumList.push(i + 1);
        }

        setServerData({
          dtoList: data.content || [],
          pageNumList,
          pageRequestDTO: { page: currentPage, size: data.size },
          prev: groupStart > 0,
          next: groupEnd < totalPages,
          totalCount: data.totalElements,
          prevPage: groupStart > 0 ? groupStart : 0,
          nextPage: groupEnd < totalPages ? groupEnd + 1 : totalPages,
          totalPage: totalPages,
          current: currentPage + 1,
          size: data.size,
        });
      } catch (error) {
        console.error("검색 실패:", error);
        setServerData((prev) => ({
          ...prev,
          dtoList: [],
          totalCount: 0,
        }));
      } finally {
        setFetching(false);
      }
    },
    [getList]
  );

  // 나머지 함수들은 그대로 유지...
  const updateChatRoomStatus = async (chatRoomId, status) => {
    try {
      let response;

      if (status === "ACTIVE") {
        response = await jwtAxios.post(
          `/api/support/chat-room/${chatRoomId}/start`,
          {},
          { headers: { "Content-Type": "application/json" } }
        );
      } else if (status === "ENDED") {
        response = await jwtAxios.post(
          `/api/support/chat-room/${chatRoomId}/end`,
          {},
          { headers: { "Content-Type": "application/json" } }
        );
      } else {
        response = await jwtAxios.put(
          `/api/admin/chat/${chatRoomId}/status`,
          status,
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return response.data;
    } catch (error) {
      console.error("채팅방 상태 변경 실패:", error);
      throw error;
    }
  };

  const deleteChatRoom = async (chatRoomId) => {
    try {
      await jwtAxios.delete(`/api/admin/chat/${chatRoomId}`);
    } catch (error) {
      console.error("채팅방 삭제 실패:", error);
      throw error;
    }
  };
  const rejectChatRoom = async (chatRoomId, rejectionReason) => {
    try {
      const response = await jwtAxios.put(
        `/api/admin/chat/${chatRoomId}/reject`,
        rejectionReason,
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      console.error("채팅방 거절 실패:", error);
      throw error;
    }
  };

  const refreshData = useCallback(
    (filter = "all", search = { keyword: "", type: "all" }) => {
      const currentPageParam = {
        page: 0,
        size: serverData.size || ADMIN_CONFIG.DEFAULT_SIZE,
      };

      if (search.keyword && search.type !== "all") {
        searchChatRooms(currentPageParam, search);
      } else if (filter !== "all") {
        getListByStatus(currentPageParam, filter);
      } else {
        getList(currentPageParam);
      }
    },
    [serverData.size, getList, getListByStatus, searchChatRooms]
  );

  return {
    serverData,
    fetching,
    getList,
    getListByStatus,
    searchChatRooms,
    updateChatRoomStatus,
    deleteChatRoom,
    rejectChatRoom,
    refreshData,
  };
};

export default useCustomChatAdmin;
