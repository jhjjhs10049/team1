import React, { useEffect } from "react";

const ParticipantList = ({ participants = [], currentUser }) => {
  // 참가자 목록 변경 감지를 위한 useEffect
  useEffect(() => {
    console.log(
      "👥 ParticipantList 렌더링 - 참가자 수:",
      participants.length,
      "참가자:",
      participants.map((p) => p.nickname || p.memberNickname)
    );

    // DOM 업데이트 확인
    console.log("🔄 ParticipantList DOM 업데이트 완료");
  }, [participants]);

  // 강제 렌더링 확인을 위한 현재 시간
  const renderTime = new Date().toLocaleTimeString();

  console.log(
    "🎨 ParticipantList 렌더링 시간:",
    renderTime,
    "참가자 수:",
    participants.length
  );

  return (
    <div className="flex-1 overflow-hidden">
      {/* 참가자 목록 헤더 */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">
          💬 참가자 목록 ({participants.length}명)
        </h3>
      </div>

      {/* 참가자 목록 */}
      <div className="flex-1 overflow-y-auto max-h-80">
        {participants.length > 0 ? (
          <div className="p-2 space-y-1">
            {participants.map((participant, index) => (
              <div
                key={participant.memberNo || participant.no || index}
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition duration-150"
              >
                {/* 프로필 아바타 */}
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0">
                  {(participant.nickname || participant.memberNickname || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                {/* 참가자 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {participant.nickname ||
                      participant.memberNickname ||
                      "익명"}
                    {(participant.nickname === currentUser ||
                      participant.memberNickname === currentUser) && (
                      <span className="ml-1 text-xs text-teal-600 font-normal">
                        (나)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {participant.role === "CREATOR"
                      ? "👑 방장"
                      : participant.role === "ADMIN"
                      ? "⭐ 관리자"
                      : "👤 참가자"}
                  </div>
                </div>

                {/* 온라인 상태 표시 */}
                <div
                  className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
                  title="온라인"
                ></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm">참가자가 없습니다</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
