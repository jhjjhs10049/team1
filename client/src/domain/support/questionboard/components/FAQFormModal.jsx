import React, { useState, useEffect } from "react";

const FAQFormModal = ({ isOpen, faq, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  const isEdit = !!faq;

  useEffect(() => {
    if (isEdit && faq) {
      setFormData({
        question: faq.question || "",
        answer: faq.answer || "",
      });
    } else {
      setFormData({
        question: "",
        answer: "",
      });
    }
  }, [faq, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }

    if (!formData.answer.trim()) {
      alert("답변을 입력해주세요.");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEdit ? "FAQ 수정" : "FAQ 등록"}
          </h2>
        </div>

        {/* 폼 */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              질문 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="자주 묻는 질문을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              답변 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              placeholder="질문에 대한 답변을 입력해주세요"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "처리 중..." : isEdit ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FAQFormModal;
