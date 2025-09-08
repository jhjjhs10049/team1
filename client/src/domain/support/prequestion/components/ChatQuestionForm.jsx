import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChatQuestion } from "../api/chatQuestionApi";

const ChatQuestionForm = ({ onSuccess, onCancel }) => {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Q1 선택 옵션들
  const inquiryTypes = [
    "회원가입/로그인 문제",
    "결제/환불 문의",
    "서비스 이용 문의",
    "기술적 문제",
    "기타 문의",
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!q1.trim() || !q2.trim()) {
      alert("모든 질문에 답변해주세요.");
      return;
    }

    setLoading(true);

    try {
      const chatQuestionData = {
        q1: q1.trim(),
        q2: q2.trim(),
      };
      console.log("📤 채팅 질문 답변 등록 요청:", chatQuestionData);

      const response = await createChatQuestion(chatQuestionData);
      console.log("📥 채팅 질문 답변 등록 응답:", response);
      if (response.chatRoomId) {
        alert(`사전 질문이 등록되었습니다. 잠시후 채팅창으로 이동합니다.

⚠️ 본 채팅은 산업안전보건법에 따라 상담 내용이 기록·저장됩니다.
원활한 상담과 사후 확인을 위한 조치이며, 기록된 내용은 관련 법령에 따라 안전하게 보호됩니다.

📌 화면 너머의 상담사도 누군가의 소중한 가족입니다.
존중과 배려가 담긴 대화를 부탁드립니다.`);
        // 생성된 채팅방으로 이동
        navigate(`/support/chat/${response.chatRoomId}`);
      } else {
        alert(
          "사전 질문이 등록되었지만 채팅방 생성에 실패했습니다. 고객센터에 문의해주세요."
        );
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ 채팅 질문 답변 등록 오류:", error);
      alert(
        `등록 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <div className="mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            1대1 채팅 상담 사전 질문
          </h2>
        </div>
        <p className="text-lg text-gray-600">
          원활한 상담을 위해 아래 질문에 답변해주세요. 답변 내용을 바탕으로
          적합한 상담원이 배정됩니다.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 질문 1 - 문의 유형 선택 */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Q1. 문의 유형을 선택해주세요 <span className="text-red-500">*</span>
          </label>
          <select
            value={q1}
            onChange={(e) => setQ1(e.target.value)}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
            required
          >
            <option value="">문의 유형을 선택해주세요</option>
            {inquiryTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {/* 질문 2 - 자세한 문의사항 */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Q2. 선택하신 문의 유형에 대한 자세한 내용을 작성해주세요
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={q2}
            onChange={(e) => setQ2(e.target.value)}
            placeholder="문의하고자 하는 내용을 구체적으로 작성해주세요."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={6}
            disabled={loading}
            required
          />
        </div>
        {/* 버튼 */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            {loading ? "처리 중..." : "💬 채팅 상담 시작"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              취소
            </button>
          )}
        </div>
      </form>
      {/* 안내 메시지 */}
      <div className="mt-8 p-6 bg-teal-50 rounded-lg border border-teal-200">
        <h3 className="text-lg font-semibold text-teal-800 mb-3">
          📌 상담 안내
        </h3>
        <ul className="text-teal-700 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            상담 시간: 평일 09:00 ~ 17:00
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            사전 질문 작성 후 적합한 상담원 배정
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            채팅방에 대기열이 길 경우, 기다리시는 시간이 길어질 수 있습니다
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            채팅방을 나가시면 다시 방을 생성하셔야 하며, 이때 대기열이 다시
            적용됩니다
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            기다려주셔서 감사드리며, 불편을 최소화할 수 있도록 노력하겠습니다
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChatQuestionForm;
