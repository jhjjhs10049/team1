import { useState, useEffect, useCallback } from "react";
import {
  getChatRoomById,
  getActiveChatRoom,
  startChat,
} from "../api/chatRoomApi";
import {
  markMessagesAsRead as _markMessagesAsRead,
} from "../api/chatMessageApi";

/**
 * 채팅방 정보 및 상태 관리를 위한 커스텀 훅
 */
const useChatRoomInfo = (chatRoomId, isAdmin, navigate) => {
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadChatRoomById = useCallback(
    async (roomId) => {
      try {
        console.log("📥 채팅방 조회 중...", roomId);
        const roomData = await getChatRoomById(roomId);

        if (roomData) {
          setChatRoom(roomData);
          console.log("✅ 채팅방 로드 완료:", roomData);
        } else {
          console.log("❌ 채팅방을 찾을 수 없음");
          alert("채팅방을 찾을 수 없습니다.");
          navigate("/support/faq");
        }
      } catch (error) {
        console.error("❌ 채팅방 로드 오류:", error);
        alert("채팅방을 불러오는 중 오류가 발생했습니다.");
        navigate("/support/faq");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const loadActiveChatRoom = useCallback(async () => {
    try {
      console.log("📥 활성화된 채팅방 조회 중...");
      const roomData = await getActiveChatRoom();

      if (roomData) {
        setChatRoom(roomData);
        console.log("✅ 활성화된 채팅방 로드 완료:", roomData);
      } else {
        console.log("❌ 활성화된 채팅방이 없음");
        alert("활성화된 채팅방이 없습니다. 사전 질문을 먼저 작성해주세요.");
        navigate("/support/chat");
      }
    } catch (error) {
      console.error("❌ 채팅방 로드 오류:", error);
      alert("채팅방을 불러오는 중 오류가 발생했습니다.");
      navigate("/support/faq");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // 초기 로드
  useEffect(() => {
    if (chatRoomId) {
      loadChatRoomById(chatRoomId);
    } else {
      loadActiveChatRoom();
    }
  }, [chatRoomId, loadChatRoomById, loadActiveChatRoom]);

  // 관리자 자동 채팅 시작
  useEffect(() => {
    const handleAdminJoin = async () => {
      if (isAdmin && chatRoom && chatRoom.status === "WAITING") {
        try {
          console.log("🚀 관리자가 채팅방 입장 - 채팅 시작:", chatRoom.no);
          await startChat(chatRoom.no);
          const updatedRoom = await getChatRoomById(chatRoom.no);
          setChatRoom(updatedRoom);
          console.log("✅ 채팅 시작 완료");
        } catch (error) {
          console.error("❌ 채팅 시작 오류:", error);
        }
      }
    };

    if (chatRoom) {
      handleAdminJoin();
    }
  }, [chatRoom, isAdmin]);

  return {
    chatRoom,
    setChatRoom,
    loading,
  };
};

export default useChatRoomInfo;
