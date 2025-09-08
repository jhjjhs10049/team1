// 중복 alert 방지를 위한 전역 상태 관리
class AlertManager {
  constructor() {
    this.isShowing = false;
    this.currentMessage = "";
  }
  showAlert(message) {
    // 같은 메시지가 이미 표시 중이면 무시
    if (this.isShowing && this.currentMessage === message) {
      return false;
    }

    this.isShowing = true;
    this.currentMessage = message;

    // 즉시 alert 표시
    try {
      alert(message);
    } catch (error) {
      console.error("Alert error:", error);
      console.log("Alert message:", message);
    }

    // 1초 후 플래그 해제
    setTimeout(() => {
      this.isShowing = false;
      this.currentMessage = "";
    }, 1000);

    return true;
  }

  // 디버깅용 메서드
  testAlert() {
    this.showAlert("테스트 알람입니다!");
  }
}

// 싱글톤 인스턴스 생성
const alertManager = new AlertManager();

export default alertManager;
