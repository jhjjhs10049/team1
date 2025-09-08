import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BasicLayout from "../../../../layouts/BasicLayout";
import FAQList from "../components/FAQList";
import FAQForm from "../components/FAQForm";
import ChatHistoryModal from "../../prequestion/components/ChatHistoryModal";
import { getAllFAQs, deleteFAQ } from "../api/faqApi";

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 네비게이션 훅
  const navigate = useNavigate();

  // 로그인 상태 확인
  const loginState = useSelector((state) => state.loginSlice);
  const isAdmin =
    loginState?.roleNames?.includes("ADMIN") ||
    loginState?.roleNames?.includes("MANAGER");

  // FAQ 목록 로드
  const loadFAQs = async () => {
    try {
      setLoading(true);
      console.log("📥 FAQ 목록 요청 시작");

      const data = await getAllFAQs();
      console.log("📥 FAQ 목록 응답:", data);

      // 응답이 배열인지 확인하고 설정
      if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        console.warn("⚠️ API 응답이 배열이 아닙니다:", data);
        setFaqs([]);
      }
    } catch (error) {
      console.error("❌ FAQ 목록 로드 오류:", error);
      setFaqs([]);
      alert(
        `FAQ 목록을 불러오는데 실패했습니다: ${
          error.message || "알 수 없는 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  // FAQ 수정 시작
  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setShowForm(true);
  };

  // FAQ 삭제
  const handleDelete = async (no) => {
    try {
      console.log("🗑️ FAQ 삭제 요청:", no);
      await deleteFAQ(no);
      alert("FAQ가 삭제되었습니다.");
      loadFAQs(); // 목록 새로고침
    } catch (error) {
      console.error("❌ FAQ 삭제 오류:", error);
      alert(
        `삭제 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`
      );
    }
  };

  // 폼 성공 처리
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFAQ(null);
    loadFAQs(); // 목록 새로고침
  };

  // 폼 취소 처리
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFAQ(null);
  };
  return (
    <BasicLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">고객센터</h1>
          <p className="text-gray-600">자주 묻는 질문을 확인하세요.</p>
          {/* 운영시간 안내 */}
          <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">
              📞 고객센터 운영시간
            </h3>
            <p className="text-teal-700">
              평일 09:00 ~ 17:00 (주말 및 공휴일 휴무)
            </p>
            <p className="text-sm text-teal-600 mt-1">
              긴급한 문의사항은 1대1 채팅을 이용해주세요.
            </p>
          </div>
        </div>
        {/* 관리자 추가 버튼 */}
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              {showForm ? "폼 닫기" : "새 FAQ 추가"}
            </button>
          </div>
        )}
        {/* FAQ 폼 (관리자용) */}
        {isAdmin && showForm && (
          <div className="mb-8">
            <FAQForm
              editingFAQ={editingFAQ}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}
        {/* FAQ 목록 */}
        <FAQList
          faqs={faqs}
          loading={loading}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {/* 1대1 채팅 버튼 (사용자용) */}
        {!isAdmin && (
          <div className="mt-8 text-center space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/support/chat")}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                💬 1대1 채팅 문의
              </button>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                📋 문의 기록
              </button>
            </div>
            <p className="text-sm text-gray-500">
              원하는 답변을 찾지 못하셨나요? 1대1 채팅으로 문의하거나 이전 문의
              기록을 확인해보세요.
            </p>
          </div>
        )}
        {/* 문의 기록 모달 */}
        <ChatHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      </div>
    </BasicLayout>
  );
};

export default FAQPage;
