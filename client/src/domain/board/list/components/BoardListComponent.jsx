import { Link } from "react-router-dom";
import { imageUrl } from "../../api/boardApi";

const BoardListComponent = ({
  boards,
  notices = [],
  loading,
  currentPage = 0,
  searchParams = {},
}) => {
  // 안전한 날짜 포맷팅 함수
  const formatDate = (dateValue) => {
    if (!dateValue) return "날짜 없음";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "날짜 오류";
      return date.toLocaleDateString("ko-KR");
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 오류";
    }
  };
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!boards || boards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">게시물이 없습니다.</div>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {/* 공지사항 섹션 */}
      {notices && notices.length > 0 && (
        <div className="mb-1">
          <div className="space-y-1">
            {notices.map((notice) => {
              const linkTo = `/board/read/${notice.bno}`;
              const isAd = notice.postType === "AD";
              const bgColor = isAd ? "bg-purple-50" : "bg-orange-50";
              const borderColor = isAd
                ? "border-purple-200"
                : "border-orange-200";
              const hoverBgColor = isAd
                ? "hover:bg-purple-100"
                : "hover:bg-orange-100";
              const badgeColor = isAd ? "bg-purple-500" : "bg-orange-500";
              const badgeText = isAd ? "광고" : "공지";
              const hoverTextColor = isAd
                ? "group-hover:text-purple-600"
                : "group-hover:text-orange-600";
              const replyColor = isAd ? "text-purple-600" : "text-orange-600";

              return (
                <Link
                  key={`notice-${notice.bno}`}
                  to={linkTo}
                  className="group block"
                >
                  <div
                    className={`relative ${bgColor} border ${borderColor} p-4 rounded-lg ${hoverBgColor} transition-all duration-300 overflow-hidden`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`${badgeColor} text-white text-xs px-2 py-1 rounded font-bold`}
                        >
                          {badgeText}
                        </span>
                        <h3
                          className={`text-lg font-semibold text-gray-800 ${hoverTextColor} transition-colors`}
                        >
                          {notice.title}
                        </h3>
                      </div>{" "}
                      <span className="text-sm text-gray-500">
                        {formatDate(notice.regDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          작성자:
                          {notice.writerName || notice.writerEmail || "익명"}
                        </span>
                        <span className="text-sm text-gray-500">
                          조회: {notice.viewCount || 0}
                        </span>
                      </div>
                      {notice.replyCount > 0 && (
                        <span className={`text-sm ${replyColor} font-medium`}>
                          💬 댓글 {notice.replyCount}
                        </span>
                      )}
                    </div>
                    {/* 이미지 표시기 및 호버 시 섬네일 */}
                    {notice.images && notice.images.length > 0 && (
                      <>
                        {/* 이미지 표시기 */}
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">
                            📷 이미지 {notice.images.length}개
                          </span>
                        </div>
                        {/* 호버 시에만 나타나는 작은 섬네일들 */}
                        <div className="max-h-0 group-hover:max-h-20 transition-all duration-300 ease-in-out overflow-hidden">
                          <div className="mt-2 flex gap-2">
                            {notice.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={imageUrl(img.fileName)}
                                alt={`이미지 ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                            ))}
                            {notice.images.length > 3 && (
                              <div className="w-16 h-16 bg-gray-200 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                                +{notice.images.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 일반 게시글 섹션 */}
      {boards.map((board) => {
        // 쿼리 파라미터 생성
        const queryParams = new URLSearchParams();
        if (currentPage > 0) queryParams.set("page", currentPage);
        if (searchParams.keyword)
          queryParams.set("keyword", searchParams.keyword);
        if (searchParams.type && searchParams.type !== "all")
          queryParams.set("type", searchParams.type);

        const queryString = queryParams.toString();
        const linkTo = `/board/read/${board.bno}${
          queryString ? `?${queryString}` : ""
        }`; // 공지사항과 광고는 이미 위에서 표시했으므로 제외
        if (board.postType === "ANN" || board.postType === "AD") {
          return null;
        }

        return (
          <Link key={board.bno} to={linkTo} className="group block">
            <div className="relative bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:bg-gray-50 transition-all duration-300 overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                  {board.title}
                </h3>{" "}
                <span className="text-sm text-gray-500">
                  {formatDate(board.regDate)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    작성자:
                    {board.writerEmail || `#${board.writerId}` || "익명"}
                  </span>
                  <span className="text-sm text-gray-500">
                    조회: {board.viewCount || 0}
                  </span>
                </div>
                {board.replyCount > 0 && (
                  <span className="text-sm text-teal-600 font-medium">
                    💬 댓글 {board.replyCount}
                  </span>
                )}
              </div>
              {/* 이미지 표시기 및 호버 시 섬네일 */}
              {board.images && board.images.length > 0 && (
                <>
                  {/* 이미지 표시기 */}
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">
                      📷 이미지 {board.images.length}개
                    </span>
                  </div>
                  {/* 호버 시에만 나타나는 작은 섬네일들 */}
                  <div className="max-h-0 group-hover:max-h-20 transition-all duration-300 ease-in-out overflow-hidden">
                    <div className="mt-2 flex gap-2">
                      {board.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={imageUrl(img.fileName)}
                          alt={`이미지 ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                      ))}
                      {board.images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-200 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                          +{board.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BoardListComponent;
