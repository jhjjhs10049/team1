import React, { useEffect, useState } from "react";
import { fetchFavoriteGyms } from "../api/gymApi";
import { useNavigate } from "react-router-dom";
import { StarRating } from "../components/ReviewList";
import BasicLayout from "../../../layouts/BasicLayout";
import useCustomLogin from "../../member/login/hooks/useCustomLogin";

const FavoriteGymsPage = () => {
  const navigate = useNavigate();
  const { loginState } = useCustomLogin();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("FavoriteGymsPage: useEffect 실행");
    console.log("FavoriteGymsPage: loginState:", loginState);

    // ProtectedComponent로 이미 보호되고 있으므로, 여기서는 loginState.memberNo만 확인
    if (!loginState?.memberNo) {
      console.warn("FavoriteGymsPage: memberNo가 없어서 대기 중...");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchFavoriteGyms(loginState.memberNo)
      .then((data) => {
        console.log("FavoriteGymsPage: 즐겨찾기 목록 데이터", data);
        setFavorites(data);
      })
      .catch((err) => {
        console.error("FavoriteGymsPage: 즐겨찾기 호출 오류", err);
        if (err.response?.status === 401) {
          setError("권한이 없습니다. 다시 로그인해 주세요.");
        } else {
          setError("즐겨찾기 목록을 불러오는 데 실패했습니다.");
        }
      })
      .finally(() => {
        console.log("FavoriteGymsPage: 로딩 완료");
        setLoading(false);
      });
  }, [loginState]);

  if (loading)
    return (
      <BasicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-center">로딩 중...</div>
          </div>
        </div>
      </BasicLayout>
    );

  if (error)
    return (
      <BasicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-red-600 text-center">오류: {error}</div>
          </div>
        </div>
      </BasicLayout>
    );

  if (!loginState?.memberNo)
    return (
      <BasicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="text-center">로그인 정보를 확인하는 중...</div>
          </div>
        </div>
      </BasicLayout>
    );

  return (
    <BasicLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full max-w-6xl mx-auto px-4">
          {/* 페이지 헤더 */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 mb-8">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
              ⭐ 나의 즐겨찾기
            </h1>
            <div className="mt-4 text-center">
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto"></div>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-100 text-center">
              <div className="text-gray-400 text-6xl mb-4">⭐</div>
              <p className="text-gray-500 text-lg mb-4">
                즐겨찾기한 헬스장이 없습니다.
              </p>
              <p className="text-gray-400 text-sm">
                헬스장 상세 페이지에서 즐겨찾기를 추가해보세요!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">

              <div className="p-6">
                <div className="grid gap-4">
                  {favorites.map((gym) => (
                    <div
                      key={gym.gymNo}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate(`/gyms/detail/${gym.gymNo}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={gym.imageUrl || "/dumbbell.svg"}
                            alt={gym.title}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-200 group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.src = "/dumbbell.svg";
                              e.target.onerror = null;
                            }}
                          />
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            ⭐
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                              {gym.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <StarRating score={gym.rate} size={16} />
                              <span className="text-sm text-gray-600 font-medium">
                                ({Number(gym.rate).toFixed(1)})
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 flex items-center gap-2">
                            <span className="text-gray-400">📍</span>
                            {gym.address}
                          </p>
                        </div>

                        <div className="text-gray-400 group-hover:text-teal-500 transition-colors">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BasicLayout>
  );
};

export default FavoriteGymsPage;
