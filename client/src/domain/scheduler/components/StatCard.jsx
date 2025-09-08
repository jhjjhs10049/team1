const StatCard = ({ label, value, onClick }) => {
    return (
        <div
            className="p-4 rounded-xl border shadow-sm cursor-pointer hover:bg-gray-50"
            onClick={onClick}
        >
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-xl font-bold mt-1">{value}</div>
        </div>
    );
}

export default StatCard;