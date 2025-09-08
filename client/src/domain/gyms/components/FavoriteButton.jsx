const FavoriteButton = ({ gymNo, isFavorite, onToggle }) => (
    <button onClick={() => onToggle(gymNo)}>
        {isFavorite ? "★ 즐겨찾기됨" : "☆ 즐겨찾기"}
    </button>
);