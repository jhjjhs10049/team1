import { useState } from "react";
import { endChat } from "../api/chatRoomApi";

/**
 * 채팅방 나가기 기능을 위한 커스텀 훅
 */
const useChatExit = (chatRoom, isAdmin, navigate) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleLeave = () => {
    if (isAdmin) {
      // 관리자는 채팅 관리자 페이지로 이동
      navigate("/admin/chat");
    } else {
      // 종료된 상태(ENDED, REJECTED)에서는 모달 없이 바로 이동
      if (chatRoom.status === "REJECTED" || chatRoom.status === "ENDED") {
        if (chatRoom.status === "REJECTED") {
          alert("상담이 거절된 채팅방에서 나갑니다.");
        } else {
          alert("상담이 완료된 채팅방에서 나갑니다.");
        }
        navigate("/support/faq");
      } else {
        // 활성 상태에서는 확인 모달 표시
        setShowExitConfirm(true);
      }
    }
  };

  const handleExitConfirm = async () => {
    try {
      console.log("📤 채팅방 종료 요청...");

      // 거절되거나 이미 종료된 채팅방인 경우 바로 나가기
      if (chatRoom.status === "REJECTED") {
        console.log("✅ 거절된 채팅방에서 나가기");
        alert("상담이 거절된 채팅방에서 나갑니다.");
        setShowExitConfirm(false);
        navigate("/support/faq");
        return;
      }

      if (chatRoom.status === "ENDED") {
        console.log("✅ 종료된 채팅방에서 나가기");
        alert("상담이 완료된 채팅방에서 나갑니다.");
        setShowExitConfirm(false);
        navigate("/support/faq");
        return;
      }

      // 활성 상태인 경우 채팅방 종료 API 호출
      await endChat(chatRoom.chatRoomId || chatRoom.no);

      console.log("✅ 채팅방 종료 완료");
      alert("채팅이 종료되었습니다.");

      setShowExitConfirm(false);
      navigate("/support/faq");
    } catch (error) {
      console.error("❌ 채팅방 종료 오류:", error);
      alert("채팅방 종료 중 오류가 발생했습니다.");
    }
  };

  const handleExitCancel = () => {
    setShowExitConfirm(false);
  };

  return {
    showExitConfirm,
    handleLeave,
    handleExitConfirm,
    handleExitCancel,
  };
};

export default useChatExit;
