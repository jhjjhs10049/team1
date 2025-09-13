import React from "react";
import ProgressBar from "./ProgressBar";

const WeeklyGoalSection = ({ weeklyGoal, weeklyRatio }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          <span className="text-xl">🎯</span>
          주간 목표
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">
            {weeklyGoal.donePercent}% / {weeklyGoal.targetPercent}%
          </span>
        </div>
      </div>
      <ProgressBar ratio={weeklyRatio} />
    </div>
  );
};

export default WeeklyGoalSection;
