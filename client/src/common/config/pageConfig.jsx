/**
 * 📋 페이징 설정 상수 목록
 *
 * 1. BOARD_CONFIG      - 게시판 페이징 설정
 * 2. REPLY_CONFIG      - 댓글 페이징 설정
 * 3. ADMIN_CONFIG      - 관리자 페이징 설정
 * 4. SEARCH_CONFIG     - 검색 페이징 설정
 */

// ===== 1. 게시판 페이징 설정 =====
export const BOARD_CONFIG = {
  DEFAULT_PAGE: 0, // 기본 페이지 번호 (0부터 시작)
  DEFAULT_SIZE: 10, // 기본 페이지 크기
  MAX_SIZE: 50, // 최대 페이지 크기
  PAGE_GROUP_SIZE: 5, // 페이지 그룹 크기 (1 2 3 4 5)
};

// ===== 2. 댓글 페이징 설정 =====
export const REPLY_CONFIG = {
  DEFAULT_PAGE: 0, // 기본 페이지 번호 (0부터 시작)
  DEFAULT_SIZE: 20, // 기본 페이지 크기 (댓글은 많이)
  MAX_SIZE: 20, // 최대 페이지 크기
  PAGE_GROUP_SIZE: 3, // 페이지 그룹 크기 (1 2 3)
};

// ===== 3. 관리자 페이징 설정 =====
export const ADMIN_CONFIG = {
  DEFAULT_PAGE: 0, // 기본 페이지 번호
  DEFAULT_SIZE: 15, // 기본 페이지 크기 (관리자는 많이)
  MAX_SIZE: 100, // 최대 페이지 크기
  PAGE_GROUP_SIZE: 10, // 페이지 그룹 크기
};

// ===== 4. 검색 페이징 설정 =====
export const SEARCH_CONFIG = {
  DEFAULT_PAGE: 0, // 기본 페이지 번호
  DEFAULT_SIZE: 15, // 기본 페이지 크기 (검색은 많이)
  MAX_SIZE: 50, // 최대 페이지 크기
  PAGE_GROUP_SIZE: 7, // 페이지 그룹 크기
};

// ===== 공통 유틸리티 함수 =====
export const PAGE_UTILS = {
  // 페이지 번호 유효성 검사
  validatePage: (page, totalPages) => {
    const pageNum = Number(page);
    if (isNaN(pageNum) || pageNum < 0) return 0;
    if (pageNum >= totalPages && totalPages > 0) return totalPages - 1;
    return pageNum;
  },

  // 페이지 크기 유효성 검사
  validateSize: (size, maxSize) => {
    const sizeNum = Number(size);
    if (isNaN(sizeNum) || sizeNum < 1) return 10;
    if (sizeNum > maxSize) return maxSize;
    return sizeNum;
  },

  // 페이지 그룹 계산 (1, 2, 3, 4, 5 형태)
  calculatePageGroup: (currentPage, totalPages, groupSize) => {
    const groupStart = Math.floor(currentPage / groupSize) * groupSize;
    const groupEnd = Math.min(groupStart + groupSize, totalPages);

    return {
      start: groupStart,
      end: groupEnd,
      pages: Array.from(
        { length: groupEnd - groupStart },
        (_, i) => groupStart + i
      ),
      hasPrev: groupStart > 0,
      hasNext: groupEnd < totalPages,
    };
  },
};
