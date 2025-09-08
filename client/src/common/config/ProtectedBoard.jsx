import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useCustomLogin from "../../domain/member/login/hooks/useCustomLogin";
import alertManager from "../../domain/member/util/alertManager";

/**
 * 📋 게시판 권한 보호 컴포넌트 목록
 *
 * 1. LoginRequiredButton      - 로그인 필요한 버튼 (글쓰기 등)
 * 2. AuthorOnlyLink          - 작성자만 접근 가능한 링크 (수정)
 * 3. AuthorOnlyComponent     - 작성자만 접근 가능한 컴포넌트 래퍼 (수정 페이지)
 * 4. AuthorOrAdminButton     - 작성자 또는 관리자만 사용 가능한 버튼 (삭제)
 */

// ===== 1. 로그인 필요 컴포넌트들 =====

/**
 * 1. 로그인한 사용자만 사용할 수 있는 버튼
 * 주용도: 게시글 작성, 댓글 작성 등
 */
const LoginRequiredButton = ({
  children,
  onClick,
  noAuthMessage = "로그인이 필요합니다.",
  className = "",
  disabled = false,
  ...props
}) => {
  const { isLogin, moveToLogin } = useCustomLogin();

  const handleClick = (e) => {
    if (!isLogin) {
      e.preventDefault();
      alertManager.showAlert(noAuthMessage);
      moveToLogin();
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

// ===== 2. 작성자 전용 컴포넌트들 =====

/**
 * 2. 작성자만 클릭 가능한 링크
 * 주용도: 게시글 수정 링크, 댓글 수정 링크
 */
const AuthorOnlyLink = ({
  children,
  authorEmail,
  to,
  className = "",
  noAuthMessage = "로그인이 필요합니다.",
  noPermissionMessage = "작성자만 접근할 수 있습니다.",
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

    const userEmail = loginState?.email;
    const isAuthor = userEmail === authorEmail;

    if (!isAuthor) {
      e.preventDefault();
      alertManager.showAlert(noPermissionMessage);
      return;
    }
  };

  // 로그인되지 않거나 권한이 없으면 링크 숨김
  if (!isLogin) {
    return null;
  }

  const userEmail = loginState?.email;
  const isAuthor = userEmail === authorEmail;

  if (!isAuthor) {
    return null;
  }

  return (
    <Link {...props} to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

/**
 * 3. 작성자만 접근 가능한 컴포넌트 래퍼
 * 주용도: 게시글 수정 페이지 전체 보호
 */
const AuthorOnlyComponent = ({
  children,
  authorEmail,
  fallback = null,
  noAuthMessage = "로그인이 필요합니다.",
  noPermissionMessage = "작성자만 접근할 수 있습니다.",
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

      const userEmail = loginState?.email;
      const isAuthor = userEmail === authorEmail;

      if (!isAuthor) {
        alertManager.showAlert(noPermissionMessage);
        moveToPath("/");
        return;
      }
    }
  }, [
    isLogin,
    loginState,
    authorEmail,
    noAuthMessage,
    noPermissionMessage,
    redirectOnNoAuth,
    moveToLogin,
    moveToPath,
  ]);

  if (!isLogin) {
    return fallback;
  }

  const userEmail = loginState?.email;
  const isAuthor = userEmail === authorEmail;

  if (!isAuthor) {
    return fallback;
  }

  return children;
};

// ===== 4. 작성자 또는 관리자 컴포넌트들 =====

/**
 * 4. 작성자 또는 관리자만 사용 가능한 버튼
 * 주용도: 게시글 삭제, 댓글 삭제
 */
const AuthorOrAdminButton = ({
  children,
  authorEmail,
  onClick,
  className = "",
  disabled = false,
  noAuthMessage = "로그인이 필요합니다.",
  noPermissionMessage = "작성자 또는 관리자만 접근할 수 있습니다.",
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

    const userEmail = loginState?.email;
    const userRole = loginState?.roleNames?.[0];
    const isAuthor = userEmail === authorEmail;
    const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";

    if (!isAuthor && !isAdminOrManager) {
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
  const userEmail = loginState?.email;
  const userRole = loginState?.roleNames?.[0];
  const isAuthor = userEmail === authorEmail;
  const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";
  const hasPermission = isAuthor || isAdminOrManager;

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

// ===== 5. 관리자/매니저 전용 컴포넌트들 =====

/**
 * 5. 관리자/매니저만 사용 가능한 버튼
 * 주용도: 공지사항 작성, 관리자 기능
 */
const ManagerAdminButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  noAuthMessage = "로그인이 필요합니다.",
  noPermissionMessage = "관리자 또는 매니저만 접근할 수 있습니다.",
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
    const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";

    if (!isAdminOrManager) {
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
  const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";

  if (!isAdminOrManager) {
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

// ===== Export =====
export {
  LoginRequiredButton, // 1. 로그인 필요
  AuthorOnlyLink, // 2. 작성자만 (수정 링크)
  AuthorOnlyComponent, // 3. 작성자만 (페이지 래퍼)
  AuthorOrAdminButton, // 4. 작성자+관리자 (삭제 버튼)
  ManagerAdminButton, // 5. 관리자/매니저만 (공지사항 작성)
};
