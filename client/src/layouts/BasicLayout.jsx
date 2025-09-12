import BasicMenu from "../common/menus/Header.jsx";
import Footer from "../common/menus/Footer.jsx";
import ScrollToTop from "../common/components/ScrollToTop.jsx";
import useForcedLogoutListener from "../common/hooks/useForcedLogoutListener.jsx";
import useTokenExpiryChecker from "../common/hooks/useTokenExpiryChecker.jsx";
import useNavigationTokenChecker from "../common/hooks/useNavigationTokenChecker.jsx";

const BasicLayout = ({ children, noMargin = false }) => {
  // 전역 강제 로그아웃 리스너 활성화
  useForcedLogoutListener();

  // 페이지 이동 시 토큰 만료 체크
  useTokenExpiryChecker();

  // 브라우저 네비게이션 시 토큰 만료 체크
  useNavigationTokenChecker();

  return (
    <>
      <ScrollToTop />
      <BasicMenu />
      <div
        className={`bg-white w-full flex flex-col ${noMargin ? "" : "py-8"}`}
      >
        <main className="min-h-screen">{children}</main>
      </div>
      <Footer />
    </>
  );
};
export default BasicLayout;
