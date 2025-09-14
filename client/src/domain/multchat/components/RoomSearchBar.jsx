import React from "react";

const RoomSearchBar = ({
    searchKeyword,
    setSearchKeyword,
    onSearch,
    currentTab
}) => {
    // 공개 채팅방 탭에서만 검색 표시
    if (currentTab !== "public") {
        return null;
    }

    return (
        <form onSubmit={onSearch} className="flex space-x-2">
            <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="채팅방 이름을 검색하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
            />
            <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg border border-teal-500 shadow-sm hover:shadow-md transition-all duration-200"
            >
                검색
            </button>
        </form>
    );
};

export default RoomSearchBar;