import { useState } from "react";

const BoardSearchComponent = ({ onSearch, loading }) => {
  const [queryInput, setQueryInput] = useState("");
  const [searchType, setSearchType] = useState("all"); // 검색 타입 상태 추가

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

  const searchOptions = [
    { value: "all", label: "제목+내용" },
    { value: "title", label: "제목" },
    { value: "content", label: "내용" },
    { value: "writer", label: "글쓴이" },
  ];

  return (
    <div className="mb-6 flex gap-2">
      {/* 검색 타입 선택 드롭다운 */}
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[120px]"
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
        placeholder="검색어를 입력하세요"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        disabled={loading}
      />

      {/* 검색 버튼 */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
      >
        검색
      </button>
    </div>
  );
};

export default BoardSearchComponent;
