## 🔍 웹소켓 연결 vs 구독 시나리오

### 시나리오 1: 관리자가 여러 작업을 할 때
```
관리자 A 로그인
    │
    ├── 🔌 웹소켓 연결 (ws://localhost:8080/ws?access_token=admin_token)
    │   └── ✅ 한 번만 연결, 계속 유지
    │
    ├── 📄 관리자 페이지 접속
    │   └── 📡 구독: /topic/chat/admin/status (모든 관리자 알림)
    │
    ├── 💬 채팅방 123번 입장
    │   ├── 📡 구독 추가: /queue/chat/123 (개별 메시지)
    │   └── 📡 구독 추가: /queue/chat/123/status (개별 상태)
    │
    ├── 💬 채팅방 456번 입장 
    │   ├── 📡 구독 해제: /queue/chat/123, /queue/chat/123/status
    │   ├── 📡 구독 추가: /queue/chat/456 (개별 메시지)
    │   └── 📡 구독 추가: /queue/chat/456/status (개별 상태)
    │
    └── 📄 관리자 페이지로 복귀
        ├── 📡 구독 해제: /queue/chat/456, /queue/chat/456/status  
        └── 📡 구독 유지: /topic/chat/admin/status (계속 관리자 알림 수신)
```

### 시나리오 2: 일반 사용자의 경우
```
사용자 B 로그인
    │
    ├── 🔌 웹소켓 연결 (ws://localhost:8080/ws?access_token=user_token)
    │   └── ✅ 한 번만 연결, 계속 유지
    │
    ├── 💬 고객센터 채팅 시작
    │   ├── 📡 구독: /queue/chat/789 (개별 메시지)
    │   └── 📡 구독: /queue/chat/789/status (개별 상태)
    │
    └── 💬 채팅 종료
        ├── 📡 구독 해제: /queue/chat/789, /queue/chat/789/status
        └── 🔌 웹소켓 연결 유지 (다른 기능에서 재사용)
```
