import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCustomChatAdmin from "./useCustomChatAdmin";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const useStatusActions = () => {
  const { updateChatRoomStatus, rejectChatRoom } = useCustomChatAdmin();
  const { loginState } = useCustomLogin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 채팅방 입장
  const handleEnterChat = async (chatRoom, onUpdate, onClose) => {
    setLoading(true);
    try {
      console.log("🔍 현재 로그인된 사용자 정보:", loginState);
      if (loginState?.email) {
        console.log("🔍 사용자 권한:", loginState.roleNames);
        await updateChatRoomStatus(chatRoom.no, "ACTIVE");
        alert("채팅방에 입장합니다.");
        onUpdate();
        onClose();
        // 채팅방 페이지로 이동
        navigate(`/support/chat/${chatRoom.no}`);
      } else {
        alert("로그인 정보가 없습니다.");
      }
    } catch (error) {
      console.error("❌ 채팅방 입장 실패:", error);
      handleApiError(error, "채팅방 입장");
    } finally {
      setLoading(false);
    }
  };

  // 채팅 종료
  const handleEndChat = async (chatRoom, onUpdate, onClose) => {
    if (window.confirm("채팅을 종료하시겠습니까?")) {
      setLoading(true);
      try {
        console.log("🔥 채팅 종료 시도:", chatRoom.no);
        await updateChatRoomStatus(chatRoom.no, "ENDED");
        alert("채팅을 종료했습니다.");
        onUpdate();
        onClose();
      } catch (error) {
        console.error("❌ 채팅 종료 실패:", error);
        handleApiError(error, "채팅 종료");
      } finally {
        setLoading(false);
      }
    }
  };

  // 채팅 거절
  const handleRejectChat = async (chatRoom, rejectionReason, onUpdate, onClose, onResetForm) => {
    if (!rejectionReason.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    console.log("🔥 거절 요청 시작 - 채팅방:", chatRoom.no, "사유:", rejectionReason);

    if (window.confirm("정말로 이 채팅방을 거절하시겠습니까?")) {
      setLoading(true);
      try {
        console.log("📤 거절 API 호출 중...");
        await rejectChatRoom(chatRoom.no, rejectionReason);
        alert("채팅방을 거절했습니다.");
        onUpdate();
        onClose();
        onResetForm();
      } catch (error) {
        console.error("❌ 채팅방 거절 실패:", error);
        handleApiError(error, "채팅방 거절");
      } finally {
        setLoading(false);
      }
    }
  };

  // API 에러 처리
  const handleApiError = (error, operation) => {
    if (error.response?.status === 401) {
      alert("인증이 필요합니다. 다시 로그인해주세요.");
    } else if (error.response?.status === 403) {
      alert("권한이 없습니다. 관리자 권한이 필요합니다.");
    } else if (error.response?.status === 400 || error.response?.status === 500) {
      // 관리자 접근 제한 에러 처리
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage && errorMessage.includes("다른 관리자")) {
        alert(errorMessage);
      } else {
        alert(`${operation}에 실패했습니다: ${errorMessage}`);
      }
    } else {
      alert(`${operation}에 실패했습니다.`);
    }
  };

  return {
    loading,
    handleEnterChat,
    handleEndChat,
    handleRejectChat,
    loginState
  };
};

export default useStatusActions;
