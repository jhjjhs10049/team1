package org.zerock.mallapi.global.constants;

/**
 * 웹소켓 목적지 상수 정의
 * Topic vs Queue 구분을 명확하게 하기 위한 상수 클래스
 */
public class WebSocketDestinations {
    
    // Topic (브로드캐스트) - 1:N 전달
    public static class Topic {        public static final String ADMIN_STATUS = "/topic/chat/admin/status";
        public static final String ONLINE_USERS = "/topic/onlineUsers";
        public static final String PUBLIC = "/topic/public";
    }
    
    // Queue (점대점) - 1:1 전달
    public static class Queue {
        public static String chatMessage(Long roomNo) {
            return "/queue/chat/" + roomNo;
        }
        
        public static String chatStatus(Long roomNo) {
            return "/queue/chat/" + roomNo + "/status";
        }
          // 회원별 강제 로그아웃 알림
        public static String memberLogout(Long memberNo) {
            return "/queue/member/" + memberNo + "/logout";
        }
    }
    
    // 사용 용도별 구분을 위한 열거형
    public enum Purpose {
        BROADCAST("TOPIC", "모든 구독자가 동일한 메시지 수신"),
        INDIVIDUAL("QUEUE", "한 명씩 순차적으로 메시지 수신 (라운드로빈)");
        
        private final String type;
        private final String description;
        
        Purpose(String type, String description) {
            this.type = type;
            this.description = description;
        }
        
        public String getType() { return type; }
        public String getDescription() { return description; }
    }
}
