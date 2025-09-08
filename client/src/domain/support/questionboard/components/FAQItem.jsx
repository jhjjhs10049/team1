import React, { useState } from "react";

const FAQItem = ({ faq, isAdmin, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 안전한 날짜 포맷팅 함수
  const formatDate = (dateValue) => {
    if (!dateValue) return "날짜 없음";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "날짜 오류";
      return date.toLocaleDateString("ko-KR");
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 오류";
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 shadow-sm">
      {/* 질문 부분 */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium">
            Q
          </span>
          <h3 className="text-lg font-semibold text-gray-800 flex-1">
            {faq.question}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* 관리자 버튼들 */}
          {isAdmin && (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(faq);
                }}
                className="px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
              >
                수정
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(faq.no);
                }}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          )}

          {/* 펼치기/접기 아이콘 */}
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* 답변 부분 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="flex items-start gap-3 pt-3">
            <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
              A
            </span>
            <div className="flex-1">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {faq.answer}
              </p>

              {/* 작성자 정보 */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                <span>
                  작성자: {faq.writerNickname} ({faq.writerRoleCode})
                </span>{" "}
                <span>
                  작성일: {formatDate(faq.createdAt)}
                  {faq.updatedAt !== faq.createdAt && (
                    <span className="ml-2">
                      (수정일: {formatDate(faq.updatedAt)})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
