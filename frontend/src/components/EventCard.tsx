import React from 'react';
import { EventData } from './EventModal';

interface EventCardProps {
  event: EventData;
  onClick: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  work: 'bg-blue-100 text-blue-700',
  health: 'bg-green-100 text-green-700',
  gym: 'bg-orange-100 text-orange-700',
  social: 'bg-pink-100 text-pink-700',
  learning: 'bg-purple-100 text-purple-700',
  personal: 'bg-yellow-100 text-yellow-700',
};

function categoryColor(cat?: string) {
  if (!cat) return 'bg-gray-100 text-gray-600';
  return CATEGORY_COLORS[cat.toLowerCase()] || 'bg-indigo-100 text-indigo-700';
}

function fmt(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${h}:${m}`;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-xs"
    >
      <div className="font-semibold text-gray-800 truncate">{event.title}</div>
      <div className="flex flex-wrap items-center gap-1 mt-1">
        {(event.time_start || event.time_end) && (
          <span className="text-gray-500">
            {fmt(event.time_start)}{event.time_end ? `–${fmt(event.time_end)}` : ''}
          </span>
        )}
        {event.category && (
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${categoryColor(event.category)}`}>
            {event.category}
          </span>
        )}
        {event.points != null && (
          <span className="text-yellow-600 font-medium">🏆 {event.points}pts</span>
        )}
      </div>
    </button>
  );
}
