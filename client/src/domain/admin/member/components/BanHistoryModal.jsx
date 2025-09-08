import React, { useState, useEffect } from "react";
import { getBanHistory } from "../api/adminMemberApi";

const BanHistoryModal = ({ memberNo, onClose }) => {
  const [banHistory, setBanHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBanHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBanHistory(memberNo);
        setBanHistory(data);
      } catch (err) {
        setError("정지 내역을 불러오는데 실패했습니다.");
        console.error("정지 내역 조회 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    if (memberNo) {
      fetchBanHistory();
    }
  }, [memberNo]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (bannedAt, bannedUntil) => {
    if (!bannedUntil) return "영구 정지";

    const start = new Date(bannedAt);
    const end = new Date(bannedUntil);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays}일`;
  };

  const getStatusBadge = (ban) => {
    if (ban.unbannedAt) {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          해제됨
        </span>
      );
    }

    if (!ban.bannedUntil) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          영구 정지
        </span>
      );
    }

    const now = new Date();
    const endDate = new Date(ban.bannedUntil);

    if (now > endDate) {
      return (
        <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">
          자동 해제
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
        정지 중
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-7xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">정지 내역 조회</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">회원번호: {memberNo}</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">로딩 중...</div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center h-32">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-y-auto max-h-[60vh]">
            {banHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                정지 내역이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        번호
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        정지 시작
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        정지 해제 예정
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        기간
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사유
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        조치자
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        실제 해제일
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        해제 조치자
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banHistory.map((ban) => (
                      <tr key={ban.no}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ban.no}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(ban.bannedAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(ban.bannedUntil)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(ban.bannedAt, ban.bannedUntil)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={ban.reason}>
                            {ban.reason}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ban.bannedBy}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(ban.unbannedAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ban.unbannedBy || "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(ban)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanHistoryModal;
