import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import BasicLayout from "../../../../layouts/BasicLayout";
import {
  getBoardDetail,
  deleteBoard,
  imageUrl,
  getReplies,
  addReply,
  updateReply,
  deleteReply,
  increaseViewCount,
} from "../../api/boardApi";
import BoardReplyPaginationComponent from "../components/BoardReplyPaginationComponent";
import { REPLY_CONFIG } from "../../../../common/config/pageConfig";
import {
  AuthorOrAdminButton,
  AuthorOnlyLink,
} from "../../../../common/config/ProtectedBoard";

export default function BoardDetail() {
  const { bno } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const loginState = useSelector((state) => state.loginSlice);

  // 페이징 유지를 위한 쿼리 파라미터 추출
  const getReturnUrl = () => {
    return `/board${location.search}`;
  };

  const myEmail = loginState?.email || null;
  const myMemberNo = loginState?.memberNo || null;
  const isAdmin = Array.isArray(loginState?.roleNames)
    ? loginState.roleNames.includes("ADMIN") ||
      loginState.roleNames.includes("MANAGER")
    : loginState?.role === "ADMIN" || loginState?.role === "MANAGER";
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // 댓글 페이징 상태
  const [replyData, setReplyData] = useState(null);
  const [currentReplyPage, setCurrentReplyPage] = useState(
    REPLY_CONFIG.DEFAULT_PAGE
  );
  const [replyLoading, setReplyLoading] = useState(false);
  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      // 조회수 증가 (비동기로 실행하되 실패해도 게시글 조회는 계속)
      increaseViewCount(bno);

      const data = await getBoardDetail(bno);
      setDetail(data);
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      alert("게시글을 불러올 수 없습니다.");
      navigate("/board");
    } finally {
      setLoading(false);
    }
  }, [bno, navigate]);

  // 댓글 로딩 함수
  const loadReplies = useCallback(
    async (page = currentReplyPage) => {
      try {
        setReplyLoading(true);
        const data = await getReplies(bno, page, REPLY_CONFIG.DEFAULT_SIZE);
        setReplyData(data);
      } catch (error) {
        console.error("댓글 로딩 실패:", error);
      } finally {
        setReplyLoading(false);
      }
    },
    [bno, currentReplyPage]
  );
  useEffect(() => {
    loadDetail();
    loadReplies();
  }, [loadDetail, loadReplies]);
  const handleDeleteBoard = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteBoard(bno);
      alert("삭제되었습니다.");
      navigate(getReturnUrl());
    } catch (error) {
      console.error("삭제 실패:", error);

      // JWT 토큰 관련 에러인 경우
      if (
        error.response?.status === 401 ||
        error.message?.includes("Authorization")
      ) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/member/login");
        return;
      }

      // 권한 부족인 경우
      if (error.response?.status === 403) {
        alert("삭제 권한이 없습니다.");
        return;
      }

      alert("삭제에 실패했습니다.");
    }
  };
  // 댓글 관련 핸들러
  const handleAddReply = async (replyText) => {
    try {
      await addReply(bno, replyText);
      await loadReplies(0); // 첫 페이지로 이동
      setCurrentReplyPage(0);
    } catch (error) {
      console.error("댓글 작성 실패:", error);

      // JWT 토큰 관련 에러인 경우
      if (
        error.response?.status === 401 ||
        error.message?.includes("Authorization") ||
        error.response?.data?.error === "REQUIRE_LOGIN"
      ) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/member/login");
        return;
      }

      // 권한 부족인 경우
      if (error.response?.status === 403) {
        alert("댓글 작성 권한이 없습니다.");
        return;
      }

      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleUpdateReply = async (replyId, replyText) => {
    try {
      await updateReply(bno, replyId, replyText);
      await loadReplies(); // 현재 페이지 유지
    } catch (error) {
      console.error("댓글 수정 실패:", error);

      // JWT 토큰 관련 에러인 경우
      if (
        error.response?.status === 401 ||
        error.message?.includes("Authorization") ||
        error.response?.data?.error === "REQUIRE_LOGIN"
      ) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/member/login");
        return;
      }

      // 권한 부족인 경우
      if (error.response?.status === 403) {
        alert("댓글 수정 권한이 없습니다.");
        return;
      }

      alert("댓글 수정에 실패했습니다.");
    }
  };
  const handleDeleteReply = async (replyId) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteReply(bno, replyId);
      await loadReplies(); // 현재 페이지 유지
    } catch (error) {
      console.error("댓글 삭제 실패:", error);

      // JWT 토큰 관련 에러인 경우
      if (
        error.response?.status === 401 ||
        error.message?.includes("Authorization") ||
        error.response?.data?.error === "REQUIRE_LOGIN"
      ) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/member/login");
        return;
      }

      // 권한 부족인 경우
      if (error.response?.status === 403) {
        alert("댓글 삭제 권한이 없습니다.");
        return;
      }

      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const handleReplyPageChange = async (page) => {
    setCurrentReplyPage(page);
    await loadReplies(page);
  };

  if (loading) {
    return (
      <BasicLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </BasicLayout>
    );
  }

  if (!detail) {
    return (
      <BasicLayout>
        <div className="text-center py-8">
          <div className="text-gray-500">게시글을 찾을 수 없습니다.</div>
        </div>
      </BasicLayout>
    );
  }
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* 게시글 헤더 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{detail.title}</h1>
            <div className="flex gap-2">
              <AuthorOnlyLink
                authorEmail={detail.writerEmail}
                to={`/board/modify/${detail.bno}`}
                className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                noAuthMessage="게시글 수정은 로그인이 필요합니다."
                noPermissionMessage="작성자만 수정할 수 있습니다."
              >
                수정
              </AuthorOnlyLink>
              <AuthorOrAdminButton
                authorEmail={detail.writerEmail}
                onClick={handleDeleteBoard}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                noAuthMessage="게시글 삭제는 로그인이 필요합니다."
                noPermissionMessage="작성자 또는 관리자만 삭제할 수 있습니다."
              >
                삭제
              </AuthorOrAdminButton>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span>
              작성자: {detail.writerEmail || `#${detail.writerId}` || "익명"}
            </span>
            <span>작성일: {new Date(detail.regDate).toLocaleString()}</span>
            <span>조회: {detail.viewCount || 0}</span>
            {detail.modDate !== detail.regDate && (
              <span>수정일: {new Date(detail.modDate).toLocaleString()}</span>
            )}
          </div>
          {/* 이미지 */}
          {detail.images && detail.images.length > 0 && (
            <div className="space-y-4 mb-6">
              {detail.images.map((img, idx) => (
                <div key={idx} className="w-full">
                  <img
                    src={imageUrl(img.fileName)}
                    alt={`이미지 ${idx + 1}`}
                    className="w-full max-h-[600px] object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() =>
                      window.open(imageUrl(img.fileName), "_blank")
                    }
                    title="클릭하면 원본 크기로 보기"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
              {detail.content}
            </p>
          </div>
          {/* 목록으로 버튼 */}
          <div className="flex justify-center mt-6 mb-6">
            <Link
              to={getReturnUrl()}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              목록으로
            </Link>
          </div>
        </div>
        {/* 댓글 */}
        <BoardReplyPaginationComponent
          replyData={replyData}
          currentPage={currentReplyPage}
          myEmail={myEmail}
          myMemberNo={myMemberNo}
          isAdmin={isAdmin}
          onAddReply={handleAddReply}
          onUpdateReply={handleUpdateReply}
          onDeleteReply={handleDeleteReply}
          onPageChange={handleReplyPageChange}
          loading={replyLoading}
        />
      </div>
    </BasicLayout>
  );
}
