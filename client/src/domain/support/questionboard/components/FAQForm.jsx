import React, { useState, useEffect } from "react";
import { createFAQ, updateFAQ } from "../api/faqApi";

const FAQForm = ({ editingFAQ, onSuccess, onCancel }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingFAQ) {
      setQuestion(editingFAQ.question || "");
      setAnswer(editingFAQ.answer || "");
    } else {
      setQuestion("");
      setAnswer("");
    }
  }, [editingFAQ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }

    if (!answer.trim()) {
      alert("답변을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      console.log("📤 FAQ 등록/수정 요청:", { question, answer, editingFAQ });

      if (editingFAQ) {
        await updateFAQ({
          no: editingFAQ.no,
          question: question.trim(),
          answer: answer.trim(),
        });
        alert("FAQ가 수정되었습니다.");
      } else {
        await createFAQ({
          question: question.trim(),
          answer: answer.trim(),
        });
        alert("FAQ가 등록되었습니다.");
      }

      // 폼 초기화
      setQuestion("");
      setAnswer("");

      // 목록 새로고침
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ FAQ 저장 오류:", error);
      console.error("❌ 오류 상세:", error.response?.data || error.message);
      alert(
        `오류가 발생했습니다: ${
          error.response?.data?.message || error.message || "알 수 없는 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setQuestion("");
    setAnswer("");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">
        {editingFAQ ? "FAQ 수정" : "새 FAQ 등록"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            질문 *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="자주 묻는 질문을 입력하세요"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            답변 *
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="질문에 대한 답변을 입력하세요"
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : editingFAQ ? "수정" : "등록"}
          </button>

          {editingFAQ && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FAQForm;
