import { useState } from "react";

const ChatAdminSearchComponent = ({ onSearch, loading, onFilterByStatus }) => {
  const [queryInput, setQueryInput] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    onFilterByStatus(status);
  };
  // 검색 옵션
  const searchOptions = [
    { value: "all", label: "전체" },
    { value: "admin", label: "관리자" },
    { value: "email", label: "이메일" },
    { value: "nickname", label: "닉네임" },
  ];
  // 상태 필터 옵션
  const statusOptions = [
    { value: "all", label: "전체", color: "bg-gray-100 text-gray-700" },
    { value: "WAITING", label: "대기", color: "bg-yellow-100 text-yellow-700" },
    { value: "ACTIVE", label: "상담중", color: "bg-teal-100 text-teal-700" },
    { value: "ENDED", label: "완료", color: "bg-green-100 text-green-700" },
    { value: "REJECTED", label: "거절", color: "bg-red-100 text-red-700" },
  ];
  const getPlaceholder = (searchType) => {
    switch (searchType) {
      case "admin":
        return "관리자 이메일을 입력하세요";
      case "email":
        return "고객 이메일 주소를 입력하세요";
      case "nickname":
        return "고객 닉네임을 입력하세요";
      default:
        return "검색어를 입력하세요";
    }
  };
  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {/* 상태 필터 버튼들 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상태별 필터
        </label>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusFilterChange(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === option.value
                  ? option.color + " ring-2 ring-offset-2 ring-teal-500"
                  : option.color + " hover:opacity-80"
              }`}
              disabled={loading}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {/* 검색 영역 */}
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
              setStatusFilter("all");
              onSearch({ keyword: "", type: "all" });
              onFilterByStatus("all");
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

export default ChatAdminSearchComponent;
