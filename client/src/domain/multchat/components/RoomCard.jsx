import React from "react";

const RoomCard = ({
    room,
    realTimeRoomInfo,
    isWebSocketConnected,
    onJoinRoom
}) => {
    // 실시간 업데이트된 참가자 수가 있으면 그것을 사용, 없으면 기본값 사용
    const realtimeInfo = realTimeRoomInfo.get(room.no);
    const currentParticipants =
        realtimeInfo?.currentParticipants ?? room.currentParticipants;

    return (
        <div
            key={room.no}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 cursor-pointer relative"
            onClick={() => onJoinRoom(room.no)}
        >
            {/* 웹소켓 연결 상태 표시 */}
            <div className="absolute top-3 right-3 flex items-center space-x-2">
                <div
                    className={`w-2 h-2 rounded-full ${isWebSocketConnected ? "bg-green-400" : "bg-red-400"
                        }`}
                    title={isWebSocketConnected ? "실시간 연결됨" : "연결 끊어짐"}
                />
                {(room.roomType === "PRIVATE" || room.hasPassword) && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        🔒 비공개
                    </span>
                )}
                <span
                    className={`text-xs px-2 py-1 rounded-full ${room.status === "ACTIVE"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {room.status === "ACTIVE" ? "활성" : "비활성"}
                </span>
            </div>

            <div className="flex justify-between items-start mb-3 pr-16">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center">
                    {room.roomName}
                    {(room.roomType === "PRIVATE" || room.hasPassword) && (
                        <span className="ml-2 text-yellow-600" title="비밀번호가 필요한 채팅방">
                            🔒
                        </span>
                    )}
                </h3>
            </div>

            {room.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {room.description}
                </p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                    <span
                        className={`flex items-center ${realtimeInfo ? "text-teal-600 font-medium" : ""
                            }`}
                        title="전체 참가자 수 (임시퇴장 포함)"
                    >
                        👥 {currentParticipants}/{room.maxParticipants}
                        {realtimeInfo && (
                            <span className="ml-1 text-xs text-teal-500" title="실시간 업데이트됨">
                                ●
                            </span>
                        )}
                    </span>
                    <span>👑 {room.creatorNickname}</span>
                </div>
                {room.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                )}
            </div>

            {room.lastMessage && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 truncate">
                        <span className="font-medium">
                            {room.lastMessage.senderNickname}:
                        </span>
                        {room.lastMessage.content}
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoomCard;