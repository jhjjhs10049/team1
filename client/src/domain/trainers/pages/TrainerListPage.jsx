import React, { useEffect, useState } from "react";
import BasicLayout from "../../../layouts/BasicLayout";
import { fetchTrainers } from "../api/trainerApi.jsx";
import { useNavigate } from "react-router-dom";
import { API_SERVER_HOST } from "../../global/api/axios";

const TrainerListPage = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTrainers();
        if (!alive) return;
        setTrainers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("[TrainerListPage] load error:", e);
        setErr("트레이너 목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);
  if (loading)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </BasicLayout>
    );

  if (err)
    return (
      <BasicLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg text-red-600">{err}</div>
        </div>
      </BasicLayout>
    );

  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          {/* 페이지 헤더 */}
          <div className="bg-white rounded-lg p-8 mb-8 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
              트레이너 목록
            </h1>
            <div className="mt-4 text-center">
              <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto"></div>
            </div>
          </div>

          {/* 트레이너 목록 */}
          {trainers.length === 0 ? (
            <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏋️</span>
                </div>
                <p className="text-lg text-gray-500">
                  등록된 트레이너가 없습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((t) => (
                <div
                  key={t.trainerNo}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-teal-200"
                  onClick={() => navigate(`/trainers/detail/${t.trainerNo}`)}
                >
                  {/* 트레이너 이미지 */}
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                    <img
                      src={
                        t.photo
                          ? `${API_SERVER_HOST}/api/files/view/${encodeURIComponent(
                              t.photo
                            )}`
                          : "/dumbbell.svg"
                      }
                      alt={t.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/dumbbell.svg";
                        e.target.onerror = null;
                      }}
                    />
                  </div>

                  {/* 트레이너 정보 */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {t.name}
                    </h3>

                    {t.specialty && (
                      <div className="flex flex-wrap gap-2">
                        {t.specialty.split(",").map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200"
                          >
                            {spec.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {t.gymTitle && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🏢</span>
                        <span>{t.gymTitle}</span>
                      </div>
                    )}

                    {t.rate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>⭐</span>
                        <span>{Number(t.rate).toFixed(1)} / 5</span>
                      </div>
                    )}
                  </div>

                  {/* 상세보기 버튼 */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full py-2 text-teal-600 font-medium text-sm hover:text-teal-700 transition-colors">
                      상세보기 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BasicLayout>
  );
};

export default TrainerListPage;
