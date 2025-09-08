import React, { useState, useEffect, useCallback } from "react";
import { getAllMembers } from "../api/adminMemberApi";
import MemberActionModal from "./MemberActionModal";
import BanHistoryModal from "./BanHistoryModal";
import AdminSearchComponent from "./AdminSearchComponent";
import PageComponent from "../../../../common/components/PageComponent";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const AdminMemberManager = () => {
  const { loginState } = useCustomLogin();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]); // 필터링된 회원 목록
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 검색 상태
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    type: "all",
  });

  // 페이징 설정 (25개씩)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

  // 모달 상태
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    member: null,
    action: null,
  });
  const [banHistoryModal, setBanHistoryModal] = useState({
    isOpen: false,
    memberNo: null,
  });

  // 회원 목록 조회
  const fetchMembers = useCallback(
    async (searchParams = null) => {
      try {
        setLoading(true);
        setError(null);
        const userRole = loginState?.roleNames?.[0];

        // 서버 사이드 검색을 위해 검색 파라미터 전달
        const data = await getAllMembers(userRole, searchParams);

        // API에서 이미 배열을 반환하도록 처리했으므로 간단히 확인
        if (Array.isArray(data)) {
          setMembers(data);
          setFilteredMembers(data); // 서버에서 이미 필터링된 데이터
        } else {
          console.error("예상하지 못한 API 응답:", data);
          setMembers([]);
          setFilteredMembers([]);
          setError("회원 목록 데이터 형식이 올바르지 않습니다.");
        }
      } catch (err) {
        setError(err.message || "회원 목록을 불러오는데 실패했습니다.");
        console.error("회원 목록 조회 오류:", err);
        setMembers([]);
        setFilteredMembers([]);
      } finally {
        setLoading(false);
      }
    },
    [loginState]
  );
  useEffect(() => {
    if (!loginState) {
      setMembers([]);
      setFilteredMembers([]);
      setError("로그인이 필요합니다.");
      return;
    }

    const userRole = loginState?.roleNames?.[0];
    if (!userRole) {
      setMembers([]);
      setFilteredMembers([]);
      setError("사용자 권한을 확인할 수 없습니다.");
      return;
    }

    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
      setMembers([]);
      setFilteredMembers([]);
      setError("관리자 권한이 필요합니다.");
      return;
    }

    fetchMembers();
  }, [loginState, fetchMembers]);

  // 검색 필터링 로직
  const filterMembers = useCallback((memberList, searchParams) => {
    if (!searchParams.keyword || searchParams.type === "all") {
      return memberList;
    }

    const keyword = searchParams.keyword.toLowerCase();

    return memberList.filter((member) => {
      switch (searchParams.type) {
        case "email":
          return member.email?.toLowerCase().includes(keyword);
        case "nickname":
          return member.nickname?.toLowerCase().includes(keyword);
        case "phone":
          return member.phone?.toLowerCase().includes(keyword);
        case "status":
          return member.active?.toLowerCase().includes(keyword);
        case "role":
          return (
            member.role?.toLowerCase().includes(keyword) ||
            member.roleCode?.toLowerCase().includes(keyword)
          );
        default:
          // 전체 검색
          return (
            member.email?.toLowerCase().includes(keyword) ||
            member.nickname?.toLowerCase().includes(keyword) ||
            member.phone?.toLowerCase().includes(keyword) ||
            member.active?.toLowerCase().includes(keyword) ||
            member.role?.toLowerCase().includes(keyword) ||
            member.roleCode?.toLowerCase().includes(keyword)
          );
      }
    });
  }, []);
  // 검색 핸들러 (서버사이드 검색)
  const handleSearch = useCallback(
    async (newSearchParams) => {
      setSearchParams(newSearchParams);
      setCurrentPage(1); // 검색 시 첫 페이지로 이동

      // 서버에서 검색 수행
      await fetchMembers(newSearchParams);
    },
    [fetchMembers]
  );

  // members 변경 시 필터링 적용
  useEffect(() => {
    const filtered = filterMembers(members, searchParams);
    setFilteredMembers(filtered);
  }, [members, searchParams, filterMembers]);

  // 현재 페이지의 회원 데이터
  const getCurrentPageData = () => {
    // filteredMembers를 사용하도록 변경
    if (!Array.isArray(filteredMembers)) {
      console.error("filteredMembers가 배열이 아닙니다:", filteredMembers);
      return [];
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredMembers.slice(startIndex, endIndex);
  };

  // 전체 페이지 수 (필터링된 결과 기준)
  const totalPages = Math.ceil(
    (Array.isArray(filteredMembers) ? filteredMembers.length : 0) / pageSize
  );

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 셀 클릭 핸들러
  const handleCellClick = (member, field) => {
    if (field === "active") {
      // ACTIVE 상태에 따른 모달 열기
      let action;
      switch (member.active) {
        case "ACTIVE":
          action = "ban";
          break;
        case "BANNED":
          action = "unban";
          break;
        case "DELETED":
          action = "restore";
          break;
        default:
          return;
      }
      setActionModal({
        isOpen: true,
        member: member,
        action: action,
      });
    } else if (field === "role" && loginState.roleNames?.[0] === "ADMIN") {
      // 관리자만 권한 변경 가능
      setActionModal({
        isOpen: true,
        member: member,
        action: "changeRole",
      });
    } else if (field === "banHistory") {
      // 정지 내역 확인
      setBanHistoryModal({
        isOpen: true,
        memberNo: member.memberNo,
      });
    }
  };

  // 모달 닫기
  const closeActionModal = () => {
    setActionModal({
      isOpen: false,
      member: null,
      action: null,
    });
  };

  const closeBanHistoryModal = () => {
    setBanHistoryModal({
      isOpen: false,
      memberNo: null,
    });
  };

  // 액션 완료 후 목록 새로고침
  const handleActionComplete = () => {
    fetchMembers();
    closeActionModal();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  const currentPageData = getCurrentPageData();
  return (
    <div>
      {/* 검색 컴포넌트 */}
      <AdminSearchComponent
        onSearch={handleSearch}
        loading={loading}
        userRole={loginState?.roleNames?.[0]}
      />
      {/* 회원 테이블 */}
      <div className="mt-6 overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회원번호
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이메일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                닉네임
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                전화번호
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                권한
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                소셜
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                정지 내역
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageData.map((member) => (
              <tr key={member.memberNo}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.memberNo}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.nickname}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.phone || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.joinedDate
                    ? new Date(member.joinedDate).toLocaleDateString()
                    : "날짜 없음"}
                </td>
                <td
                  className="px-4 py-4 whitespace-nowrap text-sm cursor-pointer"
                  onClick={() => handleCellClick(member, "active")}
                >
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.active === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : member.active === "BANNED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.active === "ACTIVE" && "활성"}
                    {member.active === "BANNED" && "정지"}
                    {member.active === "DELETED" && "삭제"}
                  </span>
                </td>
                <td
                  className={`px-4 py-4 whitespace-nowrap text-sm ${
                    loginState.roleNames?.[0] === "ADMIN"
                      ? "cursor-pointer text-teal-600 hover:text-teal-800"
                      : "text-gray-900"
                  }`}
                  onClick={() =>
                    loginState.roleNames?.[0] === "ADMIN" &&
                    handleCellClick(member, "role")
                  }
                >
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === "USER"
                        ? "bg-teal-100 text-teal-800"
                        : member.role === "MANAGER"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {member.role}
                    {member.roleCode && ` (${member.roleCode})`}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.social ? "O" : "X"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleCellClick(member, "banHistory")}
                    className="text-teal-600 hover:text-teal-800 font-medium"
                  >
                    내역 확인
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 페이징 */}
      {totalPages > 1 && (
        <div className="mt-6">
          <PageComponent
            serverData={{
              dtoList: currentPageData,
              pageNumList: Array.from({ length: totalPages }, (_, i) => i + 1),
              pageRequestDTO: {
                page: currentPage,
                size: pageSize,
              },
              prev: currentPage > 1,
              next: currentPage < totalPages,
              totalCount: filteredMembers.length,
              prevPage: currentPage > 1 ? currentPage - 1 : 1,
              nextPage: currentPage < totalPages ? currentPage + 1 : totalPages,
              totalPage: totalPages,
              current: currentPage,
            }}
            movePage={handlePageChange}
          />
        </div>
      )}
      {/* 액션 모달 */}
      {actionModal.isOpen && (
        <MemberActionModal
          member={actionModal.member}
          action={actionModal.action}
          onClose={closeActionModal}
          onComplete={handleActionComplete}
        />
      )}
      {/* 정지 내역 모달 */}
      {banHistoryModal.isOpen && (
        <BanHistoryModal
          memberNo={banHistoryModal.memberNo}
          onClose={closeBanHistoryModal}
        />
      )}
    </div>
  );
};

export default AdminMemberManager;
