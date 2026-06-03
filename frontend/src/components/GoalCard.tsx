import React from 'react';

export interface GoalData {
  id?: number;
  title: string;
  category?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  year?: number;
  deadline?: string;
}

interface GoalCardProps {
  goal: GoalData;
  onClick: () => void;
}

export default function GoalCard({ goal, onClick }: GoalCardProps) {
  const pct = goal.target_value && goal.target_value > 0
    ? Math.min(100, Math.round(((goal.current_value ?? 0) / goal.target_value) * 100))
    : null;

  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{goal.title}</h3>
        {goal.category && (
          <span className="shrink-0 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
            {goal.category}
          </span>
        )}
      </div>

      {goal.target_value != null && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{goal.current_value ?? 0}{goal.unit ? ` ${goal.unit}` : ''}</span>
            <span>{goal.target_value}{goal.unit ? ` ${goal.unit}` : ''} goal</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct ?? 0}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-400 mt-0.5">{pct ?? 0}%</div>
        </div>
      )}

      {goal.deadline && (
        <div className="text-xs text-gray-400 mt-1">Deadline: {goal.deadline.slice(0, 10)}</div>
      )}
    </button>
  );
}
