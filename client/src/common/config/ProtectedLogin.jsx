import { useEffect } from "react";
import useCustomLogin from "../../domain/member/login/hooks/useCustomLogin";

/**
 * 📋 로그인 보호 컴포넌트 목록
 *
 * 1. ProtectedComponent       - 로그인 필요한 컴포넌트 래퍼 (마이페이지, 게시글 작성 등)
 * 2. ProtectedButton          - 로그인 필요한 버튼 (기능 실행 버튼)
 * 3. ProtectedLink            - 로그인 필요한 링크 (마이페이지 링크 등)
 * 4. ProtectedChat            - 로그인 필요한 채팅 컴포넌트 (1대1 채팅 문의)
 */

// ===== 1. 로그인 필요 컴포넌트 =====

/**
 * 1. 로그인이 필요한 컴포넌트 래퍼
 * 주용도: 마이페이지, 게시글 작성 페이지 등 전체 보호
 */
const ProtectedComponent = ({
  children,
  redirectMessage = "이 기능을 사용하시려면 로그인이 필요합니다.",
}) => {
  const { isLogin, moveToLogin } = useCustomLogin();

  useEffect(() => {
    if (!isLogin) {
      alert(redirectMessage);
      moveToLogin();
    }
  }, [isLogin, moveToLogin, redirectMessage]);

  // 로그인되지 않은 경우 null 반환 (리다이렉트 진행 중)
  if (!isLogin) {
    return null;
  }

  return children;
};

// ===== 2. 로그인 필요 버튼 =====

/**
 * 2. 로그인이 필요한 버튼
 * 주용도: 기능 실행 버튼 (좋아요, 북마크 등)
 */
const ProtectedButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  redirectMessage = "이 기능을 사용하시려면 로그인이 필요합니다.",
  ...props
}) => {
  const { isLogin, moveToLogin } = useCustomLogin();

  const handleClick = (e) => {
    if (!isLogin) {
      e.preventDefault();
      alert(redirectMessage);
      moveToLogin();
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

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

// ===== 3. 로그인 필요 링크 =====

/**
 * 3. 로그인이 필요한 링크
 * 주용도: 마이페이지 링크, 프로필 링크 등
 */
const ProtectedLink = ({
  children,
  to,
  className = "",
  redirectMessage = "이 페이지는 로그인이 필요합니다.",
  ...props
}) => {
  const { isLogin, moveToLogin, moveToPath } = useCustomLogin();

  const handleClick = (e) => {
    e.preventDefault();

    if (!isLogin) {
      alert(redirectMessage);
      moveToLogin();
      return;
    }

    moveToPath(to);
  };

  return (
    <a {...props} href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};

// ===== 4. 로그인 필요 채팅 컴포넌트 =====

/**
 * 4. 로그인이 필요한 채팅 컴포넌트
 * 주용도: 1대1 채팅 문의
 */
const ProtectedChat = ({
  children,
  redirectMessage = "1대1 채팅 문의를 이용하시려면 로그인이 필요합니다.",
}) => {
  const { isLogin, moveToLogin } = useCustomLogin();

  useEffect(() => {
    if (!isLogin) {
      alert(redirectMessage);
      moveToLogin();
    }
  }, [isLogin, moveToLogin, redirectMessage]);

  // 로그인되지 않은 경우 null 반환 (리다이렉트 진행 중)
  if (!isLogin) {
    return null;
  }

  // 로그인된 경우 자식 컴포넌트 렌더링
  return children;
};

// ===== Export =====
export {
  ProtectedComponent, // 1. 로그인 필요 페이지 래퍼
  ProtectedButton, // 2. 로그인 필요 기능 버튼
  ProtectedLink, // 3. 로그인 필요 링크
  ProtectedChat, // 4. 로그인 필요 채팅 컴포넌트
};
