const FavoriteButton = ({ gymNo, isFavorite, onToggle }) => (
  <button
    onClick={() => onToggle(gymNo)}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      isFavorite
        ? "bg-teal-500 text-white hover:bg-teal-600"
        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
    }`}
  >
    {isFavorite ? "★ 즐겨찾기됨" : "☆ 즐겨찾기"}
  </button>
);

export default FavoriteButton;
