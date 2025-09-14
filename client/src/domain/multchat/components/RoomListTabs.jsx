import React from "react";

const RoomListTabs = ({
    currentTab,
    setCurrentTab,
    onCreateRoom
}) => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex space-x-1">
                <button
                    onClick={() => setCurrentTab("public")}
                    className={`px-4 py-2 rounded-lg font-medium border shadow-sm hover:shadow-md transition-all duration-200 ${currentTab === "public"
                            ? "bg-teal-500 text-white border-teal-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        }`}
                >
                    채팅방
                </button>
                <button
                    onClick={() => setCurrentTab("my")}
                    className={`px-4 py-2 rounded-lg font-medium border shadow-sm hover:shadow-md transition-all duration-200 ${currentTab === "my"
                            ? "bg-teal-500 text-white border-teal-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        }`}
                >
                    내 채팅방
                </button>
            </div>
            <button
                onClick={onCreateRoom}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium border border-teal-500 shadow-sm hover:shadow-md transition-all duration-200"
            >
                ➕ 채팅방 만들기
            </button>
        </div>
    );
};

export default RoomListTabs;