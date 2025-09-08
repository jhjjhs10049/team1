import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import BasicLayout from "../../../../layouts/BasicLayout";
import { ProtectedChat } from "../../../../common/config/ProtectedLogin";
import ChatQuestionForm from "../components/ChatQuestionForm";
import { getMyChatQuestions } from "../api/chatQuestionApi";

const ChatQuestionPage = () => {
  const [showForm, setShowForm] = useState(true); // 바로 폼을 보여줌
  const [myChatQuestions, setMyChatQuestions] = useState([]);
  const [_loading, setLoading] = useState(false);

  // 로그인 상태 확인
  const loginState = useSelector((state) => state.loginSlice);
  const isLogin = loginState.email; // 로그인 여부 확인

  // 내 채팅 질문 목록 로드
  const loadMyChatQuestions = useCallback(async () => {
    if (!isLogin) return;

    setLoading(true);
    try {
      console.log("📥 내 채팅 질문 목록 로드 중...");
      const data = await getMyChatQuestions();
      console.log("✅ 내 채팅 질문 목록 로드 완료:", data);

      // data가 배열이 아닌 경우 빈 배열로 초기화
      const chatQuestionList = Array.isArray(data) ? data : [];
      setMyChatQuestions(chatQuestionList);
    } catch (error) {
      console.error("❌ 내 채팅 질문 목록 로드 오류:", error);
      setMyChatQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [isLogin]);

  useEffect(() => {
    if (isLogin) {
      loadMyChatQuestions();
    }
  }, [isLogin, loadMyChatQuestions]);

  // 폼 성공 처리
  const handleFormSuccess = () => {
    setShowForm(false);
    loadMyChatQuestions(); // 목록 새로고침
  };

  // 폼 취소 처리 (FAQ 페이지로 이동)
  const handleFormCancel = () => {
    window.location.href = "/support/faq";
  };
  return (
    <BasicLayout>
      <ProtectedChat>
        <div className="max-w-7xl mx-auto p-6">
          {/* 바로 설문조사 폼 표시 */}
          {showForm ? (
            <ChatQuestionForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          ) : (
            // 폼 완료 후 화면
            <div>
              <div className="text-center py-12">
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  사전 질문이 완료되었습니다!
                </h2>
                <p className="text-gray-600 mb-8">
                  상담원이 곧 연결됩니다. 잠시만 기다려주세요.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors mr-4"
                  >
                    새 상담 시작
                  </button>

                  <button
                    onClick={() => (window.location.href = "/support/faq")}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    FAQ로 돌아가기
                  </button>
                </div>
              </div>

              {/* 상담 내역이 있으면 표시 */}
              {myChatQuestions.length > 0 && (
                <div className="mt-12 bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      최근 상담 내역
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {myChatQuestions.slice(0, 3).map((question) => (
                        <div
                          key={question.no}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>문의 유형:</strong> {question.q1}
                            </div>
                            <div>
                              <strong>문의 내용:</strong> {question.q2}
                            </div>
                            <div className="text-gray-500">
                              작성일:
                              {question.createdAt
                                ? new Date(
                                    question.createdAt
                                  ).toLocaleDateString()
                                : "날짜 없음"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ProtectedChat>
    </BasicLayout>
  );
};

export default ChatQuestionPage;
