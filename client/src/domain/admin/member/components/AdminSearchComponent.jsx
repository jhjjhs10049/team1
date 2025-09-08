import { useState } from "react";

const AdminSearchComponent = ({ onSearch, loading, userRole }) => {
  const [queryInput, setQueryInput] = useState("");
  const [searchType, setSearchType] = useState("all"); // 검색 타입 상태

  const handleSearch = () => {
    onSearch({
      keyword: queryInput.trim(),
      type: searchType,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 검색 옵션 (권한별로 다름)
  const getSearchOptions = () => {
    const baseOptions = [
      { value: "all", label: "전체" },
      { value: "email", label: "이메일" },
      { value: "nickname", label: "닉네임" },
      { value: "phone", label: "전화번호" },
      { value: "status", label: "상태" },
    ];

    // ADMIN만 권한별 검색 가능
    if (userRole === "ADMIN") {
      baseOptions.push({ value: "role", label: "권한" });
    }

    return baseOptions;
  };
  const searchOptions = getSearchOptions();
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* 검색 타입 선택 드롭다운 */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[120px] sm:w-auto"
          disabled={loading}
        >
          {searchOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 검색어 입력 */}
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder(searchType)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={loading}
        />

        {/* 버튼 그룹 */}
        <div className="flex gap-2 sm:flex-shrink-0">
          {/* 검색 버튼 */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading ? "검색 중..." : "검색"}
          </button>

          {/* 초기화 버튼 */}
          <button
            onClick={() => {
              setQueryInput("");
              setSearchType("all");
              onSearch({ keyword: "", type: "all" });
            }}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
};

// 검색 타입에 따른 플레이스홀더 텍스트
const getPlaceholder = (searchType) => {
  switch (searchType) {
    case "email":
      return "이메일 주소를 입력하세요";
    case "nickname":
      return "닉네임을 입력하세요";
    case "phone":
      return "전화번호를 입력하세요";
    case "status":
      return "상태를 입력하세요 (ACTIVE, BANNED, DELETED)";
    case "role":
      return "권한을 입력하세요 (USER, MANAGER, ADMIN)";
    default:
      return "검색어를 입력하세요";
  }
};

export default AdminSearchComponent;
