const ProgressBar = ({ ratio }) => {
    const pct = Math.max(0, Math.min(1, ratio)) * 100;
    return (
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
    );
}

export default ProgressBar;