import React, { useEffect } from "react";
import useCustomLogin from "../../domain/member/login/hooks/useCustomLogin";
import alertManager from "../../domain/member/util/alertManager";

/**
 * 📋 관리자 권한 보호 컴포넌트 목록
 *
 * 1. AdminManagerComponent     - ADMIN/MANAGER만 접근 가능한 컴포넌트 래퍼 (관리자 페이지)
 * 2. AdminManagerButton        - ADMIN/MANAGER만 사용 가능한 버튼 (관리자 기능)
 * 3. AdminManagerLink          - ADMIN/MANAGER만 사용 가능한 링크 (관리자 메뉴)
 */

// ===== 1. 관리자 페이지 컴포넌트 =====

/**
 * 1. ADMIN, MANAGER 권한이 필요한 컴포넌트 래퍼
 * 주용도: 관리자 페이지 전체 보호
 */
const AdminManagerComponent = ({
  children,
  fallback = null,
  noAuthMessage = "로그인이 필요합니다.",
  noPermissionMessage = "관리자 권한이 필요합니다.",
  redirectOnNoAuth = false,
}) => {
  const { isLogin, loginState, moveToLogin, moveToPath } = useCustomLogin();

  useEffect(() => {
    if (redirectOnNoAuth) {
      if (!isLogin) {
        alertManager.showAlert(noAuthMessage);
        moveToLogin();
        return;
      }

      const userRole = loginState?.roleNames?.[0];
      if (userRole !== "ADMIN" && userRole !== "MANAGER") {
        alertManager.showAlert(noPermissionMessage);
        moveToPath("/");
        return;
      }
    }
  }, [
    isLogin,
    loginState,
    noAuthMessage,
    noPermissionMessage,
    redirectOnNoAuth,
    moveToLogin,
    moveToPath,
  ]);

  if (!isLogin) {
    return fallback;
  }

  const userRole = loginState?.roleNames?.[0];
  const hasPermission = userRole === "ADMIN" || userRole === "MANAGER";

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

// ===== 2. 관리자 기능 버튼 =====

/**
 * 2. ADMIN, MANAGER 권한이 필요한 버튼
 * 주용도: 관리자 기능 버튼 (회원 정지, 권한 변경 등)
 */
const AdminManagerButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  noAuthMessage = "로그인이 필요합니다.",
  noPermissionMessage = "관리자 권한이 필요합니다.",
  ...props
}) => {
  const { isLogin, loginState, moveToLogin } = useCustomLogin();

  const handleClick = (e) => {
    if (!isLogin) {
      e.preventDefault();
      alertManager.showAlert(noAuthMessage);
      moveToLogin();
      return;
    }

    const userRole = loginState?.roleNames?.[0];
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
      e.preventDefault();
      alertManager.showAlert(noPermissionMessage);
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  // 로그인되지 않은 경우 버튼 숨김
  if (!isLogin) {
    return null;
  }

  // 권한 확인
  const userRole = loginState?.roleNames?.[0];
  const hasPermission = userRole === "ADMIN" || userRole === "MANAGER";

  if (!hasPermission) {
    return null;
  }

  return (
    <button
      {...props}
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// ===== 3. 관리자 메뉴 링크 =====

/**
 * 3. ADMIN, MANAGER 권한이 필요한 링크
 * 주용도: 관리자 메뉴 링크
 */
const AdminManagerLink = ({
  children,
  to,
  className = "",
  onClick,
  noAuthMessage = "로그인이 필요합니다.",
  noPermissionMessage = "관리자 권한이 필요합니다.",
  ...props
}) => {
  const { isLogin, loginState, moveToLogin, moveToPath } = useCustomLogin();
  const handleClick = (e) => {
    e.preventDefault();

    if (!isLogin) {
      alertManager.showAlert(noAuthMessage);
      moveToLogin();
      return;
    }

    const userRole = loginState?.roleNames?.[0];
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
      alertManager.showAlert(noPermissionMessage);
      return;
    }

    // 외부에서 전달된 onClick 핸들러 실행
    if (onClick) {
      onClick(e);
    }

    moveToPath(to);
  };

  // 로그인되지 않은 경우 링크 숨김
  if (!isLogin) {
    return null;
  }

  // 권한 확인
  const userRole = loginState?.roleNames?.[0];
  const hasPermission = userRole === "ADMIN" || userRole === "MANAGER";

  if (!hasPermission) {
    return null;
  }

  return (
    <a {...props} href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};

// ===== Export =====
export {
  AdminManagerComponent, // 1. 관리자 페이지 래퍼
  AdminManagerButton, // 2. 관리자 기능 버튼
  AdminManagerLink, // 3. 관리자 메뉴 링크
};
