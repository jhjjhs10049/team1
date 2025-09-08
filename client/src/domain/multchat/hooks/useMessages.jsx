import { useState, useEffect, useCallback } from "react";
import { MULTCHAT_CONFIG } from "../../../common/config/pageConfig";

/**
 * 메시지 로드 및 무한스크롤 로직을 관리하는 커스텀 훅
 */
const useMessages = (roomNo) => {
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 초기 메시지 로드
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!roomNo) return;
      try {
        const { getChatMessages } = await import("../api/multChatApi");
        const messagesData = await getChatMessages(
          roomNo,
          0,
          MULTCHAT_CONFIG.INITIAL_LOAD_SIZE
        );

        if (messagesData) {
          let messagesList = [];
          if (messagesData.dtoList && Array.isArray(messagesData.dtoList)) {
            messagesList = messagesData.dtoList;
          } else if (Array.isArray(messagesData)) {
            messagesList = messagesData;
          } else if (
            messagesData.content &&
            Array.isArray(messagesData.content)
          ) {
            messagesList = messagesData.content;
          }

          if (messagesList && messagesList.length > 0) {
            const sortedMessages = messagesList.sort((a, b) => {
              const timeA = new Date(a.createdAt || a.sendTime || a.timestamp);
              const timeB = new Date(b.createdAt || b.sendTime || a.timestamp);
              return timeA - timeB;
            });

            setMessages(sortedMessages);
            setCurrentPage(1);

            if (messagesList.length < MULTCHAT_CONFIG.INITIAL_LOAD_SIZE) {
              setHasMoreMessages(false);
            }
          } else {
            setMessages([]);
            setHasMoreMessages(false);
          }
        }
      } catch (error) {
        console.error("❌ 초기 메시지 로드 실패:", error);
        setMessages([]);
        setHasMoreMessages(false);
      }
    };

    loadInitialMessages();
  }, [roomNo]);

  // 추가 메시지 로드 함수
  const loadMoreMessages = async () => {
    if (loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    try {
      const { getChatMessages } = await import("../api/multChatApi");
      const messagesData = await getChatMessages(
        roomNo,
        currentPage,
        MULTCHAT_CONFIG.INFINITE_SCROLL_SIZE
      );

      if (messagesData) {
        let newMessagesList = [];

        if (messagesData.dtoList && Array.isArray(messagesData.dtoList)) {
          newMessagesList = messagesData.dtoList;
        } else if (Array.isArray(messagesData)) {
          newMessagesList = messagesData;
        } else if (
          messagesData.content &&
          Array.isArray(messagesData.content)
        ) {
          newMessagesList = messagesData.content;
        }

        if (newMessagesList && newMessagesList.length > 0) {
          const sortedNewMessages = newMessagesList.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.sendTime || a.timestamp);
            const timeB = new Date(b.createdAt || b.sendTime || b.timestamp);
            return timeA - timeB;
          });

          setMessages((prevMessages) => [
            ...sortedNewMessages,
            ...prevMessages,
          ]);
          setCurrentPage((prev) => prev + 1);

          if (newMessagesList.length < MULTCHAT_CONFIG.INFINITE_SCROLL_SIZE) {
            setHasMoreMessages(false);
          }
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      console.error("❌ 추가 메시지 로드 실패:", error);
      setHasMoreMessages(false);
    } finally {
      setLoadingMore(false);
    }
  }; // 새 메시지 추가
  const addMessage = useCallback((newMessage) => {
    setMessages((prev) => {
      // 중복 메시지 방지
      const exists = prev.some((msg) => {
        if (msg.no && newMessage.no) return msg.no === newMessage.no;
        if (msg.id && newMessage.id) return msg.id === newMessage.id;

        const timeDiff = Math.abs(
          new Date(msg.createdAt || msg.sendTime || msg.timestamp).getTime() -
            new Date(
              newMessage.createdAt ||
                newMessage.sendTime ||
                newMessage.timestamp
            ).getTime()
        );

        return (
          msg.content === newMessage.content &&
          msg.senderNickname === newMessage.senderNickname &&
          timeDiff < 2000
        );
      });

      if (exists) {
        return prev;
      }

      const newMessages = [...prev, newMessage];
      return newMessages.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.sendTime || a.timestamp);
        const timeB = new Date(b.createdAt || b.sendTime || b.timestamp);
        return timeA - timeB;
      });
    });
  }, []);

  return {
    messages,
    hasMoreMessages,
    loadingMore,
    loadMoreMessages,
    addMessage,
    setMessages,
  };
};

export default useMessages;
