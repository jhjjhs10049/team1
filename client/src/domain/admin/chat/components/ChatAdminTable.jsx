import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const ChatAdminTable = ({
  serverData,
  fetching,
  onStatusClick,
  getStatusColor,
  getStatusText,
}) => {
  const { loginState } = useCustomLogin();

  // 안전한 날짜 포맷팅 함수
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "날짜 오류";

      return date.toLocaleDateString();
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 오류";
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              채팅방번호
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              관리자
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
              생성일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              종료일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {serverData.dtoList?.map((chatRoom) => (
            <tr key={chatRoom.no}>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {chatRoom.no}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {chatRoom.admin?.email ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{chatRoom.admin.email}</span>
                    {chatRoom.admin.email === loginState?.email && (
                      <span className="text-xs text-teal-600">(나)</span>
                    )}
                    {chatRoom.admin.email !== loginState?.email && (
                      <span className="text-xs text-orange-600">
                        (다른 관리자)
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {chatRoom.member?.email || "정보없음"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {chatRoom.member?.nickname || chatRoom.member?.email || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {chatRoom.member?.phoneNumber || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(chatRoom.createdAt)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(chatRoom.endedAt)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                {/* 다른 관리자가 담당하고 있는 경우 접근 제한 표시 */}
                {chatRoom.admin &&
                chatRoom.admin.email !== loginState?.email ? (
                  <div className="flex flex-col items-start">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        chatRoom.status
                      )}`}
                    >
                      {getStatusText(chatRoom.status)}
                    </span>
                    <span className="text-xs text-orange-600 mt-1">
                      🔒 접근 제한
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => onStatusClick(chatRoom)}
                    className={`px-2 py-1 rounded text-xs font-medium cursor-pointer hover:opacity-80 ${getStatusColor(
                      chatRoom.status
                    )}`}
                  >
                    {getStatusText(chatRoom.status)}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {serverData.dtoList?.length === 0 && !fetching && (
        <div className="text-center py-8 text-gray-500">채팅방이 없습니다.</div>
      )}
    </div>
  );
};

export default ChatAdminTable;
