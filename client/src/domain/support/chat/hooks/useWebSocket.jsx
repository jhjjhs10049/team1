import { useState, useEffect, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = (username) => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  /*
  useEffect(() => {
      if (!connected) {
          setOnlineUsers(new Set());
      }
  }, [connected]);
*/

  useEffect(() => {
    const connect = () => {
      // 웹소켓 URL 동적 생성 (로컬/서버 환경에 따라 프로토콜 자동 결정)
      const wsHost =
        window.location.hostname === "localhost"
          ? "localhost:8080"
          : window.location.host;
      const wsProtocol =
        window.location.protocol === "https:" ? "https:" : "http:";
      const sockJsUrl = `${wsProtocol}//${wsHost}/ws`;

      const socket = new SockJS(sockJsUrl);
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log("STOMP: " + str);
        },
        onConnect: (frame) => {
          console.log("Connected: " + frame);
          setConnected(true);

          // 1. 온라인 유저 목록을 받는 전용 채널 구독
          // 서버가 보내주는 전체 유저 목록으로 상태를 업데이트합니다.
          client.subscribe("/topic/onlineUsers", (message) => {
            const list = JSON.parse(message.body);
            setOnlineUsers(new Set(list));
          });

          // 공개 채널 구독 : 메시지 및 사용자 목록 업데이트 처리
          client.subscribe("/topic/public", (message) => {
            const receivedMessage = JSON.parse(message.body);
            handleMessageReceived(receivedMessage);
          });

          // 사용자 입장 알림 (서버에 JOIN 메시지 전송)
          client.publish({
            destination: "/app/chat.addUser",
            body: JSON.stringify({
              sender: username,
              type: "JOIN",
            }),
          });
        },
        onStompError: (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
          setConnected(false);
        },
        onWebSocketClose: () => {
          console.log("WebSocket connection closed");
          setConnected(false);
        },
      });

      client.activate();
      setStompClient(client);
    };

    if (username) {
      connect();
    }

    return () => {
      setStompClient((currentClient) => {
        if (currentClient) {
          currentClient.deactivate();
          setConnected(false);
          setOnlineUsers(new Set());
        }
        return null;
      });
    };
  }, [username, handleMessageReceived]);

  const disconnect = useCallback(() => {
    if (stompClient) {
      // 이제 서버의 이벤트 리스너가 연결이 끊길 때 자동으로 퇴장 메시지를 보냅니다.
      // 퇴장 메시지 전송
      /*
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          sender: username,
          type: 'LEAVE',
          content: `${username}님이 퇴장하셨습니다.`
        })
      });
      */

      stompClient.deactivate();
      setStompClient(null);
      setConnected(false);

      // 유저가 방을 나갈 때 onlineUsers 상태를 즉시 초기화합니다.
      setOnlineUsers(new Set());
    }
  }, [stompClient]);

  // 메시지 수신 로직 (이제 온라인 유저 목록 업데이트는 여기서 하지 않습니다.)
  const handleMessageReceived = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(
    (messageContent) => {
      if (stompClient && connected && messageContent.trim()) {
        const chatMessage = {
          sender: username,
          content: messageContent,
          type: "CHAT",
        };

        stompClient.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify(chatMessage),
        });
      }
    },
    [stompClient, connected, username]
  );

  return {
    messages,
    connected,
    onlineUsers: Array.from(onlineUsers),
    sendMessage,
    disconnect,
  };
};

export default useWebSocket;

/*
퇴장 시 유저 목록이 정상적으로 업데이트되는 이유
이는 프론트엔드와 백엔드 코드가 서로 다른 두 개의 메시지 채널을 사용해 유저의 상태를 완벽하게 동기화하도록 설계되었기 때문입니다.

클라이언트의 퇴장 메시지 전송 (disconnect 함수):
useWebSocket.js 파일의 disconnect 함수를 보면, 사용자가 연결을 끊을 때 type: 'LEAVE' 메시지를 /app/chat.sendMessage로 전송합니다. 이 메시지에는 누가 나갔는지에 대한 정보(sender: username)가 포함되어 있죠.

JavaScript

  stompClient.publish({
    destination: '/app/chat.sendMessage',
    body: JSON.stringify({
      sender: username,
      type: 'LEAVE',
      content: `${username}님이 퇴장하셨습니다.`
    })
  });
서버의 메시지 처리 및 목록 업데이트:
백엔드 코드(예: ChatController.java)는 클라이언트가 보낸 LEAVE 메시지를 받습니다. handleUserDisconnect와 같은 이벤트 리스너를 통해 이 메시지를 감지하고, onlineUsers 목록에서 해당 유저를 제거합니다.

Java
// 서버 코드 (예시)
onlineUsers.remove(username);
서버의 전체 목록 재전송:
유저 목록을 업데이트한 후, 서버는 /topic/onlineUsers 채널로 현재 남아있는 전체 유저 목록을 다시 브로드캐스트합니다. 이것이 바로 핵심입니다.

Java
// 서버 코드 (예시)
messagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);
클라이언트의 전체 목록 수신 및 업데이트:
프론트엔드(useWebSocket.js)는 /topic/onlineUsers 채널을 구독하고 있습니다. 서버가 보낸 메시지를 받으면, setOnlineUsers(new Set(list)) 코드를 통해 현재 onlineUsers 상태를 서버가 보내준 전체 목록으로 덮어쓰기 때문에, 퇴장한 유저가 자동으로 목록에서 사라지게 됩니다.

결론적으로, 사용자가 퇴장할 때마다 서버가 전체 유저 목록을 새로 만들어서 보내주고, 클라이언트는 그 목록을 그대로 받아서 화면에 업데이트하기 때문에 유저 수가 정확하게 표시되는 것입니다.

*/
