import { useNavigate, useLocation } from "react-router-dom";

const AdminToggleButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 페이지가 채팅관리인지 회원관리인지 확인
  const isCurrentChatAdmin = location.pathname.includes("/admin/chat");
  const isCurrentMemberAdmin = location.pathname.includes("/admin/member");

  // 토글 버튼 핸들러
  const handleToggleAdmin = (type) => {
    if (type === "chat" && !isCurrentChatAdmin) {
      navigate("/admin/chat");
    } else if (type === "member" && !isCurrentMemberAdmin) {
      navigate("/admin");
    }
  };

  return (
    <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
      <button
        onClick={() => handleToggleAdmin("chat")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          isCurrentChatAdmin
            ? "bg-teal-500 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        }`}
      >
        💬 채팅관리
      </button>
      <button
        onClick={() => handleToggleAdmin("member")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          isCurrentMemberAdmin
            ? "bg-purple-500 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        }`}
      >
        👥 회원관리
      </button>
    </div>
  );
};

export default AdminToggleButtons;
