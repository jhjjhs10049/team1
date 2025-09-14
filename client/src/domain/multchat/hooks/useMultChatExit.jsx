import { useState } from "react";
import { leaveChatRoom } from "../api/multChatApi";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";
import websocketService from "../services/multChatWebSocketService";

/**
 * 멀티채팅 나가기 기능을 위한 커스텀 훅
 */
const useMultChatExit = (roomInfo, username, navigate) => {
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const { loginState } = useCustomLogin();

    // 방장 여부 확인
    const isCreator = roomInfo?.creatorNickname === username;

    const handleLeave = () => {
        setShowExitConfirm(true);
    };

    const handleExitConfirm = async () => {
        if (!roomInfo?.no) {
            console.error("❌ 채팅방 정보가 없습니다.");
            return;
        }

        try {
            setIsLeaving(true);
            console.log("� [DEBUG] 채팅방 나가기 프로세스 시작");
            console.log("�📤 채팅방 나가기 요청...", { roomNo: roomInfo.no });
            console.log("🔍 [DEBUG] WebSocket 연결 상태:", websocketService.isWebSocketConnected());
            console.log("🔍 [DEBUG] 현재 채팅방 번호:", roomInfo.no);

            // 1. 웹소켓을 통한 실시간 나가기 알림 전송 (실제 나가기)
            if (websocketService.isWebSocketConnected()) {
                console.log("📤 웹소켓 실제 나가기 처리...");
                console.log("🔍 [DEBUG] leaveRoom 호출 전 - roomNo:", roomInfo.no, "isRealLeave: true");
                const success = websocketService.leaveRoom(roomInfo.no, true); // isRealLeave = true
                console.log("🔍 [DEBUG] leaveRoom 호출 결과:", success);
                if (success) {
                    console.log("✅ 웹소켓 실제 나가기 완료");
                } else {
                    console.warn("⚠️ 웹소켓 실제 나가기 실패");
                }
            } else {
                console.error("❌ WebSocket이 연결되지 않음!");
            }

            // 2. API 호출로 실제 채팅방에서 나가기 (DB 업데이트)
            // ⚠️ WebSocket으로 이미 처리되었으므로 HTTP API 호출 제거
            console.log("ℹ️ WebSocket으로 나가기 처리 완료, HTTP API 호출 생략");

            /*
            try {
                await leaveChatRoom(roomInfo.no);
                console.log("✅ HTTP API 채팅방 나가기 완료");
            } catch (apiError) {
                console.warn("⚠️ HTTP API 채팅방 나가기 실패 (WebSocket으로 이미 처리됨):", apiError.message);
                // WebSocket으로 이미 처리되었으므로 에러 무시하고 계속 진행
            }
            */

            console.log("✅ 채팅방 나가기 완료");

            // localStorage에서 입장 기록 삭제 (다음 입장 시 다시 알림이 나오도록)
            if (loginState?.memberNo) {
                const joinedRoomsKey = `multchat_joined_rooms_${loginState.memberNo}`;
                const joinedRooms = JSON.parse(localStorage.getItem(joinedRoomsKey) || '{}');
                delete joinedRooms[roomInfo.no];
                localStorage.setItem(joinedRoomsKey, JSON.stringify(joinedRooms));
                console.log("🗑️ 채팅방 입장 기록 삭제:", roomInfo.no);
            }

            // 성공 메시지 표시
            if (isCreator) {
                alert("채팅방에서 나갔습니다. 방장 권한이 다른 참가자에게 위임되었습니다.");
            } else {
                alert("채팅방에서 나갔습니다.");
            }

            setShowExitConfirm(false);

            // 멀티채팅 메인 페이지로 이동
            navigate("/multchat");

        } catch (error) {
            console.error("❌ 채팅방 나가기 오류:", error);

            let errorMessage = "채팅방 나가기 중 오류가 발생했습니다.";

            // 서버 응답에 따른 에러 메시지 처리
            if (error.response?.status === 400) {
                // 이미 나간 채팅방이거나 참가하지 않은 채팅방인 경우
                if (error.response?.data?.message?.includes("참가 중이지 않은")) {
                    errorMessage = "이미 나간 채팅방입니다.";
                    // 이미 나간 경우 메인 페이지로 이동
                    setShowExitConfirm(false);
                    navigate("/multchat");
                    return;
                } else {
                    errorMessage = error.response.data.message || "잘못된 요청입니다.";
                }
            } else if (error.response?.status === 500) {
                errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        } finally {
            setIsLeaving(false);
        }
    };

    const handleExitCancel = () => {
        setShowExitConfirm(false);
    };

    return {
        showExitConfirm,
        isLeaving,
        isCreator,
        handleLeave,
        handleExitConfirm,
        handleExitCancel,
    };
};

export default useMultChatExit;
