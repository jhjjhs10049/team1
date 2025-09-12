import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useCustomLogin from "../../domain/member/login/hooks/useCustomLogin";
import { AdminManagerLink } from "../config/ProtectedAdmin";
import "./Header.css";

const BasicMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  //useSelector ? 애플리케이션의 상태를 받아서 자신이 원하는 상태 데이터를 선별(selector) 하는 용도
  //여기서는 컴포넌트가 로그인 상태가 변경되는것을 감지 한다. 동기 방식으로 동작 하므로 상태가 변경 되면 즉시 감지 한다.
  // loginState 에는 로그인 상태 정보가 즉시 저장 된다.
  const loginState = useSelector((state) => state.loginSlice); // store 상태(state)를 받아와서 그중에 loginSlice 를 사용

  const { doLogout, moveToPath } = useCustomLogin();

  // 외부 클릭 감지를 위한 useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        isMobileMenuOpen
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    doLogout();
    alert("로그아웃 되었습니다.");
    moveToPath("/");
    setIsMobileMenuOpen(false); // 모바일 메뉴 닫기
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  return (
    <>
      <nav id="navbar" className="bg-gray-700 w-full relative" ref={menuRef}>
        <div className="flex max-w-7xl mx-auto px-4 sm:px-6">
          {/* 데스크톱 메뉴 - 1025px 이상에서만 표시 */}
          <div className="desktop-menu hidden w-full items-center">
            {/* 왼쪽 영역 */}
            <div className="flex-1 flex justify-start">
              <div className="flex items-center py-4 text-white">
                <div className="pr-6 cursor-pointer font-bold text-lg">
                  <Link to="/">FitHub</Link>
                </div>
                <div className="pr-6 hover:underline cursor-pointer text-base">
                  <Link to="/gyms">헬스장</Link>
                </div>
                <div className="pr-6 hover:underline cursor-pointer text-base">
                  <Link to="/trainers">트레이너</Link>
                </div>
                <div className="pr-6 hover:underline cursor-pointer text-base">
                  <Link to="/scheduler">스케줄</Link>
                </div>
                <div className="pr-6 hover:underline cursor-pointer text-base">
                  <Link to="/board">게시판</Link>
                </div>
                <div className="pr-6 hover:underline cursor-pointer text-base">
                  <Link to="/multchat">채팅</Link>
                </div>
              </div>
            </div>
            {/* 오른쪽 영역 */}
            <div className="flex-1 flex justify-end">
              <div className="flex items-center py-4 text-white font-medium">
                {!loginState.email ? (
                  <>
                    <div className="pl-6 hover:underline cursor-pointer text-base">
                      <Link to={"/member/join"}>회원가입</Link>
                    </div>
                    <div className="pl-6 hover:underline cursor-pointer text-base">
                      <Link to={"/member/login"}>로그인</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pl-6 hover:underline cursor-pointer text-base">
                      <button onClick={handleLogout}>로그아웃</button>
                    </div>
                    <div className="pl-6 hover:underline cursor-pointer text-base">
                      <Link to={"/member/mypage"}>마이페이지</Link>
                    </div>
                    <div className="pl-6 hover:underline cursor-pointer text-base">
                      <Link to={"/gyms/favorites"}>즐겨찾기</Link>
                    </div>
                  </>
                )}
                <div className="pl-6 hover:underline cursor-pointer text-base">
                  <Link to={"/support/faq"}>고객센터</Link>
                </div>
                <AdminManagerLink to="/admin/chat">
                  <div className="pl-6 hover:underline cursor-pointer text-base">
                    관리자
                  </div>
                </AdminManagerLink>
              </div>
            </div>
          </div>
          {/* 모바일 헤더 - 1024px 이하에서만 표시 */}
          <div className="mobile-header hidden justify-between items-center w-full py-4">
            {/* 로고/브랜드 - 왼쪽 정렬 */}
            <div className="text-white font-bold text-xl flex-shrink-0">
              <Link to="/" onClick={closeMobileMenu}>
                FitHub
              </Link>
            </div>
            {/* 햄버거 메뉴 버튼 - 오른쪽 정렬 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-md hover:bg-gray-600 transition-colors flex-shrink-0"
              aria-label="메뉴 열기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* 모바일 슬라이드 메뉴 */}
        <div
          className={`mobile-menu hidden absolute top-full left-0 w-full bg-gray-700 border-t border-gray-600 z-50 overflow-hidden ${
            isMobileMenuOpen ? "open" : "closed"
          }`}
        >
          <div className="px-4 py-3 space-y-1">
            {/* 왼쪽 영역 메뉴들 */}
            <Link
              to="/gyms"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
            >
              헬스장
            </Link>
            <Link
              to="/trainers"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
            >
              트레이너
            </Link>
            <Link
              to="/scheduler"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
            >
              스케줄
            </Link>
            <Link
              to="/board"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
            >
              게시판
            </Link>
            <Link
              to="/multchat"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
            >
              채팅
            </Link>
            {/* 구분선 */}
            <hr className="border-gray-600 my-3" /> {/* 오른쪽 영역 메뉴들 */}
            {!loginState.email ? (
              <>
                <Link
                  to="/member/join"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  회원가입
                </Link>
                <Link
                  to="/member/login"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  로그인
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/member/mypage"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  마이페이지
                </Link>
                <Link
                  to="/gyms/favorites"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  즐겨찾기
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
                >
                  로그아웃
                </button>
              </>
            )}
            <Link
              to="/support/faq"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
            >
              고객센터
            </Link>
            <AdminManagerLink
              to="/admin/chat"
              onClick={closeMobileMenu}
              className="block px-4 py-3 text-white hover:bg-gray-600 rounded-md transition-colors"
            >
              관리자
            </AdminManagerLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BasicMenu;
