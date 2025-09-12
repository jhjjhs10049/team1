const ProgressBar = ({ ratio }) => {
    const pct = Math.max(0, Math.min(1, ratio)) * 100;
    const isComplete = pct >= 100;
    
    return (
        <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                        isComplete 
                            ? "bg-gradient-to-r from-green-400 to-green-500" 
                            : "bg-gradient-to-r from-teal-400 to-teal-500"
                    }`} 
                    style={{ width: `${pct}%` }} 
                />
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">진행률</span>
                <span className={`font-semibold ${isComplete ? "text-green-600" : "text-teal-600"}`}>
                    {pct.toFixed(1)}%
                    {isComplete && " 🎉"}
                </span>
            </div>
        </div>
    );
}

export default ProgressBar;