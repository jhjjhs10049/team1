const RejectForm = ({
  rejectionReason,
  onReasonChange,
  onConfirm,
  onCancel,
  loading,
  isActive = false,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          거절 사유를 입력해주세요
        </label>
        <textarea
          value={rejectionReason || ""}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder={
            isActive
              ? "상담 거절 사유를 상세히 입력해주세요"
              : "거절 사유를 상세히 입력해주세요"
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 mt-1">
          {(rejectionReason || "").length}/500
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onConfirm}
          disabled={loading || !(rejectionReason || "").trim()}
          className="flex-1 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리중..." : "거절 확정"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default RejectForm;
