import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicLayout from "../../../layouts/BasicLayout";
import { getLatestNotice, getLatestAd } from "../../board/api/boardApi";

const MainPage = () => {
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
  const navigate = useNavigate();
  // 오늘의 운동팁
  const [dailyTip, setDailyTip] = useState("불러오는 중...");

  // 최신 공지사항과 광고
  const [latestNotice, setLatestNotice] = useState(null);
  const [latestAd, setLatestAd] = useState(null);

  // AI 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routineGoal, setRoutineGoal] = useState("");
  const [routineResult, setRoutineResult] = useState("");
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(false);
  const [selectedGym, setSelectedGym] = useState("");
  // 오늘의 운동팁 호출
  useEffect(() => {
    async function fetchTip() {
      try {
        // TODO: 서버 프록시를 통해 Gemini API 호출
        setDailyTip("꾸준한 스트레칭은 부상의 위험을 줄여줍니다!");
      } catch {
        setDailyTip("운동 팁을 불러오지 못했습니다.");
      }
    }
    fetchTip();
  }, []);

  // 최신 공지사항과 광고 가져오기
  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const [notice, ad] = await Promise.all([
          getLatestNotice(),
          getLatestAd(),
        ]);
        setLatestNotice(notice);
        setLatestAd(ad);
      } catch (error) {
        console.error("최신 공지/광고 가져오기 실패:", error);
      }
    }
    fetchLatestPosts();
  }, []);

  const openRoutineModal = (gymName) => {
    setSelectedGym(gymName);
    setRoutineGoal("");
    setRoutineResult("");
    setIsModalOpen(true);
  };

  const generateRoutine = async () => {
    if (!routineGoal) return;
    setIsLoadingRoutine(true);
    setRoutineResult("");
    // TODO: 서버 프록시 통해 Gemini API 호출
    setTimeout(() => {
      setRoutineResult(
        `# 루틴 예시\n\n- 웜업: 러닝머신 10분\n- 메인: 스쿼트 3세트 × 12회\n- 쿨다운: 스트레칭 5분`
      );
      setIsLoadingRoutine(false);
    }, 1500);
  };
  return (
    <BasicLayout>
      <main className="max-w-7xl mx-auto p-6">
        {/* 히어로 */}
        <section className="text-center bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 mb-12">
          <h2 className="text-3xl font-bold mb-4">어디서 운동할까요?</h2>
          <p className="text-gray-600 mb-8">
            FitHub와 함께 내 주변 최고의 피트니스 센터를 찾아보세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {" "}
            <button
              onClick={() => navigate("/gyms/map")}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              지도로 찾기
            </button>
            <button
              onClick={() => navigate("/trainers")}
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              트레이너 찾기
            </button>
          </div>
        </section>
        {/* 오늘의 운동팁 */}
        <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 mb-12">
          <h2 className="text-2xl font-bold mb-4">✨ 오늘의 운동 팁</h2>
          <div className="bg-gray-100 p-4 rounded-lg min-h-[80px] flex items-center justify-center">
            <p>{dailyTip}</p>
          </div>
        </section>
        {/* 주변시설 리스트 (mock) */}
        <section className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 mb-12">
          <h3 className="text-xl font-bold mb-4 text-center">
            내 주변 피트니스 센터 목록
          </h3>
          <div className="space-y-4">
            {["파워 피트니스", "에너짐", "바디 채널"].map((gym, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold">{gym}</h4>
                  <p className="text-sm text-gray-600">
                    서울시 예시 주소 {idx + 1}
                  </p>
                </div>
                <button
                  onClick={() => openRoutineModal(gym)}
                  className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-black"
                >
                  ✨ AI 루틴 추천
                </button>
              </div>
            ))}
          </div>
        </section>
        {/* 공지사항 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">공지/광고</h2>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {/* 최신 공지사항 */}
              {latestNotice && (
                <li
                  className="p-4 hover:bg-orange-50 cursor-pointer transition-colors duration-200 flex items-center"
                  onClick={() => navigate(`/board/read/${latestNotice.bno}`)}
                >
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-bold mr-3">
                    공지
                  </span>
                  <span className="flex-1">{latestNotice.title}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(latestNotice.regDate)}
                  </span>
                </li>
              )}

              {/* 최신 광고 */}
              {latestAd && (
                <li
                  className="p-4 hover:bg-purple-50 cursor-pointer transition-colors duration-200 flex items-center"
                  onClick={() => navigate(`/board/read/${latestAd.bno}`)}
                >
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded font-bold mr-3">
                    광고
                  </span>
                  <span className="flex-1">{latestAd.title}</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(latestAd.regDate)}
                  </span>
                </li>
              )}

              {/* 공지사항과 광고가 모두 없는 경우 */}
              {!latestNotice && !latestAd && (
                <li className="p-4 text-center text-gray-500">
                  아직 공지사항이나 광고가 없습니다.
                </li>
              )}
            </ul>
            <div className="p-4 text-center bg-gray-50">
              <button
                onClick={() => navigate("/board")}
                className="text-teal-600 font-semibold hover:underline"
              >
                더보기
              </button>
            </div>
          </div>
        </section>
      </main>
      {/* AI 루틴 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">✨ AI 운동 루틴 생성</h3>
            <p className="mb-2">
              <strong>{selectedGym}</strong> 에서 진행할 운동 계획을 세워보세요.
            </p>
            <input
              type="text"
              value={routineGoal}
              onChange={(e) => setRoutineGoal(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-4"
              placeholder="예: 체중 감량, 근력 증가"
            />
            <button
              onClick={generateRoutine}
              disabled={isLoadingRoutine}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              루틴 생성하기
            </button>
            {isLoadingRoutine && (
              <p className="mt-4">AI가 루틴을 생성 중입니다...</p>
            )}
            {routineResult && (
              <pre className="mt-4 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                {routineResult}
              </pre>
            )}
          </div>
        </div>
      )}
    </BasicLayout>
  );
};

export default MainPage;
