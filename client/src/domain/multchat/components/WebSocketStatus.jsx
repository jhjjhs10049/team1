import React from "react";
import websocketService from "../services/multChatWebSocketService";

const WebSocketStatus = ({
    isWebSocketConnected,
    checkAndReconnectWebSocket
}) => {
    return (
        <div
            className={`rounded-lg p-3 text-sm flex items-center justify-between ${isWebSocketConnected
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
        >
            <div className="flex items-center space-x-2">
                <div
                    className={`w-2 h-2 rounded-full ${isWebSocketConnected ? "bg-green-400" : "bg-red-400"
                        }`}
                />
                <span>
                    {isWebSocketConnected
                        ? "🟢 실시간 업데이트 연결됨 - 참가자 수가 실시간으로 업데이트됩니다"
                        : "🔴 실시간 연결 끊어짐 - 채팅방 삭제가 실시간으로 반영되지 않을 수 있습니다"}
                </span>
            </div>

            {/* 웹소켓 재연결 버튼 */}
            {!isWebSocketConnected && (
                <button
                    onClick={checkAndReconnectWebSocket}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors"
                >
                    🔄 재연결
                </button>
            )}
        </div>
    );
};

export default WebSocketStatus;