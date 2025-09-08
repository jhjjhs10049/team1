import { Client } from "@stomp/stompjs";
import { getCookie, isTokenExpired } from "../../../member/util/cookieUtil";

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false; // 연결 중 상태 추가
    this.subscriptions = new Map();
    this.messageCallbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.connectionPromise = null; // 연결 Promise 캐싱
  }
  connect() {
    return new Promise((resolve, reject) => {
      // 이미 연결되어 있으면 즉시 resolve
      if (this.isConnected) {
        console.log("🔌 이미 웹소켓에 연결되어 있습니다.");
        resolve();
        return;
      }

      // 연결 중이면 기존 Promise 반환
      if (this.isConnecting && this.connectionPromise) {
        console.log("🔌 이미 웹소켓 연결 시도 중... 기존 Promise 반환");
        this.connectionPromise.then(resolve).catch(reject);
        return;
      }

      // 새로운 연결 시작
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

  _doConnect() {
    return new Promise((resolve, reject) => {
      // 토큰 확인
      const memberInfo = getCookie("member");
      if (!memberInfo || !memberInfo.accessToken) {
        console.error("❌ 인증 토큰이 없습니다.");
        reject(new Error("인증 토큰이 없습니다."));
        return;
      }

      // 토큰 만료 확인
      if (isTokenExpired(memberInfo.accessToken)) {
        console.error("❌ JWT 토큰이 만료되었습니다.");
        // 강제 로그아웃 이벤트 발생
        window.dispatchEvent(
          new CustomEvent("forceLogout", {
            detail: { reason: "JWT 토큰 만료" },
          })
        );
        reject(new Error("JWT 토큰이 만료되었습니다."));
        return;
      }
      console.log("🔌 웹소켓 연결 시도 중..."); // 웹소켓 URL 동적 생성
      const wsHost =
        window.location.hostname === "localhost"
          ? "localhost:8080"
          : window.location.host;
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${wsHost}/ws?access_token=${memberInfo.accessToken}`;

      console.log("🔌 웹소켓 연결 URL:", wsUrl);

      this.client = new Client({
        brokerURL: wsUrl,
        debug: (str) => {
          console.log("🔌 STOMP Debug:", str);
        },
        onConnect: (frame) => {
          console.log("✅ 웹소켓 연결 성공!", frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        },
        onStompError: (frame) => {
          console.error("❌ STOMP 오류:", frame);
          console.error("❌ STOMP 오류 헤더:", frame.headers);
          console.error("❌ STOMP 오류 본문:", frame.body);
          this.isConnected = false;
          reject(new Error(`STOMP 오류: ${frame.body}`));
        },
        onDisconnect: () => {
          console.log("🔌 웹소켓 연결 해제됨");
          this.isConnected = false;
          this.subscriptions.clear();
          this.attemptReconnect();
        },
        onWebSocketError: (error) => {
          console.error("❌ 웹소켓 오류:", error);
          console.error("❌ 웹소켓 연결 상태:", this.client?.connected);
          this.isConnected = false;
          reject(error);
        },
        onWebSocketClose: (event) => {
          console.log("🔌 웹소켓 닫힘:", event);
          this.isConnected = false;
        },
      });

      this.client.activate();
    });
  }
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ 최대 재연결 시도 횟수 초과");
      return;
    } // 토큰 유효성 확인
    const memberInfo = getCookie("member");
    if (!memberInfo || !memberInfo.accessToken) {
      console.error("❌ 재연결 시도 중 토큰이 없음 - 재연결 중단");
      // 토큰이 없으면 강제 로그아웃 처리
      window.dispatchEvent(
        new CustomEvent("forceLogout", {
          detail: { reason: "토큰 없음으로 인한 웹소켓 연결 실패" },
        })
      );
      return;
    }

    // 토큰 만료 확인
    if (isTokenExpired(memberInfo.accessToken)) {
      console.error("❌ 재연결 시도 중 토큰이 만료됨 - 재연결 중단");
      // 토큰이 만료되면 강제 로그아웃 처리
      window.dispatchEvent(
        new CustomEvent("forceLogout", {
          detail: { reason: "JWT 토큰 만료로 인한 웹소켓 연결 실패" },
        })
      );
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("❌ 재연결 실패:", error);
        // JWT 만료 관련 에러인 경우 강제 로그아웃
        if (error.message && error.message.includes("401")) {
          console.error("❌ JWT 토큰 만료로 인한 연결 실패 - 강제 로그아웃");
          window.dispatchEvent(
            new CustomEvent("forceLogout", {
              detail: { reason: "JWT 토큰 만료" },
            })
          );
        }
      });
    }, this.reconnectInterval);
  }
  subscribe(destination, callback) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return null;
    }

    // 이미 구독 중인지 확인
    if (this.subscriptions.has(destination)) {
      console.log(`📡 이미 구독 중: ${destination}`);
      // 기존 콜백을 새 콜백으로 업데이트
      this.messageCallbacks.set(destination, callback);
      return this.subscriptions.get(destination);
    }

    console.log(`📡 구독 시작: ${destination}`);
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        console.log(`📥 메시지 수신 [${destination}]:`, parsedMessage);

        // 최신 콜백 함수 사용
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
    console.log(
      `✅ 구독 완료: ${destination} (총 ${this.subscriptions.size}개 구독 중)`
    );
    return subscription;
  }
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      this.messageCallbacks.delete(destination);
      console.log(
        `📡 구독 해제: ${destination} (남은 구독: ${this.subscriptions.size}개)`
      );
    } else {
      console.log(`⚠️ 구독되지 않은 채널 해제 시도: ${destination}`);
    }
  }

  sendMessage(destination, message) {
    if (!this.isConnected || !this.client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return false;
    }

    try {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(message),
      });
      console.log("📤 메시지 전송:", message);
      return true;
    } catch (error) {
      console.error("❌ 메시지 전송 오류:", error);
      return false;
    }
  }

  disconnect() {
    if (this.client) {
      console.log("🔌 웹소켓 연결 해제 중...");
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.messageCallbacks.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  isWebSocketConnected() {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스
const websocketService = new WebSocketService();
export default websocketService;
