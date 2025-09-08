import React from "react";
import FAQItem from "./FAQItem";

const FAQList = ({ faqs, loading, isAdmin, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">FAQ 목록을 불러오는 중...</div>
      </div>
    );
  }

  // faqs가 배열이 아닌 경우 빈 배열로 초기화
  const faqList = Array.isArray(faqs) ? faqs : [];

  if (faqList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">등록된 FAQ가 없습니다.</div>
        {isAdmin && (
          <p className="text-sm text-gray-400 mt-2">
            관리자 페이지에서 FAQ를 추가해보세요.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqList.map((faq) => (
        <FAQItem
          key={faq.no}
          faq={faq}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default FAQList;
