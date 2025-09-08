import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BasicLayout from "../../../../layouts/BasicLayout";
import { listBoards, getNotices, getAds } from "../../api/boardApi";
import BoardSearchComponent from "../components/BoardSearchComponent";
import BoardListComponent from "../components/BoardListComponent";
import BoardPaginationComponent from "../components/BoardPaginationComponent";
import {
  LoginRequiredButton,
  ManagerAdminButton,
} from "../../../../common/config/ProtectedBoard";
import { BOARD_CONFIG, PAGE_UTILS } from "../../../../common/config/pageConfig";

export default function BoardListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useState({
    keyword: "",
    type: "all",
  }); // 검색 파라미터를 객체로 관리
  const [page, setPage] = useState(BOARD_CONFIG.DEFAULT_PAGE);
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    number: 0,
  });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  // URL 쿼리 파라미터에서 페이지 및 검색 파라미터 초기화
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlPage =
      parseInt(urlParams.get("page")) || BOARD_CONFIG.DEFAULT_PAGE;
    const urlKeyword = urlParams.get("keyword") || "";
    const urlType = urlParams.get("type") || "all";

    setPage(urlPage);
    setSearchParams({
      keyword: urlKeyword,
      type: urlType,
    });
  }, [location.search]);
  // 글쓰기 페이지로 이동
  const handleWriteClick = () => {
    navigate("/board/register");
  };
  // 공지쓰기 페이지로 이동
  const handleNoticeWriteClick = () => {
    navigate("/board/notice/register");
  };
  // 공지사항과 광고 조회
  useEffect(() => {
    const fetchNoticesAndAds = async () => {
      try {
        const [noticeData, adData] = await Promise.all([
          getNotices(),
          getAds(),
        ]);
        // 공지사항과 광고를 합쳐서 하나의 배열로 관리
        const combined = [...noticeData, ...adData];
        setNotices(combined);
      } catch (error) {
        console.error("공지사항/광고 조회 실패:", error);
        setNotices([]);
      }
    };
    fetchNoticesAndAds();
  }, []);
  useEffect(() => {
    let cancelled = false;
    const fetchList = async () => {
      try {
        setLoading(true);
        const validPage = PAGE_UTILS.validatePage(page, 0); // totalPages 의존성 제거
        const validSize = PAGE_UTILS.validateSize(
          BOARD_CONFIG.DEFAULT_SIZE,
          BOARD_CONFIG.MAX_SIZE
        );

        const res = await listBoards(searchParams, validPage, validSize);
        const normalized = {
          content: Array.isArray(res?.content) ? res.content : [],
          totalPages: typeof res?.totalPages === "number" ? res.totalPages : 0,
          number: typeof res?.number === "number" ? res.number : validPage,
        };
        if (!cancelled) setData(normalized);
      } catch (err) {
        console.error("목록 조회 실패:", err);
        if (!cancelled) setData({ content: [], totalPages: 0, number: 0 });
        alert("목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchList();
    return () => {
      cancelled = true;
    };
  }, [searchParams, page]); // searchParams로 변경
  const handleSearch = (searchData) => {
    // 검색어가 있을 때만 첫 페이지로 이동
    if (searchData.keyword && searchData.keyword.trim()) {
      setPage(BOARD_CONFIG.DEFAULT_PAGE);
    }
    setSearchParams(searchData);
  };

  const handlePageChange = (newPage) => {
    const validPage = PAGE_UTILS.validatePage(newPage, data.totalPages);
    setPage(validPage);
  };

  const items = Array.isArray(data?.content) ? data.content : [];
  const totalPages = typeof data?.totalPages === "number" ? data.totalPages : 0;
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">게시판</h1>
          <div className="flex space-x-2">
            <ManagerAdminButton
              onClick={handleNoticeWriteClick}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              noAuthMessage="공지사항 작성은 관리자/매니저만 가능합니다."
            >
              📢 공지/광고쓰기
            </ManagerAdminButton>
            <LoginRequiredButton
              onClick={handleWriteClick}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
              noAuthMessage="게시글 작성은 로그인이 필요합니다."
            >
              글쓰기
            </LoginRequiredButton>
          </div>
        </div>
        <BoardSearchComponent onSearch={handleSearch} loading={loading} />
        <BoardListComponent
          boards={items}
          notices={notices}
          loading={loading}
          currentPage={page}
          searchParams={searchParams}
        />
        <BoardPaginationComponent
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageConfig={BOARD_CONFIG}
        />
      </div>
    </BasicLayout>
  );
}
