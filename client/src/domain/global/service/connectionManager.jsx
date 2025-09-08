import { Client } from "@stomp/stompjs";
import tokenManager from "./tokenManager";

class ConnectionManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  async connect() {
    // 이미 연결되어 있으면 즉시 resolve
    if (this.isConnected) {
      console.log("🔌 이미 웹소켓에 연결되어 있습니다.");
      return Promise.resolve();
    }

    // 연결 중이면 기존 Promise 반환
    if (this.isConnecting && this.connectionPromise) {
      console.log("🔌 이미 웹소켓 연결 시도 중...");
      return this.connectionPromise;
    }

    // 새로운 연결 시작
    this.isConnecting = true;
    this.connectionPromise = this._doConnect();

    try {
      await this.connectionPromise;
      this.isConnecting = false;
      return Promise.resolve();
    } catch (error) {
      this.isConnecting = false;
      this.connectionPromise = null;
      return Promise.reject(error);
    }
  }

  async _doConnect() {
    try {
      const memberInfo = await tokenManager.ensureValidToken();
      return this._establishConnection(memberInfo);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  _establishConnection(memberInfo) {
    return new Promise((resolve, reject) => {
      console.log("🔌 웹소켓 연결 시도 중...");

      // 웹소켓 URL 동적 생성
      const wsHost =
        window.location.hostname === "localhost"
          ? "localhost:8080"
          : window.location.host;
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${wsHost}/ws?access_token=${memberInfo.accessToken}`;

      this.client = new Client({
        brokerURL: wsUrl,
        debug: (str) => console.log("🔌 STOMP Debug:", str),
        onConnect: () => {
          console.log("✅ 웹소켓 연결 성공!");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        },
        onStompError: (frame) => {
          console.error("❌ STOMP 오류:", frame.body);
          this.isConnected = false;
          reject(new Error(`STOMP 오류: ${frame.body}`));
        },
        onDisconnect: () => {
          console.log("🔌 웹소켓 연결 해제됨");
          this.isConnected = false;
          this.attemptReconnect();
        },
        onWebSocketError: (error) => {
          console.error("❌ 웹소켓 오류:", error);
          this.isConnected = false;
          reject(error);
        },
      });

      this.client.activate();
    });
  }

  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ 최대 재연결 시도 횟수 초과");
      return;
    }

    try {
      await tokenManager.ensureValidToken();
      console.log("✅ 재연결용 토큰 검증 완료");
    } catch (tokenError) {
      console.error("❌ 재연결용 토큰 검증 실패:", tokenError);
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("❌ 재연결 실패:", error);
        if (error.message && error.message.includes("401")) {
          window.dispatchEvent(
            new CustomEvent("forceLogout", {
              detail: { reason: "JWT 토큰 만료" },
            })
          );
        }
      });
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.client) {
      console.log("🔌 웹소켓 연결 해제 중...");
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  getClient() {
    return this.client;
  }

  isWebSocketConnected() {
    return this.isConnected;
  }
}

export default ConnectionManager;
