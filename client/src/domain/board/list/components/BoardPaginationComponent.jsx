import { PAGE_UTILS } from "../../../../common/config/pageConfig";

const BoardPaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  pageConfig,
}) => {
  const pageGroup = PAGE_UTILS.calculatePageGroup(
    currentPage,
    totalPages,
    pageConfig?.PAGE_GROUP_SIZE || 5
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(0)}
        disabled={currentPage === 0}
        className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        처음
      </button>
      {pageGroup.hasPrev && (
        <button
          onClick={() => onPageChange(pageGroup.start - 1)}
          className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
        >
          ...
        </button>
      )}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>
      {pageGroup.pages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-2 text-sm border rounded ${
            currentPage === pageNum
              ? "bg-teal-500 text-white"
              : "hover:bg-gray-50"
          }`}
        >
          {pageNum + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
      {pageGroup.hasNext && (
        <button
          onClick={() => onPageChange(pageGroup.end)}
          className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
        >
          ...
        </button>
      )}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        마지막
      </button>
    </div>
  );
};

export default BoardPaginationComponent;
