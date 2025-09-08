import React, { useState } from "react";
import {
  banMember,
  unbanMember,
  restoreMember,
  changeMemberRole,
} from "../api/adminMemberApi";
import useCustomLogin from "../../../member/login/hooks/useCustomLogin";

const MemberActionModal = ({ member, action, onClose, onComplete }) => {
  const { loginState } = useCustomLogin(); // 로그인 상태 가져오기
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 정지 관련 상태
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");
  const [banType, setBanType] = useState("temporary"); // temporary, permanent

  // 권한 변경 상태
  const [newRole, setNewRole] = useState(member?.role || "USER");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (action) {
        case "ban": {
          if (!banReason.trim()) {
            setError("정지 사유를 입력해주세요.");
            return;
          }

          let bannedUntil = null;
          if (banType === "temporary") {
            if (!banDuration) {
              setError("정지 기간을 선택해주세요.");
              return;
            }
            const now = new Date();
            const duration = parseInt(banDuration);
            bannedUntil = new Date(
              now.getTime() + duration * 24 * 60 * 60 * 1000
            ).toISOString();
          }
          await banMember({
            memberNo: member.memberNo,
            reason: banReason,
            bannedUntil: bannedUntil,
            bannedBy: loginState.roleCode || "UNKNOWN", // roleCode 사용
          });
          break;
        }
        case "unban":
          await unbanMember(member.memberNo, loginState.roleCode || "UNKNOWN");
          break;

        case "restore":
          await restoreMember(member.memberNo);
          break;

        case "changeRole":
          if (newRole === member.role) {
            setError("동일한 권한입니다.");
            return;
          }
          await changeMemberRole(member.memberNo, newRole);
          break;

        default:
          setError("알 수 없는 액션입니다.");
          return;
      }

      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || "작업 중 오류가 발생했습니다.");
      console.error("액션 실행 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (action) {
      case "ban":
        return "회원 정지";
      case "unban":
        return "정지 해제";
      case "restore":
        return "계정 복구";
      case "changeRole":
        return "권한 변경";
      default:
        return "회원 관리";
    }
  };

  const getActionButtonText = () => {
    switch (action) {
      case "ban":
        return "정지하기";
      case "unban":
        return "해제하기";
      case "restore":
        return "복구하기";
      case "changeRole":
        return "변경하기";
      default:
        return "확인";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{getModalTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* 회원 정보 표시 */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p>
            <strong>회원번호:</strong> {member.memberNo}
          </p>
          <p>
            <strong>이메일:</strong> {member.email}
          </p>
          <p>
            <strong>닉네임:</strong> {member.nickname}
          </p>
          <p>
            <strong>현재 상태:</strong>
            <span
              className={`ml-2 px-2 py-1 text-xs rounded ${
                member.active === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : member.active === "BANNED"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {member.active === "ACTIVE" && "활성"}
              {member.active === "BANNED" && "정지"}
              {member.active === "DELETED" && "삭제"}
            </span>
          </p>
          {action !== "changeRole" && (
            <p>
              <strong>권한:</strong> {member.role}
            </p>
          )}
        </div>

        {/* 액션별 입력 폼 */}
        {action === "ban" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정지 사유 *
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="3"
                placeholder="정지 사유를 입력해주세요"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정지 유형
              </label>
              <select
                value={banType}
                onChange={(e) => setBanType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              >
                <option value="temporary">기간 정지</option>
                <option value="permanent">영구 정지</option>
              </select>
            </div>

            {banType === "temporary" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정지 기간
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                >
                  <option value="">기간 선택</option>
                  <option value="1">1일</option>
                  <option value="3">3일</option>
                  <option value="7">7일</option>
                  <option value="14">14일</option>
                  <option value="30">30일</option>
                </select>
              </div>
            )}
          </div>
        )}

        {action === "unban" && (
          <div className="text-sm text-gray-600">
            이 회원의 정지를 해제하시겠습니까?
            {member.currentBan && (
              <div className="mt-2 p-2 bg-yellow-50 rounded">
                <p>
                  <strong>정지 사유:</strong> {member.currentBan.reason}
                </p>
                <p>
                  <strong>정지 일시:</strong>
                  {new Date(member.currentBan.bannedAt).toLocaleString()}
                </p>
                {member.currentBan.bannedUntil && (
                  <p>
                    <strong>예정 해제일:</strong>
                    {new Date(member.currentBan.bannedUntil).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {action === "restore" && (
          <div className="text-sm text-gray-600">
            삭제된 계정을 복구하시겠습니까? 복구된 계정은 다시 활성 상태가
            됩니다.
          </div>
        )}

        {action === "changeRole" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새로운 권한
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
            >
              <option value="USER">USER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              MANAGER로 변경 시 자동으로 관리자 코드가 부여됩니다.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
              action === "ban"
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                : action === "restore"
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
            }`}
            disabled={loading}
          >
            {loading ? "처리 중..." : getActionButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberActionModal;
