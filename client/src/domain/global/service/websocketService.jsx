import ConnectionManager from "./connectionManager";

class WebSocketService {
  constructor() {
    this.connectionManager = new ConnectionManager();
    this.subscriptions = new Map();
    this.messageCallbacks = new Map();
  }
  async connect() {
    return this.connectionManager.connect();
  }
  subscribe(destination, callback) {
    const client = this.connectionManager.getClient();
    if (!this.connectionManager.isWebSocketConnected() || !client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return null;
    }

    // 이미 구독 중인지 확인
    if (this.subscriptions.has(destination)) {
      console.log(`📡 이미 구독 중: ${destination}`);
      this.messageCallbacks.set(destination, callback);
      return this.subscriptions.get(destination);
    }
    console.log(`📡 구독 시작: ${destination}`);
    const subscription = client.subscribe(destination, (message) => {
      try {
        // 메시지 body가 없거나 빈 경우 처리
        if (!message.body || message.body.trim() === "") {
          return;
        }

        // 특별한 케이스: "null" 문자열 체크
        if (message.body.trim() === "null") {
          return;
        }

        const parsedMessage = JSON.parse(message.body);

        // null 또는 undefined 메시지 필터링
        if (parsedMessage === null || parsedMessage === undefined) {
          return;
        }

        const currentCallback = this.messageCallbacks.get(destination);
        if (currentCallback) {
          currentCallback(parsedMessage);
        }
      } catch (error) {
        // 메시지 파싱 오류는 조용히 처리
        console.error(`Error parsing message from ${destination}:`, error);
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
    const client = this.connectionManager.getClient();
    if (!this.connectionManager.isWebSocketConnected() || !client) {
      console.error("❌ 웹소켓이 연결되지 않았습니다.");
      return false;
    }

    try {
      console.log(`📤 메시지 전송:`, message);
      client.publish({
        destination: destination,
        body: JSON.stringify(message),
      });
      console.log("✅ 메시지 전송 완료");
      return true;
    } catch (error) {
      console.error("❌ 메시지 전송 오류:", error);
      return false;
    }
  }

  disconnect() {
    console.log("🔌 웹소켓 연결 해제 중...");
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.messageCallbacks.clear();
    this.connectionManager.disconnect();
  }

  isWebSocketConnected() {
    return this.connectionManager.isWebSocketConnected();
  }
}

// 싱글톤 인스턴스
const websocketService = new WebSocketService();
export default websocketService;
