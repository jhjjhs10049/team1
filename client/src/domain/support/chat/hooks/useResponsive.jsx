import { useState, useEffect } from "react";

/**
 * 화면 크기 감지를 위한 커스텀 훅
 */
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(false); // 데스크톱에서는 사이드바 항상 표시
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return {
    isMobile,
    showSidebar,
    setShowSidebar,
  };
};

export default useResponsive;
