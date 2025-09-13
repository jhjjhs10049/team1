import { getCookie } from "../../member/util/cookieUtil";
import { isTokenExpired } from "../../member/util/cookieUtil";
import { Client } from "@stomp/stompjs";

/**
 * 단체채팅용 WebSocket 서비스
 * 기존 1:1 채팅과 달리 Topic 방식을 사용하여 브로드캐스트 구현
 */
class MultChatWebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.subscriptions = new Map(); // destination -> subscription
    this.messageCallbacks = new Map(); // destination -> callback
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.connectionPromise = null;
    this.currentRoomNo = null; // 현재 접속한 채팅방 번호
  }

  /**
   * WebSocket 연결
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        console.log("🔌 이미 웹소켓에 연결되어 있습니다.");
        resolve();
        return;
      }

      if (this.isConnecting && this.connectionPromise) {
        console.log("🔌 이미 웹소켓 연결 시도 중... 기존 Promise 반환");
        this.connectionPromise.then(resolve).catch(reject);
        return;
      }

      this.isConnecting = true;
      this.connectionPromise = this._doConnect();

      this.connectionPromise
        .then(() => {
          this.isConnecting = false;
          resolve();
        })
        .catch((error) => {
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(error);
        });
    });
  }

  /**
   * 실제 연결 처리
   */ _doConnect() {
    return new Promise((resolve, reject) => {
      const memberInfo = getCookie("member");
      if (!memberInfo || !memberInfo.accessToken) {
        console.error("❌ 인증 토큰이 없습니다.");
        reject(new Error("인증 토큰이 없습니다."));
        return;
      }

      // JWT 토큰 만료 확인
      if (isTokenExpired(memberInfo.accessToken)) {
        console.error("❌ JWT 토큰이 만료되었습니다.");
        reject(new Error("JWT 토큰이 만료되었습니다. 다시 로그인해주세요."));
        return;
      }
      console.log("🔑 JWT 토큰 유효성 확인 완료");

      // 웹소켓 URL 동적 생성 (로컬/서버 환경에 따라 프로토콜 자동 결정)
      const wsHost =
        window.location.hostname === "localhost"
          ? "localhost:8080"
          : window.location.host;
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${wsHost}/ws?access_token=${memberInfo.accessToken}`;

      this.client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${memberInfo.accessToken}`, // 이중 보안을 위한 헤더도 유지
        },
        debug: function (str) {
          console.log("🔍 STOMP Debug:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log("✅ 단체채팅 WebSocket 연결 성공:", frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      };
      this.client.onStompError = (frame) => {
        console.error("❌ STOMP 오류:", frame.headers["message"]);
        console.error("추가 정보:", frame.body);
        console.error("에러 헤더:", frame.headers);
        this.isConnected = false;

        // JWT 인증 관련 에러인지 확인
        if (
          frame.headers["message"] &&
          frame.headers["message"].includes("JWT")
        ) {
          reject(
            new Error(
              `JWT 인증 실패: ${frame.headers["message"]}. 다시 로그인해주세요.`
            )
          );
        } else {
          reject(new Error(`STOMP 오류: ${frame.headers["message"]}`));
        }
      };

      this.client.onWebSocketError = (error) => {
        console.error("❌ WebSocket 오류:", error);
        console.error("연결 상태:", this.isConnected);
        this.isConnected = false;
        reject(new Error(`WebSocket 연결 실패: ${error.message || error}`));
      };

      this.client.onWebSocketClose = (event) => {
        console.log("🔌 WebSocket 연결 종료:", event);
        this.isConnected = false;
        this._handleDisconnection();
      };

      try {
        this.client.activate();
      } catch (error) {
        console.error("❌ WebSocket 활성화 실패:", error);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  /**
   * 채팅방 입장
   */
  joinRoom(roomNo) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return false;
    }

    console.log(`🚪 채팅방 ${roomNo} 입장 시도`);

    try {
      // 입장 메시지 전송
      this.client.publish({
        destination: `/app/multchat/join/${roomNo}`,
        body: JSON.stringify({
          messageType: "JOIN",
          content: "입장",
        }),
      });

      this.currentRoomNo = roomNo;
      console.log(`✅ 채팅방 ${roomNo} 입장 완료`);
      return true;
    } catch (error) {
      console.error("❌ 채팅방 입장 실패:", error);
      return false;
    }
  }
  /**
   * 채팅방 나가기
   * @param {string} roomNo - 채팅방 번호 (선택사항, 기본값: 현재 채팅방)
   * @param {boolean} isRealLeave - 실제 나가기 여부 (기본값: false, 임시 나가기)
   */
  leaveRoom(roomNo = null, isRealLeave = false) {
    const targetRoomNo = roomNo || this.currentRoomNo;

    if (!this.isConnected || !this.client || !targetRoomNo) {
      console.error("❌ 웹소켓이 연결되지 않았거나 채팅방 정보가 없습니다.");
      return false;
    }

    // 이미 나간 채팅방인지 확인
    if (targetRoomNo !== this.currentRoomNo) {
      console.log(`⚠️ 이미 채팅방 ${targetRoomNo}에서 나간 상태입니다.`);
      return true;
    }

    if (isRealLeave) {
      console.log(`🚪 실제 나가기 - 채팅방 ${targetRoomNo}`);
      
      try {
        // 실제 나가기 메시지 전송
        this.client.publish({
          destination: `/app/multchat/leave/${targetRoomNo}`,
          body: JSON.stringify({
            messageType: "REAL_LEAVE",
            content: "나가기",
          }),
        });

        // 해당 채팅방 관련 구독 모두 해제
        this.unsubscribeRoom(targetRoomNo);

        // 현재 채팅방 정보 초기화
        this.currentRoomNo = null;

        console.log(`✅ 실제 나가기 완료 - 채팅방 ${targetRoomNo}`);
        return true;
      } catch (error) {
        console.error("❌ 실제 나가기 실패:", error);
        return false;
      }
    } else {
      console.log(`🚫 임시 나가기 요청 무시 - 채팅방 ${targetRoomNo} (나가기 버튼을 누르지 않는 한 소속 유지)`);
      // 임시 나가기는 아무것도 하지 않음
      return true;
    }
  }
  /**
   * 메시지 전송
   */
  sendMessage(roomNo, content) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return false;
    }

    if (!content || content.trim() === "") {
      console.warn("⚠️ 빈 메시지는 전송할 수 없습니다.");
      return false;
    }

    // 이모지 포함 메시지 상세 로깅
    const containsEmoji =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
        content
      );

    console.log(`📤 메시지 전송 - 방번호: ${roomNo}`);
    console.log(`📝 내용: ${content}`);
    console.log(`🎭 이모지 포함: ${containsEmoji}`);

    if (containsEmoji) {
      console.log(`🔍 이모지 상세 정보:`);
      for (let i = 0; i < content.length; i++) {
        const char = content.charAt(i);
        const code = content.codePointAt(i);
        if (code > 127) {
          // Non-ASCII 문자
          console.log(
            `  - 문자: ${char}, 유니코드: U+${code.toString(16).toUpperCase()}`
          );
        }
      }
    }

    try {
      const messageData = {
        messageType: "CHAT",
        content: content.trim(),
      };

      console.log(`📦 전송 데이터:`, JSON.stringify(messageData));

      this.client.publish({
        destination: `/app/multchat/send/${roomNo}`,
        body: JSON.stringify(messageData),
      });

      console.log(`✅ 메시지 전송 완료`);
      return true;
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
      return false;
    }
  }

  /**
   * 메시지 전송 (다형성 지원)
   * - sendMessage(roomNo, content) : 멀티 채팅 방식
   * - sendMessage('/app/path', data) : 1:1 채팅 호환 방식
   */
  sendMessage(arg1, arg2) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return false;
    }

    // 첫 번째 인자가 문자열이고 '/app/'으로 시작하는 경우 - 1:1 채팅 호환 모드
    if (typeof arg1 === 'string' && arg1.startsWith('/app/')) {
      const destination = arg1;
      const data = arg2;
      
      try {
        console.log(`📤 메시지 전송 (호환 모드) - 목적지: ${destination}`);
        console.log(`📦 전송 데이터:`, data);

        this.client.publish({
          destination: destination,
          body: JSON.stringify(data),
        });

        console.log(`✅ 메시지 전송 완료 (호환 모드)`);
        return true;
      } catch (error) {
        console.error("❌ 메시지 전송 실패 (호환 모드):", error);
        return false;
      }
    } else {
      // 멀티 채팅 방식 (roomNo, content)
      const roomNo = arg1;
      const content = arg2;
      
      if (!content || content.trim() === "") {
        console.warn("⚠️ 빈 메시지는 전송할 수 없습니다.");
        return false;
      }

      // 이모지 포함 메시지 상세 로깅
      const containsEmoji =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(
          content
        );

      console.log(`📤 메시지 전송 - 방번호: ${roomNo}`);
      console.log(`📝 내용: ${content}`);
      console.log(`🎭 이모지 포함: ${containsEmoji}`);

      if (containsEmoji) {
        console.log(`🔍 이모지 상세 정보:`);
        for (let i = 0; i < content.length; i++) {
          const char = content.charAt(i);
          const code = content.codePointAt(i);
          if (code > 127) {
            // Non-ASCII 문자
            console.log(
              `  - 문자: ${char}, 유니코드: U+${code.toString(16).toUpperCase()}`
            );
          }
        }
      }

      try {
        const messageData = {
          messageType: "CHAT",
          content: content.trim(),
        };

        console.log(`📦 전송 데이터:`, JSON.stringify(messageData));

        this.client.publish({
          destination: `/app/multchat/send/${roomNo}`,
          body: JSON.stringify(messageData),
        });

        console.log(`✅ 메시지 전송 완료`);
        return true;
      } catch (error) {
        console.error("❌ 메시지 전송 실패:", error);
        return false;
      }
    }
  }

  /**
   * 채팅방 메시지 구독
   */
  subscribeRoomMessages(roomNo, callback) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return null;
    }

    const destination = `/topic/multchat/room/${roomNo}`;

    if (this.subscriptions.has(destination)) {
      console.log(`📡 이미 구독 중: ${destination}`);
      this.messageCallbacks.set(destination, callback);
      return this.subscriptions.get(destination);
    }

    console.log(`📡 채팅방 메시지 구독 시작: ${destination}`);

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          console.log(`📥 채팅방 메시지 수신 [${roomNo}]:`, parsedMessage);

          const currentCallback = this.messageCallbacks.get(destination);
          if (currentCallback) {
            currentCallback(parsedMessage);
          }
        } catch (error) {
          console.error("❌ 메시지 파싱 오류:", error);
        }
      });

      this.subscriptions.set(destination, subscription);
      this.messageCallbacks.set(destination, callback);

      console.log(`✅ 채팅방 메시지 구독 완료: ${destination}`);
      return subscription;
    } catch (error) {
      console.error("❌ 채팅방 메시지 구독 실패:", error);
      return null;
    }
  }

  /**
   * 채팅방 알림 구독 (사용자 입장/퇴장, 온라인 목록 등)
   */
  subscribeRoomNotifications(roomNo, callback) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return null;
    }

    const destination = `/topic/multchat/room/${roomNo}/notification`;

    if (this.subscriptions.has(destination)) {
      console.log(`📡 이미 구독 중: ${destination}`);
      this.messageCallbacks.set(destination, callback);
      return this.subscriptions.get(destination);
    }

    console.log(`📡 채팅방 알림 구독 시작: ${destination}`);

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const parsedNotification = JSON.parse(message.body);
          console.log(`🔔 채팅방 알림 수신 [${roomNo}]:`, parsedNotification);

          const currentCallback = this.messageCallbacks.get(destination);
          if (currentCallback) {
            currentCallback(parsedNotification);
          }
        } catch (error) {
          console.error("❌ 알림 파싱 오류:", error);
        }
      });

      this.subscriptions.set(destination, subscription);
      this.messageCallbacks.set(destination, callback);

      console.log(`✅ 채팅방 알림 구독 완료: ${destination}`);
      return subscription;
    } catch (error) {
      console.error("❌ 채팅방 알림 구독 실패:", error);
      return null;
    }
  }

  /**
   * 특정 채팅방의 모든 구독 해제
   */
  unsubscribeRoom(roomNo) {
    const messageDestination = `/topic/multchat/room/${roomNo}`;
    const notificationDestination = `/topic/multchat/room/${roomNo}/notification`;

    this.unsubscribe(messageDestination);
    this.unsubscribe(notificationDestination);

    console.log(`📡 채팅방 ${roomNo}의 모든 구독 해제 완료`);
  }
  /**
   * 일반적인 구독 메서드 (1:1 채팅 웹소켓 서비스와 호환성)
   */
  subscribe(destination, callback) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않아 구독할 수 없습니다.");
      return null;
    }

    try {
      console.log(`📡 구독 시작: ${destination}`);
      
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log(`📥 메시지 수신 (${destination}):`, data);
          if (callback && typeof callback === 'function') {
            callback(data);
          }
        } catch (error) {
          console.error(`❌ 메시지 파싱 오류 (${destination}):`, error);
        }
      });

      this.subscriptions.set(destination, subscription);
      this.messageCallbacks.set(destination, callback);
      
      console.log(`✅ 구독 완료: ${destination}`);
      return subscription;
    } catch (error) {
      console.error(`❌ 구독 실패 (${destination}):`, error);
      return null;
    }
  }

  /**
   * 특정 구독 해제
   */
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      try {
        subscription.unsubscribe();
        this.subscriptions.delete(destination);
        this.messageCallbacks.delete(destination);
        console.log(`📡 구독 해제: ${destination}`);
      } catch (error) {
        console.warn(`⚠️ 구독 해제 중 오류 발생: ${destination}`, error);
        // 오류가 발생해도 맵에서는 제거
        this.subscriptions.delete(destination);
        this.messageCallbacks.delete(destination);
      }
    } else {
      // 로그 레벨을 debug로 낮춤
      console.debug(`📡 구독되지 않은 채널 해제 시도: ${destination}`);
    }
  }

  /**
   * 연결 끊김 처리
   */
  _handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(
        `🔄 재연결 시도 ${this.reconnectAttempts + 1}/${
          this.maxReconnectAttempts
        }`
      );

      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect()
          .then(() => {
            // 재연결 성공시 현재 채팅방에 다시 입장
            if (this.currentRoomNo) {
              console.log(`🔄 재연결 후 채팅방 ${this.currentRoomNo} 재입장`);
              this.joinRoom(this.currentRoomNo);
            }
          })
          .catch((error) => {
            console.error("❌ 재연결 실패:", error);
          });
      }, this.reconnectInterval);
    } else {
      console.error("❌ 최대 재연결 시도 횟수 초과");
    }
  }

  /**
   * 연결 해제
   */
  disconnect() {
    console.log("🔌 WebSocket 연결 해제 시작");

    // 🚫 자동 나가기 방지: 연결 해제 시에는 채팅방에서 나가지 않음
    // 사용자가 명시적으로 나가기 버튼을 누르지 않는 한 채팅방 소속 유지
    if (this.currentRoomNo) {
      console.log(`🔄 연결 해제 시 채팅방 ${this.currentRoomNo} 소속 유지 (임시 나가기)`);
      // this.leaveRoom(this.currentRoomNo); // 자동 나가기 비활성화
    }

    // 모든 구독 해제
    this.subscriptions.forEach((subscription, destination) => {
      subscription.unsubscribe();
      console.log(`📡 구독 해제: ${destination}`);
    });

    this.subscriptions.clear();
    this.messageCallbacks.clear();

    // 클라이언트 비활성화
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.currentRoomNo = null;
    this.reconnectAttempts = 0;
    this.connectionPromise = null;

    console.log("✅ WebSocket 연결 해제 완료");
  }

  /**
   * 연결 상태 확인
   */
  isWebSocketConnected() {
    return this.isConnected;
  }

  /**
   * 연결 상태 확인
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      currentRoomNo: this.currentRoomNo,
      subscriptionCount: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const multChatWebSocketService = new MultChatWebSocketService();
export default multChatWebSocketService;
