const StatCard = ({ label, value, onClick }) => {
    return (
        <div
            className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-teal-300 transition-all duration-200 transform hover:-translate-y-0.5"
            onClick={onClick}
        >
            <div className="flex flex-col space-y-2">
                <div className="text-sm font-medium text-gray-600 group-hover:text-teal-600 transition-colors">
                    {label}
                </div>
                <div className="text-2xl font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
                    {value}
                </div>
            </div>
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="text-xs text-teal-600 font-medium">클릭하여 수정</div>
            </div>
        </div>
    );
}

export default StatCard;