import React from "react";

const RoomListPagination = ({
    pagination,
    onPageChange
}) => {
    if (pagination.totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center space-x-2">
            <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
                이전
            </button>
            <span className="px-3 py-1">
                {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
                다음
            </button>
        </div>
    );
};

export default RoomListPagination;